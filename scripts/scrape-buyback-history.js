#!/usr/bin/env node

/**
 * Scrape buyback prices from logammulia.com and save to Supabase
 * Usage: node scripts/scrape-buyback-history.js
 * Run locally (not on Vercel)
 */

import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import readline from "readline";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use admin key from env, fallback to anon key
const SUPABASE_KEY = process.env.SUPABASE_ADMIN_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Interactive prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function scrapeLogamMulia() {
  console.log("🚀 Starting scrape of logammulia.com...\n");

  // Get user ID
  const userId = await prompt("📝 Enter your Supabase user ID: ");
  if (!userId.trim()) {
    console.error("❌ User ID is required");
    rl.close();
    process.exit(1);
  }

  rl.close();

  const browser = await chromium.launch({ headless: true });
  // Logammulia appears to block default Playwright headless UA from CI IPs,
  // so masquerade as a real Chrome on Linux/macOS.
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 900 },
    locale: "id-ID",
  });
  const page = await context.newPage();

  try {
    // Navigate to the page
    console.log("\n📄 Loading logammulia.com/id/sell/gold...");
    await page.goto("https://www.logammulia.com/id/sell/gold", {
      waitUntil: "load",
      timeout: 30000,
    });

    // Wait for chart elements
    console.log("⏳ Waiting for chart to load...");
    await page.waitForSelector("canvas, svg", { timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    // Poll until Highcharts has actual series data, not just a rendered shell.
    // The chart selector can resolve before the series payload arrives.
    await page
      .waitForFunction(
        () => {
          const c = window.Highcharts?.charts?.find?.((x) => x);
          const data = c?.options?.series?.[0]?.data || c?.series?.[0]?.data;
          return Array.isArray(data) && data.filter((p) => p !== null).length > 100;
        },
        { timeout: 30000 }
      )
      .catch(() => {});

    // Extract chart data
    console.log("📊 Extracting price data from chart...");
    const priceData = await page.evaluate(() => {
      // Strategy 1: Highcharts options.series (current format)
      if (window.Highcharts?.charts?.[0]) {
        const chart = window.Highcharts.charts[0];
        if (chart.options?.series?.[0]?.data) {
          const data = chart.options.series[0].data;
          return data.map((point) => {
            // Data is [timestamp, price] format
            if (Array.isArray(point) && point.length >= 2) {
              return {
                date: new Date(point[0]).toISOString().split("T")[0],
                price: Math.round(point[1]),
              };
            }
            return null;
          }).filter(p => p !== null);
        }

        // Fallback to chart.series if options doesn't work
        if (chart.series?.[0]?.data) {
          return chart.series[0].data
            .filter(p => p !== null)
            .map((point) => ({
              date: point.x ? new Date(point.x).toISOString().split("T")[0] : null,
              price: point.y,
            }))
            .filter(p => p.date && p.price);
        }
      }

      // Strategy 2: Check for global data variables
      for (const key in window) {
        if (
          typeof window[key] === "object" &&
          window[key]?.data?.some?.((item) => item.date && item.price)
        ) {
          return window[key].data.map((item) => ({
            date: item.date,
            price: item.price,
          }));
        }
      }

      return null;
    });

    if (!priceData || (Array.isArray(priceData) && priceData.length === 0)) {
      console.error("❌ Could not auto-extract chart data");
      await page.screenshot({ path: "logammulia-screenshot.png", fullPage: true }).catch(() => {});
      const html = await page.content().catch(() => "");
      const fs = await import("fs");
      fs.writeFileSync("logammulia-page.html", html);
      const diag = await page.evaluate(() => ({
        title: document.title,
        url: location.href,
        bodyLength: document.body?.innerText?.length || 0,
        bodyPreview: (document.body?.innerText || "").slice(0, 500),
        hasHighcharts: typeof window.Highcharts !== "undefined",
        chartCount: window.Highcharts?.charts?.filter?.((c) => c).length || 0,
      })).catch((e) => ({ error: e.message }));
      console.error("Diagnostics:", JSON.stringify(diag, null, 2));
      process.exitCode = 1;
      return;
    }

    // Filter valid records
    const validRecords = priceData.filter(
      (item) =>
        item.date &&
        item.price &&
        typeof item.price === "number" &&
        item.price > 0
    );

    if (validRecords.length === 0) {
      console.error("❌ No valid price data extracted");
      process.exitCode = 1;
      return;
    }

    // Add user_id and prepare for Supabase
    const records = validRecords.map((item) => ({
      user_id: userId.trim(),
      date: item.date,
      buyback_price: item.price,
    }));

    // Remove duplicates (by date)
    const uniqueRecords = Array.from(
      new Map(records.map((item) => [item.date, item])).values()
    );

    console.log(
      `\n✅ Extracted ${uniqueRecords.length} price records from chart`
    );
    console.log("Sample data:");
    uniqueRecords.slice(0, 3).forEach((r) => {
      console.log(`  ${r.date}: Rp ${r.buyback_price.toLocaleString("id-ID")}`);
    });

    // Save to Supabase
    console.log(`\n📝 Saving ${uniqueRecords.length} records to Supabase...`);
    const { error } = await supabase
      .from("antam_buyback_prices")
      .upsert(uniqueRecords, { onConflict: "user_id,date" });

    if (error) {
      console.error("❌ Error saving to Supabase:", error.message);
      process.exitCode = 1;
      return;
    }


    console.log(
      `\n🎉 Success! Saved ${uniqueRecords.length} buyback price records`
    );
    console.log("📊 Check your app to see the imported data");
  } catch (error) {
    console.error("❌ Scraping error:", error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

scrapeLogamMulia();

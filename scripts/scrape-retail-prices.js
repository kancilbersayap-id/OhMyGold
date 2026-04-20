#!/usr/bin/env node

/**
 * Scrape retail gold prices from galeri24.co.id
 * Usage: node scripts/scrape-retail-prices.js
 * Scrapes: Galeri 24 and Antam prices (weight, harga_jual, harga_buyback)
 */

import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ADMIN_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function scrapeRetailPrices() {
  console.log("🚀 Starting scrape of galeri24.co.id...\n");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("📄 Loading galeri24.co.id/harga-emas...");
    await page.goto("https://galeri24.co.id/harga-emas", {
      waitUntil: "load",
      timeout: 30000,
    });

    console.log("⏳ Waiting for price data to load...");
    // Wait for content with "Harga GALERI 24" or "Harga ANTAM"
    await page.waitForFunction(
      () => document.body.innerText.includes("Harga GALERI 24"),
      { timeout: 15000 }
    );
    await page.waitForTimeout(2000);

    console.log("📊 Extracting price data from page...");
    const priceData = await page.evaluate(() => {
      const textContent = document.body.innerText;
      const lines = textContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const results = {
        galeri24: [],
        antam: [],
      };

      let i = 0;
      while (i < lines.length) {
        // Look for section headers
        if (lines[i].includes("Harga GALERI 24")) {
          i++;
          // Skip "Berat", "Harga Jual", "Harga Buyback" headers
          while (i < lines.length && !lines[i].match(/^\d/)) {
            i++;
          }

          // Extract rows until we hit next section
          while (i < lines.length && !lines[i].includes("Harga")) {
            const weight = lines[i];
            const harga_jual = lines[i + 1];
            const harga_buyback = lines[i + 2];

            if (
              weight &&
              harga_jual &&
              harga_buyback &&
              weight.match(/^[\d.]+$/) &&
              harga_jual.includes("Rp") &&
              harga_buyback.includes("Rp")
            ) {
              results.galeri24.push({
                weight,
                harga_jual,
                harga_buyback,
              });
              i += 3;
            } else {
              break;
            }
          }
        } else if (
          lines[i].includes("Harga ANTAM") &&
          !lines[i].includes("MULIA")
        ) {
          i++;
          // Skip headers
          while (i < lines.length && !lines[i].match(/^\d/)) {
            i++;
          }

          // Extract rows
          while (i < lines.length && !lines[i].includes("Harga")) {
            const weight = lines[i];
            const harga_jual = lines[i + 1];
            const harga_buyback = lines[i + 2];

            if (
              weight &&
              harga_jual &&
              harga_buyback &&
              weight.match(/^[\d.]+$/) &&
              harga_jual.includes("Rp") &&
              harga_buyback.includes("Rp")
            ) {
              results.antam.push({
                weight,
                harga_jual,
                harga_buyback,
              });
              i += 3;
            } else {
              break;
            }
          }
        } else {
          i++;
        }
      }

      return results;
    });

    // Parse prices (remove "Rp" and dots, convert to number)
    const parsePriceString = (str) => {
      if (typeof str !== "string") return 0;
      return parseInt(str.replace(/Rp\.?|\./g, "").trim(), 10);
    };

    const parseWeight = (w) => {
      if (typeof w === "number") return w;
      return parseFloat(w);
    };

    // Prepare records
    const today = new Date().toISOString().split("T")[0];
    const recordsMap = new Map(); // Deduplicate by date,vendor,weight

    // Add Galeri 24 prices
    priceData.galeri24.forEach((price) => {
      const weight = parseWeight(price.weight);
      const key = `${today}|galeri24|${weight}`;
      recordsMap.set(key, {
        date: today,
        vendor: "galeri24",
        weight: weight,
        harga_jual: parsePriceString(price.harga_jual),
        harga_buyback: parsePriceString(price.harga_buyback),
      });
    });

    // Add Antam prices
    priceData.antam.forEach((price) => {
      const weight = parseWeight(price.weight);
      const key = `${today}|antam|${weight}`;
      recordsMap.set(key, {
        date: today,
        vendor: "antam",
        weight: weight,
        harga_jual: parsePriceString(price.harga_jual),
        harga_buyback: parsePriceString(price.harga_buyback),
      });
    });

    const records = Array.from(recordsMap.values());

    if (records.length === 0) {
      console.error("❌ No price data extracted");
      return;
    }

    console.log(
      `\n✅ Extracted ${records.length} price records (${priceData.galeri24.length} Galeri24 + ${priceData.antam.length} Antam)`
    );
    console.log("Sample data:");
    records.slice(0, 3).forEach((r) => {
      console.log(
        `  ${r.vendor} ${r.weight}g: Jual Rp${r.harga_jual.toLocaleString(
          "id-ID"
        )}, Buyback Rp${r.harga_buyback.toLocaleString("id-ID")}`
      );
    });

    // Save to Supabase
    console.log(`\n📝 Saving ${records.length} records to Supabase...`);
    const { error } = await supabase
      .from("galeri24_antam_prices")
      .upsert(records, { onConflict: "date,vendor,weight" });

    if (error) {
      console.error("❌ Error saving to Supabase:", error.message);
      return;
    }

    console.log(`\n🎉 Success! Saved ${records.length} retail price records`);
  } catch (error) {
    console.error("❌ Scraping error:", error.message);
  } finally {
    await browser.close();
  }
}

scrapeRetailPrices();

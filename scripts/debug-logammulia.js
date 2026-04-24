#!/usr/bin/env node

import { chromium } from "playwright";

async function debug() {
  console.log("🔍 Debugging logammulia.com structure...\n");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("📄 Loading page...");
    await page.goto("https://www.logammulia.com/id/sell/gold", {
      waitUntil: "load",
      timeout: 30000,
    });

    console.log("⏳ Waiting for chart...");
    await page.waitForSelector("canvas, svg", { timeout: 15000 });
    await page.waitForTimeout(5000);

    // Try to trigger chart rendering by waiting for stable state
    console.log("⏳ Waiting for chart to stabilize...");
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

    console.log("📸 Taking screenshot...");
    await page.screenshot({ path: "logammulia-debug.png" });

    console.log("🔎 Extracting Highcharts data...");
    const chartData = await page.evaluate(() => {
      // Method 1: Direct Highcharts access
      if (window.Highcharts && window.Highcharts.charts) {
        const charts = window.Highcharts.charts.filter(c => c);

        if (charts.length > 0) {
          const chart = charts[0];

          // Check chart.options for data
          if (chart.options?.series) {
            const optionsSeries = chart.options.series[0];
            if (optionsSeries?.data) {
              const data = Array.isArray(optionsSeries.data) ? optionsSeries.data : [];
              const nonNullData = data.filter(p => p !== null);

              return {
                success: true,
                source: "chart.options.series[0].data",
                totalPoints: data.length,
                nonNullPoints: nonNullData.length,
                sample: nonNullData.slice(0, 5),
                data: nonNullData
                  .map((point, idx) => ({
                    idx,
                    x: typeof point === "object" ? point.x : null,
                    y: typeof point === "object" ? point.y : point,
                    name: typeof point === "object" ? point.name : null,
                    category: typeof point === "object" ? point.category : null,
                  }))
                  .slice(0, 10)
              };
            }
          }

          if (chart.series && chart.series[0]) {
            const firstSeries = chart.series[0];
            const point = firstSeries.data.find(p => p !== null);

            return {
              success: point ? true : false,
              source: "chart.series[0].data",
              totalPoints: firstSeries.data.length,
              message: point ? "Has non-null data" : "All data points are null",
              firstNonNullPoint: point
            };
          }
        }
      }

      return { success: false, message: "No Highcharts data found" };
    });

    console.log("\nChart data:", JSON.stringify(chartData, null, 2));

    console.log("\n✅ Debug screenshot saved: logammulia-debug.png");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await browser.close();
  }
}

debug();

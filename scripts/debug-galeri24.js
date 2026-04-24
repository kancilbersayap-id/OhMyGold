#!/usr/bin/env node

import { chromium } from "playwright";

async function debug() {
  console.log("🔍 Debugging galeri24.co.id structure...\n");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("📄 Loading page...");
    await page.goto("https://galeri24.co.id/harga-emas", {
      waitUntil: "load",
      timeout: 30000,
    });

    // Wait for any dynamic content
    await page.waitForTimeout(3000);

    // Check for tables
    const tableCount = await page.locator("table").count();
    console.log(`Found ${tableCount} tables`);

    // Take screenshot
    await page.screenshot({ path: "galeri24-debug.png" });
    console.log("📸 Screenshot saved: galeri24-debug.png");

    // Check for divs with price info
    const divCount = await page.locator("div").count();
    console.log(`Found ${divCount} divs total`);

    // Look for elements with "GALERI" or price-like content
    const pageContent = await page.content();
    if (pageContent.includes("GALERI")) {
      console.log("✓ Found 'GALERI' in page content");
    }
    if (pageContent.includes("Rp")) {
      console.log("✓ Found 'Rp' (rupiah symbol) in page content");
    }

    // Try to find elements with specific text
    const hasGaleri24Section = await page
      .locator('text="Harga GALERI 24"')
      .count()
      .catch(() => 0);
    console.log(`Found "Harga GALERI 24" sections: ${hasGaleri24Section}`);

    const hasAntamSection = await page
      .locator('text="Harga ANTAM"')
      .count()
      .catch(() => 0);
    console.log(`Found "Harga ANTAM" sections: ${hasAntamSection}`);

    // Look for any price-like content
    const pricePatterns = pageContent.match(/Rp[\d.,]+/g);
    if (pricePatterns) {
      console.log(`\nFound ${pricePatterns.length} price strings. Sample:`);
      pricePatterns.slice(0, 5).forEach((p) => console.log(`  ${p}`));
    }

    // Try to extract the actual data structure
    const dataStructure = await page.evaluate(() => {
      // Find sections with "Harga GALERI 24" and "Harga ANTAM"
      const results = {};

      // Look for elements containing section titles
      const allElements = document.querySelectorAll("*");
      let inGaleri24 = false;
      let inAntam = false;
      const galeri24Data = [];
      const antamData = [];

      // Try to find structured data
      const textContent = document.body.innerText;
      const lines = textContent.split("\n");

      let currentVendor = null;
      let currentData = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.includes("Harga GALERI 24")) {
          currentVendor = "galeri24";
          currentData = [];
        } else if (line.includes("Harga ANTAM") && !line.includes("MULIA")) {
          currentVendor = "antam";
          currentData = [];
        } else if (currentVendor && line.match(/^[\d.]+$/)) {
          // This might be a weight line
          const weight = parseFloat(line.replace(/\./g, ""));
          if (!isNaN(weight) && weight > 0) {
            currentData.push({
              weight: weight,
              rawLines: [line, lines[i + 1], lines[i + 2]],
            });
          }
        }
      }

      return {
        galeri24Count: galeri24Data.length,
        antamCount: antamData.length,
        textLinesCount: lines.length,
        sampleLines: lines.slice(0, 50),
      };
    });

    console.log("\nData structure:", JSON.stringify(dataStructure, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await browser.close();
  }
}

debug();

#!/usr/bin/env node

/**
 * Check if today's retail prices already exist in Supabase
 * Exit 0 (success) if data exists, 1 (skip) if not
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ADMIN_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkPricesExist() {
  const today = new Date().toISOString().split("T")[0];

  try {
    const { data, error } = await supabase
      .from("galeri24_antam_prices")
      .select("date")
      .eq("date", today)
      .limit(1);

    if (error) {
      console.error("❌ Error querying Supabase:", error.message);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log(`✅ Today's prices (${today}) already scraped. Skipping.`);
      process.exit(0);
    } else {
      console.log(`⏳ No prices for today (${today}). Proceeding with scrape.`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkPricesExist();

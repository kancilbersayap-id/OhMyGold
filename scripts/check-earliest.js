import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from("antam_buyback_prices")
  .select("date")
  .order("date", { ascending: true })
  .limit(1);

if (error) {
  console.error("Error:", error.message);
} else {
  console.log("Earliest date:", data[0]?.date);
}

-- Enable Row Level Security and define access policies for OhMyGold tables.
--
-- Tables:
--   user_gold_holdings    — per-user. Users may CRUD only their own rows.
--   antam_buyback_prices  — per-user (has user_id). Users may CRUD only their own rows.
--   galeri24_antam_prices — global price data. Authenticated users may read.
--                           Writes are restricted to the service_role key
--                           (used by the scraper); no end-user writes allowed.
--
-- service_role bypasses RLS by default, so the scraper continues to work.
-- The browser uses the anon key + the user's JWT, so the policies below are
-- what governs end-user access.

-- ============================================================================
-- user_gold_holdings
-- ============================================================================

ALTER TABLE public.user_gold_holdings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_gold_holdings_select_own" ON public.user_gold_holdings;
CREATE POLICY "user_gold_holdings_select_own"
  ON public.user_gold_holdings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_gold_holdings_insert_own" ON public.user_gold_holdings;
CREATE POLICY "user_gold_holdings_insert_own"
  ON public.user_gold_holdings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_gold_holdings_update_own" ON public.user_gold_holdings;
CREATE POLICY "user_gold_holdings_update_own"
  ON public.user_gold_holdings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_gold_holdings_delete_own" ON public.user_gold_holdings;
CREATE POLICY "user_gold_holdings_delete_own"
  ON public.user_gold_holdings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_gold_holdings_user_id_date_idx
  ON public.user_gold_holdings (user_id, date DESC);

-- ============================================================================
-- antam_buyback_prices
-- ============================================================================

ALTER TABLE public.antam_buyback_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "antam_buyback_prices_select_own" ON public.antam_buyback_prices;
CREATE POLICY "antam_buyback_prices_select_own"
  ON public.antam_buyback_prices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "antam_buyback_prices_insert_own" ON public.antam_buyback_prices;
CREATE POLICY "antam_buyback_prices_insert_own"
  ON public.antam_buyback_prices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "antam_buyback_prices_update_own" ON public.antam_buyback_prices;
CREATE POLICY "antam_buyback_prices_update_own"
  ON public.antam_buyback_prices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "antam_buyback_prices_delete_own" ON public.antam_buyback_prices;
CREATE POLICY "antam_buyback_prices_delete_own"
  ON public.antam_buyback_prices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS antam_buyback_prices_user_id_date_idx
  ON public.antam_buyback_prices (user_id, date DESC);

-- ============================================================================
-- galeri24_antam_prices
-- ============================================================================

ALTER TABLE public.galeri24_antam_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "galeri24_antam_prices_read_all_authenticated" ON public.galeri24_antam_prices;
CREATE POLICY "galeri24_antam_prices_read_all_authenticated"
  ON public.galeri24_antam_prices FOR SELECT
  TO authenticated
  USING (true);

-- Intentionally no INSERT / UPDATE / DELETE policies for end users.
-- Only the service_role key (scraper) can write to this table.

CREATE INDEX IF NOT EXISTS galeri24_antam_prices_vendor_weight_date_idx
  ON public.galeri24_antam_prices (vendor, weight, date DESC);

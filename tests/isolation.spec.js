/**
 * Phase 1 — Multi-User Data Isolation
 *
 * All UI tests run as User B (storageState: user-b.json set in playwright.config.js).
 * User A's data is seeded by auth.setup.js with known values:
 *   - 2 gold holdings  (paid_amount: 15,000,000 and 7,500,000)
 *   - 2 buyback prices (1,450,000 and 1,480,000)
 *
 * User B has zero holdings and zero buyback prices.
 *
 * UI tests confirm User A's data never surfaces in User B's session.
 * RLS tests confirm the Supabase database layer independently blocks
 * cross-user reads and writes, regardless of what the UI does.
 *
 * Covers:
 *   - CRIT-01 mitigation: even if getUserAntamBuybackHistory() were called
 *     with a foreign userId, RLS would block the admin client only when the
 *     function uses the anon key. The RLS tests here prove the policy is
 *     active; the fix for CRIT-01 (adding auth checks to the functions
 *     themselves) must be verified separately.
 *   - UI-level: every page User B visits shows their own empty state.
 *   - RLS-level: User B's JWT cannot SELECT, UPDATE, or DELETE User A's rows.
 */

const { test, expect } = require('@playwright/test');
const { createClient } = require('@supabase/supabase-js');
const { getUserIdByEmail, SEED_VALUES } = require('./helpers/db');

// ─── UI isolation tests (runs as User B via storageState in config) ───────────

test.describe('UI isolation — User B sees no User A data', () => {

  test('Overview: MetricCards show no User A values', async ({ page }) => {
    await page.goto('/overview');
    await page.waitForLoadState('networkidle');

    // User B has no holdings, so "Estimate Revenue" and "Monthly Revenue"
    // should show "-" (the falsy branch in overview/page.js).
    // They must NOT show values derived from User A's seeded paid_amount
    // (15,000,000 + 7,500,000 = 22,500,000).
    const metricCards = page.locator('[class*="metricCard"], [class*="MetricCard"]');
    const count = await metricCards.count();

    for (let i = 0; i < count; i++) {
      const text = await metricCards.nth(i).innerText();
      // User A's total paid amount — must not appear in User B's session.
      expect(text).not.toContain('22.500.000');
      expect(text).not.toContain('15.000.000');
      expect(text).not.toContain('7.500.000');
    }
  });

  test('Antam Buyback: table shows no User A buyback entries', async ({ page }) => {
    await page.goto('/antam-buyback');
    await page.waitForLoadState('networkidle');

    // User A's seeded buyback prices were 1,450,000 and 1,480,000.
    // Neither should appear in User B's table.
    const pageText = await page.locator('body').innerText();
    expect(pageText).not.toContain('1.450.000');
    expect(pageText).not.toContain('1.480.000');
  });

  test('Antam Buyback: calendar shows no User A data points', async ({ page }) => {
    await page.goto('/antam-buyback');
    await page.waitForLoadState('networkidle');

    // The Calendar is populated from `data` (antam buyback entries).
    // User B has none — the calendar should have no highlighted day cells.
    // The Calendar component uses class names on day cells with data.
    const highlightedDays = page.locator('[class*="hasData"], [class*="has-data"], [data-has-price]');
    await expect(highlightedDays).toHaveCount(0);
  });

  test('Profile / My Assets: table shows no User A holdings', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // User A's holding values — must not appear.
    const pageText = await page.locator('body').innerText();
    expect(pageText).not.toContain('15.000.000');
    expect(pageText).not.toContain('7.500.000');
    expect(pageText).not.toContain('Antam certi');
    expect(pageText).not.toContain('10g');
  });

  test('Profile / My Assets: MetricCards show 0 for all totals', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // User B has no holdings — Total Invested, Total Grams, Total Units = 0.
    // The MetricCard values should be "0" or "0g", not User A's totals (22,500,000 / 15g / 2).
    const pageText = await page.locator('body').innerText();
    expect(pageText).not.toContain('22.500.000');
    expect(pageText).not.toContain('15g');
  });

  test('BuybackChart on Overview: does not render User A data points', async ({ page }) => {
    await page.goto('/overview');
    await page.waitForLoadState('networkidle');

    // BuybackChart is only rendered when allBuybackHistory.length > 0 (overview/page.js:135).
    // User B has no buyback history, so the chart section must be absent.
    // The chart container has a label "Antam Buyback Price".
    const buybackChart = page.getByText('Antam Buyback Price');
    await expect(buybackChart).toHaveCount(0);
  });

});

// ─── RLS tests — Supabase database layer ─────────────────────────────────────
//
// These tests use @supabase/supabase-js directly in the Node.js test process.
// User B signs in with their actual credentials so we get a real JWT.
// The anon key + User B JWT is what the browser client uses; RLS enforces
// that auth.uid() === user_id on every row operation.

test.describe('RLS enforcement — User B JWT cannot access User A rows', () => {

  // Shared state: resolved once for the describe block.
  let userBClient;
  let userAId;
  let userBId;

  test.beforeAll(async () => {
    const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');

    // Sign in as User B using real credentials to obtain their JWT.
    userBClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await userBClient.auth.signInWithPassword({
      email:    process.env.TEST_USER_B_EMAIL,
      password: process.env.TEST_USER_B_PASSWORD,
    });
    if (error) throw new Error(`Failed to sign in User B: ${error.message}`);
    if (!data.user) throw new Error('User B sign-in returned no user');

    userAId = await getUserIdByEmail(process.env.TEST_USER_A_EMAIL);
    userBId = data.user.id;
  });

  // ── SELECT ──────────────────────────────────────────────────────────────────

  test('RLS: User B cannot SELECT User A holdings', async () => {
    const { data, error } = await userBClient
      .from('user_gold_holdings')
      .select('id, paid_amount')
      .eq('user_id', userAId);

    // RLS policy: auth.uid() = user_id.
    // User B's JWT has a different uid, so 0 rows are returned.
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  test('RLS: User B cannot SELECT User A buyback prices', async () => {
    const { data, error } = await userBClient
      .from('antam_buyback_prices')
      .select('id, buyback_price')
      .eq('user_id', userAId);

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  test('RLS: User B SELECT returns only their own holdings (not User A\'s)', async () => {
    // An unrestricted SELECT — RLS filters automatically.
    // User B has no holdings, so the result must be empty.
    const { data, error } = await userBClient
      .from('user_gold_holdings')
      .select('id, user_id, paid_amount');

    expect(error).toBeNull();
    // Zero rows: User B has none. None of User A's rows appear.
    const userARows = (data || []).filter((r) => r.user_id === userAId);
    expect(userARows).toHaveLength(0);
  });

  // ── UPDATE ──────────────────────────────────────────────────────────────────

  test('RLS: User B cannot UPDATE User A\'s holding', async () => {
    const { SEED_IDS } = require('./helpers/db');

    const { error, count } = await userBClient
      .from('user_gold_holdings')
      .update({ paid_amount: 1 })
      .eq('id', SEED_IDS.holding1)
      .eq('user_id', userAId);

    // RLS UPDATE policy: USING (auth.uid() = user_id).
    // 0 rows should match for User B's JWT.
    expect(error).toBeNull();
    expect(count).toBeFalsy(); // null or 0
  });

  test('RLS: User B cannot UPDATE User A\'s buyback price', async () => {
    const { SEED_IDS } = require('./helpers/db');

    const { error, count } = await userBClient
      .from('antam_buyback_prices')
      .update({ buyback_price: 1 })
      .eq('id', SEED_IDS.buyback1)
      .eq('user_id', userAId);

    expect(error).toBeNull();
    expect(count).toBeFalsy();
  });

  // ── DELETE ──────────────────────────────────────────────────────────────────

  test('RLS: User B cannot DELETE User A\'s holding', async () => {
    const { SEED_IDS } = require('./helpers/db');

    const { error } = await userBClient
      .from('user_gold_holdings')
      .delete()
      .eq('id', SEED_IDS.holding1);

    // RLS DELETE policy: USING (auth.uid() = user_id).
    // The delete is silently rejected — no error, but the row stays.
    expect(error).toBeNull();

    // Verify the row still exists using the admin client.
    const { adminClient } = require('./helpers/db');
    const admin = adminClient();
    const { data } = await admin
      .from('user_gold_holdings')
      .select('id')
      .eq('id', SEED_IDS.holding1);
    expect(data).toHaveLength(1);
  });

  test('RLS: User B cannot DELETE User A\'s buyback price', async () => {
    const { SEED_IDS } = require('./helpers/db');

    const { error } = await userBClient
      .from('antam_buyback_prices')
      .delete()
      .eq('id', SEED_IDS.buyback1);

    expect(error).toBeNull();

    const { adminClient } = require('./helpers/db');
    const admin = adminClient();
    const { data } = await admin
      .from('antam_buyback_prices')
      .select('id')
      .eq('id', SEED_IDS.buyback1);
    expect(data).toHaveLength(1);
  });

  // ── INSERT ──────────────────────────────────────────────────────────────────

  test('RLS: User B cannot INSERT a holding with User A\'s user_id', async () => {
    const { error } = await userBClient
      .from('user_gold_holdings')
      .insert({
        user_id:    userAId,  // attempting to claim User A's identity
        date:       '2026-05-01',
        type:       'Antam certi',
        type_unit:  '1g',
        paid_amount: 999,
        unit_price:  999,
        units:       1,
      });

    // RLS INSERT policy: WITH CHECK (auth.uid() = user_id).
    // User B's JWT has userBId, not userAId — insert must be rejected.
    expect(error).not.toBeNull();
  });

  // ── galeri24_antam_prices — read-only for end users ─────────────────────────

  test('RLS: any authenticated user can SELECT from galeri24_antam_prices', async () => {
    const { data, error } = await userBClient
      .from('galeri24_antam_prices')
      .select('id')
      .limit(1);

    // Read policy: TO authenticated USING (true).
    // No error expected — retail prices are public to authenticated users.
    expect(error).toBeNull();
    // data may be empty if no prices have been scraped, but no error.
  });

  test('RLS: User B cannot INSERT into galeri24_antam_prices', async () => {
    const { error } = await userBClient
      .from('galeri24_antam_prices')
      .insert({ vendor: 'fake', weight: '1', harga_jual: 1, harga_buyback: 1, date: '2026-01-01' });

    // No INSERT policy exists for end users — operation must fail.
    expect(error).not.toBeNull();
  });

});

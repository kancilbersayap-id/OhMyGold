/**
 * Test database helpers — seed and clean up User A's data before/after tests.
 *
 * Uses the Supabase admin (service-role) key so RLS is bypassed for setup
 * operations. This is intentional: tests need deterministic state regardless
 * of RLS. The actual RLS enforcement is tested in isolation.spec.js.
 *
 * Required env vars (add to .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_ADMIN_KEY
 *   TEST_USER_A_EMAIL
 *   TEST_USER_B_EMAIL
 */

const { createClient } = require('@supabase/supabase-js');

// Fixed UUIDs so seed rows are identifiable and safely deletable across runs.
// These will never collide with real user data unless someone is very unlucky.
const SEED_IDS = {
  holding1: 'aaaa0001-test-test-test-aaaaaaaaaaaa',
  holding2: 'aaaa0002-test-test-test-aaaaaaaaaaaa',
  buyback1: 'bbbb0001-test-test-test-bbbbbbbbbbbb',
  buyback2: 'bbbb0002-test-test-test-bbbbbbbbbbbb',
};

// Known values tests can assert against.
const SEED_VALUES = {
  holding1: { date: '2026-01-15', type: 'Antam certi', type_unit: '10g', paid_amount: 15_000_000, unit_price: 1_500_000, units: 1 },
  holding2: { date: '2026-02-20', type: 'Galeri 24',   type_unit: '5g',  paid_amount:  7_500_000, unit_price: 1_500_000, units: 1 },
  buyback1: { date: '2026-03-01', buyback_price: 1_450_000 },
  buyback2: { date: '2026-04-01', buyback_price: 1_480_000 },
};

function adminClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_ADMIN_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ADMIN_KEY must be set in .env.local');
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Resolve a Supabase user UUID from an email address.
 * Requires admin access (listUsers).
 */
async function getUserIdByEmail(email) {
  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error(`Failed to list users: ${error.message}`);
  const user = data.users.find((u) => u.email === email);
  if (!user) throw new Error(`Test user not found in Supabase: ${email}. Create it via the Supabase dashboard.`);
  return user.id;
}

/**
 * Delete any existing seed rows for a user, then insert fresh known-state data.
 * Call this once in auth.setup.js before tests run.
 */
async function seedUserAData(userAId) {
  const supabase = adminClient();

  // Clean first so re-runs are idempotent.
  await cleanUserAData(userAId);

  const { error: holdingErr } = await supabase
    .from('user_gold_holdings')
    .insert([
      { id: SEED_IDS.holding1, user_id: userAId, ...SEED_VALUES.holding1 },
      { id: SEED_IDS.holding2, user_id: userAId, ...SEED_VALUES.holding2 },
    ]);
  if (holdingErr) throw new Error(`Failed to seed holdings: ${holdingErr.message}`);

  const { error: buybackErr } = await supabase
    .from('antam_buyback_prices')
    .insert([
      { id: SEED_IDS.buyback1, user_id: userAId, ...SEED_VALUES.buyback1 },
      { id: SEED_IDS.buyback2, user_id: userAId, ...SEED_VALUES.buyback2 },
    ]);
  if (buybackErr) throw new Error(`Failed to seed buyback prices: ${buybackErr.message}`);
}

/**
 * Remove all seed rows for User A. Safe to call multiple times.
 */
async function cleanUserAData(userAId) {
  const supabase = adminClient();
  await supabase.from('user_gold_holdings')   .delete().eq('user_id', userAId);
  await supabase.from('antam_buyback_prices') .delete().eq('user_id', userAId);
}

module.exports = { adminClient, getUserIdByEmail, seedUserAData, cleanUserAData, SEED_IDS, SEED_VALUES };

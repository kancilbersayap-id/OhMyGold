/**
 * Global test setup — runs once before auth.spec.js and isolation.spec.js.
 *
 * 1. Resolves User A's UUID from their email via Supabase admin API.
 * 2. Seeds known-state holdings and buyback prices for User A.
 * 3. Logs in as User A and saves auth cookies → tests/.auth/user-a.json
 * 4. Logs in as User B and saves auth cookies → tests/.auth/user-b.json
 *
 * User B is kept clean (no holdings, no buyback data) so isolation tests
 * can assert that nothing from User A bleeds through.
 *
 * Run order is sequential (serial) because step 3 depends on step 1+2.
 */

const { test: setup } = require('@playwright/test');
const path = require('path');
const { getUserIdByEmail, seedUserAData, cleanUserAData } = require('./helpers/db');
const { loginAs } = require('./helpers/auth');

const USER_A_STATE = path.join(__dirname, '.auth/user-a.json');
const USER_B_STATE = path.join(__dirname, '.auth/user-b.json');

setup.describe.serial('test data and auth setup', () => {

  setup('seed User A test data', async () => {
    const email = process.env.TEST_USER_A_EMAIL;
    if (!email) throw new Error('TEST_USER_A_EMAIL is not set. See .env.test.example');

    const userAId = await getUserIdByEmail(email);
    await seedUserAData(userAId);
  });

  setup('save User A auth state', async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_A_EMAIL, process.env.TEST_USER_A_PASSWORD);
    // Supabase SSR stores the session in cookies — storageState captures them.
    await page.context().storageState({ path: USER_A_STATE });
  });

  setup('save User B auth state', async ({ page }) => {
    // User B must exist in Supabase but have zero holdings and zero buyback prices.
    // If User B had leftover data from a previous run, clean it here.
    const userBEmail = process.env.TEST_USER_B_EMAIL;
    if (!userBEmail) throw new Error('TEST_USER_B_EMAIL is not set. See .env.test.example');

    const { getUserIdByEmail: getUid, cleanUserAData: cleanData } = require('./helpers/db');
    const userBId = await getUid(userBEmail);
    await cleanData(userBId);

    await loginAs(page, userBEmail, process.env.TEST_USER_B_PASSWORD);
    await page.context().storageState({ path: USER_B_STATE });
  });

});

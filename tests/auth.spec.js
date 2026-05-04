/**
 * Phase 2 — Auth and Protected Routes
 *
 * Covers:
 *  - Unauthenticated users are redirected to /login for every protected route
 *  - Authenticated users are redirected away from /login and /signup
 *  - Login form: valid credentials succeed, invalid credentials show an error
 *  - Logout clears the session and re-protects all routes
 *  - Signup form: client-side validation (password mismatch, too short)
 *
 * Auth state:
 *  - Most tests run with NO stored auth state (default unauthenticated context).
 *  - Tests that need a logged-in user load the saved state via test.use().
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const { loginAs } = require('./helpers/auth');

const USER_A_STATE = path.join(__dirname, '.auth/user-a.json');

// ─── Protected Route Redirects (unauthenticated) ──────────────────────────────

test.describe('unauthenticated access → redirect to /login', () => {
  // No storageState — every test starts with no session.

  const protectedRoutes = [
    '/overview',
    '/profile',
    '/antam-buyback',
    '/antam-price',
    '/sell-simulation',
    '/buy-simulation',
    '/forecasting',
  ];

  for (const route of protectedRoutes) {
    test(`GET ${route} redirects to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL('/login');
    });
  }

  test('GET / redirects to /login (root redirect goes through /overview)', async ({ page }) => {
    // src/app/page.js does redirect('/overview');
    // middleware then catches unauthenticated and redirects to /login.
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});

// ─── Authenticated Users Redirected Off Auth Pages ────────────────────────────

test.describe('authenticated access → redirect away from auth pages', () => {
  test.use({ storageState: USER_A_STATE });

  test('GET /login redirects to /overview when already logged in', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/overview');
  });

  test('GET /signup redirects to /overview when already logged in', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveURL('/overview');
  });
});

// ─── Login Flow ───────────────────────────────────────────────────────────────

test.describe('login form', () => {

  test('valid credentials → redirects to /overview', async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_A_EMAIL, process.env.TEST_USER_A_PASSWORD);
    await expect(page).toHaveURL('/overview');
  });

  test('wrong password → shows inline error, button re-enables', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.TEST_USER_A_EMAIL);
    await page.getByLabel('Password').fill('definitely-wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Error div appears with a Supabase-provided message.
    const errorDiv = page.locator('[class*="error"]');
    await expect(errorDiv).toBeVisible({ timeout: 8_000 });

    // Page stays on /login — no redirect.
    await expect(page).toHaveURL('/login');

    // Button is not permanently disabled — user can try again.
    const btn = page.getByRole('button', { name: 'Sign in' });
    await expect(btn).toBeEnabled({ timeout: 5_000 });
  });

  test('empty email → browser validation blocks form submission', async ({ page }) => {
    await page.goto('/login');
    // Leave email empty, fill password.
    await page.getByLabel('Password').fill('somepassword');

    // Intercept any network request — there should be none when HTML validation blocks submit.
    let requestMade = false;
    page.on('request', (req) => { if (req.url().includes('supabase')) requestMade = true; });

    await page.getByRole('button', { name: 'Sign in' }).click();

    // A short wait to confirm no navigation happened.
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/login');
    expect(requestMade).toBe(false);
  });

  test('wrong email format → browser validation blocks form submission', async ({ page }) => {
    await page.goto('/login');
    // type="email" on the input rejects non-email strings natively.
    await page.getByLabel('Email').fill('notanemail');
    await page.getByLabel('Password').fill('somepassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/login');
  });

});

// ─── Logout Flow ──────────────────────────────────────────────────────────────

test.describe('logout', () => {
  test.use({ storageState: USER_A_STATE });

  test('logout clears session and re-protects /overview', async ({ page }) => {
    // Start already logged in as User A.
    await page.goto('/overview');
    await expect(page).toHaveURL('/overview');

    // Click the logout button on the Profile page.
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Log out' }).click();

    // ProfileClient calls router.push('/login') after signOut().
    await expect(page).toHaveURL('/login', { timeout: 10_000 });

    // Confirm the session is gone — navigating to a protected route now redirects.
    await page.goto('/overview');
    await expect(page).toHaveURL('/login');
  });

});

// ─── Signup Form Validation ───────────────────────────────────────────────────

test.describe('signup form', () => {

  test('mismatched passwords → shows error, no redirect', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('different456');
    await page.getByRole('button', { name: 'Sign up' }).click();

    const errorDiv = page.locator('[class*="error"]');
    await expect(errorDiv).toBeVisible();
    await expect(errorDiv).toContainText('Passwords do not match');
    await expect(page).toHaveURL('/signup');
  });

  test('password too short → shows error, no redirect', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('abc');
    await page.getByLabel('Confirm Password').fill('abc');
    await page.getByRole('button', { name: 'Sign up' }).click();

    const errorDiv = page.locator('[class*="error"]');
    await expect(errorDiv).toBeVisible();
    await expect(errorDiv).toContainText('at least 6 characters');
    await expect(page).toHaveURL('/signup');
  });

});

// ─── design-system route is public ────────────────────────────────────────────

test('GET /design-system is accessible to unauthenticated users', async ({ page }) => {
  // middleware.ts lists /design-system in PUBLIC_ROUTES.
  await page.goto('/design-system');
  // Should NOT redirect to /login.
  await expect(page).not.toHaveURL('/login');
});

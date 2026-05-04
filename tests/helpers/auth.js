/**
 * Shared Playwright login helper.
 *
 * Navigates to /login, fills credentials, and waits for the redirect
 * to /overview before returning. Throws if login fails.
 *
 * Usage:
 *   const { loginAs } = require('./helpers/auth');
 *   await loginAs(page, process.env.TEST_USER_A_EMAIL, process.env.TEST_USER_A_PASSWORD);
 */

const { expect } = require('@playwright/test');

async function loginAs(page, email, password) {
  await page.goto('/login');

  // FormField.js uses <label htmlFor={useId()}> so getByLabel resolves correctly.
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Login page calls router.push('/overview') on success.
  await page.waitForURL('/overview', { timeout: 15_000 });

  // Confirm the page actually loaded (not a redirect loop).
  await expect(page).toHaveURL('/overview');
}

module.exports = { loginAs };

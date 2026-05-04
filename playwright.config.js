const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  // Run tests sequentially — auth state must be set up before isolation/auth tests run
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],

  use: {
    baseURL: 'http://localhost:3000',
    // Keep a trace on first retry so failures are diagnosable
    trace: 'retain-on-failure',
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
  },

  projects: [
    // Project 1: seed test data and save auth cookies to disk.
    // This runs before any spec file so both test users are ready.
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },

    // Project 2: Phase 2 — auth and protected-route tests.
    // These tests use no pre-loaded auth state (unauthenticated by default)
    // and load specific user state per test via test.use().
    {
      name: 'auth-tests',
      testMatch: /auth\.spec\.js/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },

    // Project 3: Phase 1 — multi-user isolation tests.
    // All tests in this file run as User B (no holdings, no buyback data).
    {
      name: 'isolation-tests',
      testMatch: /isolation\.spec\.js/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user-b.json',
      },
    },

    // Project 4: Phase 3 — mutation (CRUD) tests.
    // Runs as User A. Tests create, edit, and delete their own records and clean up.
    {
      name: 'mutations-tests',
      testMatch: /mutations\.spec\.js/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user-a.json',
      },
    },
  ],

  // Start the dev server automatically if it's not already running.
  // On CI (process.env.CI is set), always start fresh.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

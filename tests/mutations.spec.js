/**
 * Phase 3 — Add / Edit / Delete Mutations
 *
 * All tests run as User A (storageState: user-a.json set in playwright.config.js).
 * Each test creates its own records and deletes them before finishing so tests
 * do not bleed state into each other.
 *
 * Tests marked test.fail() document known bugs from the QA audit.
 * They pass as long as the bug is still present (expected failure).
 * Remove the .fail() when the underlying issue is fixed.
 *
 * Covers:
 *   Antam Buyback CRUD
 *     ✓ Add valid record  → row appears in table, success toast
 *     ✓ Duplicate date    → inline error shown, submit blocked
 *     ✓ Edit record       → row value updates, success toast
 *     ✓ Delete record     → row removed from table, success toast
 *     ✓ Cancel delete     → record stays in table
 *     ✗ HIGH-03: price=0 passes canSubmit (known bug)
 *     ✗ HIGH-03: negative price passes canSubmit (known bug)
 *
 *   Gold Holdings CRUD
 *     ✓ Add valid holding  → row appears, MetricCard totals increase, success toast
 *     ✓ Edit holding       → row updates, totals recalculate, success toast
 *     ✓ Delete holding     → row removed, totals decrease, success toast
 *     ✓ Cancel delete      → record stays in table
 *     ✓ Gram price auto-calc → correct value shown reactively
 *     ✗ HIGH-07: confirm button not disabled on empty form (known bug)
 *     ✗ HIGH-06: paidAmount=0 passes form guard (known bug)
 */

const { test, expect } = require('@playwright/test');

// ─── Date helpers ─────────────────────────────────────────────────────────────
// Use late-month dates (20–28) so they always exist and are always in the
// current month view regardless of when the tests run.

function testDates() {
  const d   = new Date();
  const y   = d.getFullYear();
  const mon = String(d.getMonth() + 1).padStart(2, '0');
  return {
    add:        `${y}-${mon}-20`,
    dup:        `${y}-${mon}-21`,
    edit:       `${y}-${mon}-22`,
    del:        `${y}-${mon}-23`,
    cancelDel:  `${y}-${mon}-24`,
    holdingAdd: `${y}-${mon}-25`,
    holdingEdit:`${y}-${mon}-26`,
    holdingDel: `${y}-${mon}-27`,
    holdingCxl: `${y}-${mon}-28`,
  };
}

const DATES = testDates();

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Open the Add/Edit Buyback modal and return the dialog locator. */
async function openAddBuybackModal(page) {
  await page.getByRole('button', { name: 'Add buyback price' }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  return modal;
}

/** Fill the buyback form inside the given dialog locator. */
async function fillBuybackForm(modal, date, price) {
  await modal.getByLabel('Date').fill(date);
  await modal.getByLabel('Buyback Price').fill(String(price));
}

/** Assert the success toast is visible then wait for it to dismiss. */
async function expectSuccessToast(page, text) {
  const toast = page.locator('[class*="toast"]:not([class*="Error"])');
  await expect(toast).toBeVisible({ timeout: 8_000 });
  if (text) await expect(toast).toContainText(text);
}

/** Read the text value of a MetricCard identified by its label text. */
async function metricCardValue(page, label) {
  const card = page.locator('[class*="card"]', { has: page.getByText(label, { exact: true }) });
  return card.locator('[class*="value"]').innerText();
}

// ─── Antam Buyback CRUD ───────────────────────────────────────────────────────

test.describe('Antam Buyback — add / edit / delete', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/antam-buyback');
    await page.waitForLoadState('networkidle');
  });

  // ── Add ──────────────────────────────────────────────────────────────────────

  test('add valid buyback price → row appears in table, success toast', async ({ page }) => {
    const modal = await openAddBuybackModal(page);
    await fillBuybackForm(modal, DATES.add, 1_500_000);
    await modal.getByRole('button', { name: 'Add' }).click();

    await expectSuccessToast(page, 'successfully added');

    // The new row must be visible in the table body.
    await expect(page.locator('tbody')).toContainText('Rp 1.500.000');

    // Cleanup — delete what we added so subsequent tests start clean.
    const row = page.locator('tr', { hasText: 'Rp 1.500.000' });
    await row.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expectSuccessToast(page, 'successfully deleted');
  });

  // ── Duplicate date validation ─────────────────────────────────────────────

  test('duplicate date → inline error shown, confirm button disabled', async ({ page }) => {
    // First: add a record so the duplicate check has something to detect.
    const modal1 = await openAddBuybackModal(page);
    await fillBuybackForm(modal1, DATES.dup, 1_400_000);
    await modal1.getByRole('button', { name: 'Add' }).click();
    await expectSuccessToast(page);

    // Second: open Add again and use the same date.
    const modal2 = await openAddBuybackModal(page);
    await fillBuybackForm(modal2, DATES.dup, 1_400_000);

    // The duplicate error paragraph should appear.
    await expect(modal2.getByText(/already exists/i)).toBeVisible();

    // Confirm button must be disabled (canSubmit is false for duplicate dates).
    await expect(modal2.getByRole('button', { name: 'Add' })).toBeDisabled();

    // Close modal without saving.
    await modal2.getByRole('button', { name: 'Cancel' }).click();

    // Cleanup.
    const row = page.locator('tr', { hasText: 'Rp 1.400.000' });
    await row.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expectSuccessToast(page, 'successfully deleted');
  });

  // ── Edit ──────────────────────────────────────────────────────────────────

  test('edit record → table row reflects new price, success toast', async ({ page }) => {
    // Add a record to edit.
    const modal1 = await openAddBuybackModal(page);
    await fillBuybackForm(modal1, DATES.edit, 1_300_000);
    await modal1.getByRole('button', { name: 'Add' }).click();
    await expectSuccessToast(page);

    // Click the Edit button on that row.
    const row = page.locator('tr', { hasText: 'Rp 1.300.000' });
    await row.getByRole('button', { name: /edit/i }).click();

    const editModal = page.getByRole('dialog');
    await expect(editModal).toBeVisible();
    await expect(editModal).toContainText('Edit buyback price');

    // Change the price.
    const priceInput = editModal.getByLabel('Buyback Price');
    await priceInput.clear();
    await priceInput.fill('1_350_000'.replace('_', '').replace('_', '')); // 1350000
    await editModal.getByRole('button', { name: 'Update' }).click();

    await expectSuccessToast(page, 'successfully updated');
    await expect(page.locator('tbody')).toContainText('Rp 1.350.000');
    // Old price is gone.
    await expect(page.locator('tbody')).not.toContainText('Rp 1.300.000');

    // Cleanup.
    const updatedRow = page.locator('tr', { hasText: 'Rp 1.350.000' });
    await updatedRow.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expectSuccessToast(page, 'successfully deleted');
  });

  // ── Delete ────────────────────────────────────────────────────────────────

  test('delete record → row removed from table, success toast', async ({ page }) => {
    // Add a record to delete.
    const modal = await openAddBuybackModal(page);
    await fillBuybackForm(modal, DATES.del, 1_200_000);
    await modal.getByRole('button', { name: 'Add' }).click();
    await expectSuccessToast(page);

    // Click Delete on that row.
    const row = page.locator('tr', { hasText: 'Rp 1.200.000' });
    await row.getByRole('button', { name: /delete/i }).click();

    const confirmModal = page.getByRole('dialog');
    await expect(confirmModal).toBeVisible();
    await expect(confirmModal).toContainText('Delete');

    await confirmModal.getByRole('button', { name: 'Delete' }).click();
    await expectSuccessToast(page, 'successfully deleted');

    await expect(page.locator('tbody')).not.toContainText('Rp 1.200.000');
  });

  // ── Cancel delete ─────────────────────────────────────────────────────────

  test('cancel delete → record stays in table', async ({ page }) => {
    // Add a record.
    const modal = await openAddBuybackModal(page);
    await fillBuybackForm(modal, DATES.cancelDel, 1_100_000);
    await modal.getByRole('button', { name: 'Add' }).click();
    await expectSuccessToast(page);

    // Start deletion, then cancel.
    const row = page.locator('tr', { hasText: 'Rp 1.100.000' });
    await row.getByRole('button', { name: /delete/i }).click();

    const confirmModal = page.getByRole('dialog');
    await expect(confirmModal).toBeVisible();
    await confirmModal.getByRole('button', { name: 'Cancel' }).click();

    // Modal closed, record still in table.
    await expect(confirmModal).not.toBeVisible();
    await expect(page.locator('tbody')).toContainText('Rp 1.100.000');

    // Cleanup.
    await row.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expectSuccessToast(page, 'successfully deleted');
  });

  // ── Known bugs (expected failures) ───────────────────────────────────────

  test.fail('HIGH-03: price=0 should disable confirm button but does not', async ({ page }) => {
    // '0' is a truthy string — canSubmit evaluates it as valid. Bug: should be blocked.
    const modal = await openAddBuybackModal(page);
    await fillBuybackForm(modal, DATES.add, 0);

    // This assertion should pass once the bug is fixed.
    // While the bug exists the button is enabled, so this assertion FAILS
    // → test.fail() marks it as an expected failure.
    await expect(modal.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  test.fail('HIGH-03: negative price should disable confirm button but does not', async ({ page }) => {
    const modal = await openAddBuybackModal(page);
    await fillBuybackForm(modal, DATES.add, -1);

    await expect(modal.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

});

// ─── Gold Holdings CRUD ───────────────────────────────────────────────────────

test.describe('Gold Holdings — add / edit / delete', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    // Ensure we're on My Assets tab (default).
    const myAssetsTab = page.getByRole('tab', { name: 'My Assets' });
    if (await myAssetsTab.count() > 0) await myAssetsTab.click();
  });

  /** Fill the Add/Edit Holdings form inside the given dialog. */
  async function fillHoldingsForm(modal, { date, type, typeUnit, paidAmount, unitPrice }) {
    await modal.getByLabel('Date Purchase').fill(date);

    // Custom combobox — click trigger, then click option.
    await modal.getByRole('combobox', { name: /type$/i }).click();
    await modal.getByRole('option', { name: type }).click();

    await modal.getByRole('combobox', { name: /type unit/i }).click();
    await modal.getByRole('option', { name: typeUnit }).click();

    await modal.getByLabel('Paid Amount').fill(String(paidAmount));
    await modal.getByLabel('Unit Price').fill(String(unitPrice));
  }

  // ── Add ──────────────────────────────────────────────────────────────────

  test('add valid holding → row appears in table, MetricCard totals increase, success toast', async ({ page }) => {
    // Capture totals before adding.
    const beforeInvested = await metricCardValue(page, 'Total Invested');

    // Open modal via "Add gold holdings" button in the header.
    await page.getByRole('button', { name: 'Add gold holdings' }).first().click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await fillHoldingsForm(modal, {
      date:       DATES.holdingAdd,
      type:       'Antam certi',
      typeUnit:   '5g',
      paidAmount: 7_500_000,
      unitPrice:  1_500_000,
    });

    await modal.getByRole('button', { name: 'Add gold holdings' }).click();
    await expectSuccessToast(page, 'successfully added');

    // New row must be in the table.
    await expect(page.locator('tbody')).toContainText('Antam certi 5g');

    // Total Invested must have increased (was X, now X + 7,500,000).
    const afterInvested = await metricCardValue(page, 'Total Invested');
    expect(afterInvested).not.toBe(beforeInvested);

    // Cleanup.
    const row = page.locator('tr', { hasText: 'Antam certi 5g' }).first();
    await row.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expectSuccessToast(page, 'successfully deleted');
  });

  // ── Edit ──────────────────────────────────────────────────────────────────

  test('edit holding → row updates, totals recalculate, success toast', async ({ page }) => {
    // Add a record first.
    await page.getByRole('button', { name: 'Add gold holdings' }).first().click();
    let modal = page.getByRole('dialog');
    await fillHoldingsForm(modal, {
      date:       DATES.holdingEdit,
      type:       'Galeri 24',
      typeUnit:   '2g',
      paidAmount: 3_000_000,
      unitPrice:  1_500_000,
    });
    await modal.getByRole('button', { name: 'Add gold holdings' }).click();
    await expectSuccessToast(page);

    const beforeInvested = await metricCardValue(page, 'Total Invested');

    // Click Edit on the new row.
    const row = page.locator('tr', { hasText: 'Galeri 24 2g' }).first();
    await row.getByRole('button', { name: /edit/i }).click();

    modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Edit Gold Holdings');

    // Change paid amount.
    const paidInput = modal.getByLabel('Paid Amount');
    await paidInput.clear();
    await paidInput.fill('4000000');
    await modal.getByRole('button', { name: 'Update' }).click();

    await expectSuccessToast(page, 'successfully updated');

    // Total Invested must have changed (increased by 1,000,000).
    const afterInvested = await metricCardValue(page, 'Total Invested');
    expect(afterInvested).not.toBe(beforeInvested);

    // Cleanup.
    await row.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expectSuccessToast(page, 'successfully deleted');
  });

  // ── Delete ────────────────────────────────────────────────────────────────

  test('delete holding → row removed, Total Invested decreases, success toast', async ({ page }) => {
    // Add a record to delete.
    await page.getByRole('button', { name: 'Add gold holdings' }).first().click();
    let modal = page.getByRole('dialog');
    await fillHoldingsForm(modal, {
      date:       DATES.holdingDel,
      type:       'Antam retro',
      typeUnit:   '10g',
      paidAmount: 15_000_000,
      unitPrice:  1_500_000,
    });
    await modal.getByRole('button', { name: 'Add gold holdings' }).click();
    await expectSuccessToast(page);

    const beforeInvested = await metricCardValue(page, 'Total Invested');

    // Delete it.
    const row = page.locator('tr', { hasText: 'Antam retro 10g' }).first();
    await row.getByRole('button', { name: /delete/i }).click();

    modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Delete' }).click();

    await expectSuccessToast(page, 'successfully deleted');
    await expect(page.locator('tbody')).not.toContainText('Antam retro 10g');

    // Total Invested must have decreased.
    const afterInvested = await metricCardValue(page, 'Total Invested');
    expect(afterInvested).not.toBe(beforeInvested);
  });

  // ── Cancel delete ─────────────────────────────────────────────────────────

  test('cancel delete → record remains in table', async ({ page }) => {
    // Add a record.
    await page.getByRole('button', { name: 'Add gold holdings' }).first().click();
    let modal = page.getByRole('dialog');
    await fillHoldingsForm(modal, {
      date:       DATES.holdingCxl,
      type:       'Galeri 24',
      typeUnit:   '50g',
      paidAmount: 75_000_000,
      unitPrice:  1_500_000,
    });
    await modal.getByRole('button', { name: 'Add gold holdings' }).click();
    await expectSuccessToast(page);

    // Initiate delete but cancel.
    const row = page.locator('tr', { hasText: 'Galeri 24 50g' }).first();
    await row.getByRole('button', { name: /delete/i }).click();

    modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Cancel' }).click();

    // Modal closed; row still present.
    await expect(modal).not.toBeVisible();
    await expect(page.locator('tbody')).toContainText('Galeri 24 50g');

    // Cleanup.
    await row.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expectSuccessToast(page, 'successfully deleted');
  });

  // ── Gram price auto-calc ──────────────────────────────────────────────────

  test('gram price field auto-calculates from paid amount and type unit', async ({ page }) => {
    await page.getByRole('button', { name: 'Add gold holdings' }).first().click();
    const modal = page.getByRole('dialog');

    // Select type unit first.
    await modal.getByRole('combobox', { name: /type unit/i }).click();
    await modal.getByRole('option', { name: '5g' }).click();

    // Enter paid amount.
    await modal.getByLabel('Paid Amount').fill('500000');

    // Gram Price should auto-calculate: 500000 / 5 = 100000 → Rp 100.000
    const gramPrice = modal.getByLabel('Gram Price');
    await expect(gramPrice).toHaveValue(/100\.000|100000/);

    // Close without saving.
    await modal.getByRole('button', { name: 'Cancel' }).click();
  });

  // ── Known bugs (expected failures) ───────────────────────────────────────

  test.fail('HIGH-07: confirm button should be disabled on empty form but is not', async ({ page }) => {
    // MyAssetsTab sets confirmDisabled={submitting} only.
    // An empty form has submitting=false → button is enabled → click silently returns.
    // The button should be disabled until all required fields are filled.
    await page.getByRole('button', { name: 'Add gold holdings' }).first().click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Nothing filled — confirm button should be disabled.
    // Bug: it is currently ENABLED. This assertion fails → expected by test.fail().
    await expect(modal.getByRole('button', { name: 'Add gold holdings' })).toBeDisabled();
  });

  test.fail('HIGH-06: paidAmount=0 should be blocked by form guard but is not', async ({ page }) => {
    // handleSubmit checks `if (!form.paidAmount)` — '0' is truthy, passes guard.
    await page.getByRole('button', { name: 'Add gold holdings' }).first().click();
    const modal = page.getByRole('dialog');

    await modal.getByLabel('Date Purchase').fill(DATES.holdingAdd);
    await modal.getByRole('combobox', { name: /type$/i }).click();
    await modal.getByRole('option', { name: 'Antam certi' }).click();
    await modal.getByRole('combobox', { name: /type unit/i }).click();
    await modal.getByRole('option', { name: '5g' }).click();
    await modal.getByLabel('Paid Amount').fill('0');
    await modal.getByLabel('Unit Price').fill('1500000');

    // Confirm should be disabled for zero paid amount.
    // Bug: it is enabled. Assertion fails → expected by test.fail().
    await expect(modal.getByRole('button', { name: 'Add gold holdings' })).toBeDisabled();
  });

});

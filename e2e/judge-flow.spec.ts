import { expect, test, type Page } from '@playwright/test';

// The judge journey from the plan (Hero A: Jollibee), driven on a 390x844 phone screen.
// Expected totals come from src/data/demoScenarios.ts.

const winner = (page: Page) => page.getByTestId('winner');
const btn = (page: Page, name: string) => page.getByRole('button', { name, exact: true });

test('judge flow: scan, build a Jollibee meal, compare, apply voucher, change card', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  // Fresh visitor
  await page.goto('/?reset=1');
  await expect(page.getByRole('note')).toContainText('Simulated data');
  await page.getByRole('link', { name: /Start with Jollibee/ }).click();

  // Build the hero basket: 2x 2pc Chickenjoy, 1x Jolly Spaghetti, 1x Regular Coke
  await btn(page, 'Add 2pc Chickenjoy').click();
  await btn(page, 'Increase 2pc Chickenjoy').click();
  await btn(page, 'Add Jolly Spaghetti').click();
  await btn(page, 'Add Regular Coke').click();
  await page.getByRole('link', { name: /Compare 4 apps/ }).click();

  // A1: Keeta wins even though its menu prices are highest
  await expect(winner(page)).toContainText('Keeta');
  await expect(winner(page)).toContainText('QAR 58.00');
  await expect(winner(page)).toContainText('Add QAR 3.00 more'); // DEMO-KEETA20 rejection is explained

  // A2: add DEMO-TB20, Talabat wins
  await btn(page, 'Add DEMO-TB20').click();
  await expect(winner(page)).toContainText('Talabat');
  await expect(winner(page)).toContainText('QAR 52.60');

  // A3: remove the spaghetti, the voucher no longer applies and Keeta wins
  await page.getByRole('button', { name: 'Edit basket' }).click();
  await btn(page, 'Decrease Jolly Spaghetti').click();
  await btn(page, 'Close').click();
  await expect(winner(page)).toContainText('Keeta');
  await expect(winner(page)).toContainText('QAR 44.00');
  await expect(page.getByText('DEMO-TB20: Add QAR 11.00 more').first()).toBeVisible();

  // Persistence: a reload keeps the basket and the voucher
  await page.reload();
  await expect(winner(page)).toContainText('QAR 44.00');

  // Restore the spaghetti from the menu
  await page.goto('/food/jollibee');
  await btn(page, 'Add Jolly Spaghetti').click();
  await page.getByRole('link', { name: /Compare 4 apps/ }).click();
  await expect(winner(page)).toContainText('QAR 52.60');

  // A4: Dukhan Bank card, Rafeeq wins
  const setProfile = async (name: string) => {
    await page.getByRole('button', { name: 'Change payment and profile' }).click();
    await page.getByRole('radio', { name, exact: true }).click();
    await btn(page, 'Close').click();
  };
  await setProfile('Dukhan Bank');
  await expect(winner(page)).toContainText('Rafeeq');
  await expect(winner(page)).toContainText('QAR 45.30');

  // A5: Apple Pay, the card offer stops applying
  await setProfile('Apple Pay');
  await expect(winner(page)).toContainText('Talabat');
  await expect(page.getByText('Not valid with Apple Pay').first()).toBeVisible();

  // A6: card again, Fastest mode
  await setProfile('Card');
  await page.getByRole('radio', { name: 'Fastest' }).click();
  await expect(winner(page)).toContainText('Talabat');
  await expect(winner(page)).toContainText('QAR 7.30 more than Best price');

  // One restaurant per basket: switching restaurant asks first
  await page.goto('/food/mcdonalds');
  await btn(page, 'Add Big Mac').click();
  await expect(page.getByRole('dialog')).toContainText('Start a new');
  await page.getByRole('button', { name: 'Start new basket' }).click();
  await expect(page.getByRole('button', { name: /Edit basket, 1 item/ })).toBeVisible();

  // No horizontal scrolling on any page
  for (const path of ['/', '/food', '/food/jollibee', '/compare/food', '/about']) {
    await page.goto(path);
    const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(scroll, `${path} overflows`).toBeLessThanOrEqual(width);
  }

  expect(errors, 'console errors').toEqual([]);
});

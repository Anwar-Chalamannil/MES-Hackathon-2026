import { expect, test, type Page } from '@playwright/test';

// C2: Choose your cards (once), Settings > My cards, and card-aware comparison.

const choose = (page: Page) => page.getByTestId('choose-cards');
const loadDemo = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try a demo basket' }).click();
  await expect(page.getByTestId('winner')).toContainText('QAR 58.00');
};

test('first visit shows Choose your cards; Save & continue hides it for good (also after a reload)', async ({ page }) => {
  await page.goto('/?reset=1');
  await expect(page.getByRole('heading', { name: 'Choose your cards' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save & continue' })).toBeDisabled();

  await choose(page).getByLabel('Card 1').selectOption('dukhan-visa-signature');
  await expect(choose(page)).toContainText('Dukhan Bank · Visa · Signature · Credit');
  await choose(page).getByRole('button', { name: 'Add another card' }).click();
  await choose(page).getByLabel('Card 2').selectOption('qnb-life-rewards-visa-infinite');
  await choose(page).getByRole('button', { name: 'Save & continue' }).click();

  await expect(page.getByRole('heading', { name: 'Choose your cards' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Choose your cards' })).toHaveCount(0);
  await page.goto('/vouchers');
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Choose your cards' })).toHaveCount(0);
});

test('the same card cannot be added twice, and no card number fields exist', async ({ page }) => {
  await page.goto('/?reset=1');
  await choose(page).getByLabel('Card 1').selectOption('dukhan-visa-signature');
  await choose(page).getByRole('button', { name: 'Add another card' }).click();
  await expect(choose(page).getByLabel('Card 2').locator('option[value="dukhan-visa-signature"]')).toHaveAttribute('disabled', '');
  await expect(page.getByLabel(/card number|cvv|expiry/i)).toHaveCount(0);
});

test('Skip for now hides it permanently; Reset demo brings it back', async ({ page }) => {
  await page.goto('/?reset=1');
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await expect(page.getByRole('heading', { name: 'Choose your cards' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Choose your cards' })).toHaveCount(0);
  await page.goto('/?reset=1');
  await expect(page.getByRole('heading', { name: 'Choose your cards' })).toBeVisible();
});

test('Settings > My cards: add, change and remove, saved at once and kept after a reload', async ({ page }) => {
  await page.goto('/?reset=1');
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'My cards' })).toBeVisible();
  await expect(page.getByText('No cards yet')).toBeVisible();

  await page.getByRole('button', { name: 'Add another card' }).click();
  await page.getByLabel('New card').selectOption('dukhan-visa-platinum');
  await page.getByRole('button', { name: 'Add another card' }).click();
  await page.getByLabel('New card').selectOption('doha-bank-lulu-platinum-mastercard');
  await page.reload();
  await expect(page.getByLabel('Card 1')).toHaveValue('dukhan-visa-platinum');
  await expect(page.getByLabel('Card 2')).toHaveValue('doha-bank-lulu-platinum-mastercard');

  await page.getByLabel('Card 1').selectOption('dukhan-visa-signature');
  await page.getByRole('button', { name: 'Remove Doha Bank LuLu Platinum Mastercard' }).click();
  await page.reload();
  await expect(page.getByLabel('Card 1')).toHaveValue('dukhan-visa-signature');
  await expect(page.getByLabel('Card 2')).toHaveCount(0);
});

test('a Dukhan Visa Signature unlocks the Rafeeq offer; a Platinum does not (same basket, engine numbers)', async ({ page }) => {
  await page.goto('/?reset=1');
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Add another card' }).click();
  await page.getByLabel('New card').selectOption('dukhan-visa-platinum');
  await loadDemo(page);
  await page.goto('/compare/food');
  await expect(page.getByTestId('winner')).toContainText('QAR 58.00'); // Platinum: no Rafeeq 30% offer

  await page.goto('/settings');
  await page.getByLabel('Card 1').selectOption('dukhan-visa-signature');
  await page.goto('/compare/food');
  await expect(page.getByTestId('winner')).toContainText('QAR 45.30');
  await expect(page.getByTestId('best-with-card')).toContainText('Best with your Dukhan Bank Visa Signature');
});

test('card offers are labelled on vouchers, with wording that never promises the offer works', async ({ page }) => {
  await page.goto('/?reset=1');
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.goto('/vouchers');
  const r1 = page.locator('[data-promo="R1"]');
  await expect(r1.getByTestId('card-offer-note')).toContainText('Card offer');
  await expect(r1).toContainText('Needs a Dukhan Bank Visa card');
  await expect(r1).toContainText('Add your cards in Settings');
  await expect(page.locator('[data-promo="S2"]').getByTestId('card-offer-note')).toHaveCount(0); // general vouchers carry no card label

  await page.goto('/settings');
  await page.getByRole('button', { name: 'Add another card' }).click();
  await page.getByLabel('New card').selectOption('dukhan-visa-signature');
  await page.goto('/vouchers');
  await expect(r1).toContainText('matches in our demo data');
  await expect(r1).not.toContainText(/guarantee/i);
});

test('phone: Settings is in the menu and nothing overflows at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/?reset=1');
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('link', { name: 'Settings: My cards' }).click();
  await expect(page.getByRole('heading', { name: 'My cards' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.goto('/?reset=1');
  const overflowHome = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflowHome).toBeLessThanOrEqual(0);
});

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test('the sidebar has Settings > My cards', async ({ page }) => {
    await page.goto('/?reset=1');
    await page.getByRole('navigation', { name: 'Settings' }).getByRole('link', { name: 'My cards' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole('heading', { name: 'My cards' })).toBeVisible();
  });
});

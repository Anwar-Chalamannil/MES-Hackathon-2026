import { expect, test } from '@playwright/test';

// V1: benefit-first vouchers. The title says what you get; the code is small, below it, with a Copy button.

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test('wallet: headline first, code below, and Copy demo code really copies', async ({ page }) => {
  await page.goto('/vouchers?reset=1');
  const card = page.locator('[data-promo="S2"]');
  const headline = card.getByTestId('voucher-benefit').locator('p').first();
  await expect(headline).toHaveText('QAR 10 OFF');
  await expect(card).toContainText('On orders above QAR 160');
  await expect(card.locator('code')).toHaveText('DEMO-SNOONU10');
  await expect(card).toContainText('It will not work in the real Snoonu app');

  // The headline sits above the code on the page.
  const hb = (await headline.boundingBox())!;
  const cb = (await card.locator('code').boundingBox())!;
  expect(hb.y).toBeLessThan(cb.y);

  await card.getByRole('button', { name: 'Copy demo code DEMO-SNOONU10' }).click();
  await expect(card.getByRole('button', { name: 'Copy demo code DEMO-SNOONU10' })).toContainText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('DEMO-SNOONU10');
});

test('percentage keeps its cap separate, first-order says so, bank offers name the card', async ({ page }) => {
  await page.goto('/vouchers?reset=1');
  await expect(page.locator('[data-promo="S3"]')).toContainText('40% OFF Your First Order');
  await expect(page.locator('[data-promo="S3"]')).toContainText('Up to QAR 20');
  await expect(page.locator('[data-promo="R1"]')).toContainText('30% OFF');
  await expect(page.locator('[data-promo="R1"]')).toContainText('Needs a Dukhan Bank Visa card');
});

test('automatic offers and sales show no code and no Copy button', async ({ page }) => {
  await page.goto('/vouchers?reset=1');
  await page.getByRole('radio', { name: /^Automatic/ }).click();
  const free = page.locator('[data-promo="C2"]');
  await expect(free).toContainText('Free Delivery');
  await expect(free).toContainText('No code needed');
  await expect(page.getByRole('button', { name: /Copy/ })).toHaveCount(0);
  const sale = page.locator('[data-promo="C3"]');
  await expect(sale).toContainText('SALE');
  await expect(sale).toContainText('no code');
});

test('expired voucher shows its code greyed with no Copy button', async ({ page }) => {
  await page.goto('/vouchers/K3?reset=1');
  await expect(page.getByTestId('voucher')).toContainText('25% OFF');
  await expect(page.getByTestId('voucher').locator('code')).toHaveText('DEMO-KT25');
  await expect(page.getByRole('button', { name: /Copy/ })).toHaveCount(0);
});

test('alerts say the benefit first and keep the code on the second line', async ({ page }) => {
  await page.goto('/notifications?reset=1');
  await expect(page.getByText(/% OFF at Rafeeq expires within 3 days/)).toBeVisible();
  await expect(page.getByText('Rafeeq: code DEMO-DKB30')).toBeVisible();
});

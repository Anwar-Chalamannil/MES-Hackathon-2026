import { expect, test, type Page } from '@playwright/test';

// G1: Guided Checkout. A checklist for ordering in the provider's own app. No order placement, payment or confirmation.

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const loadDemo = async (page: Page) => {
  await page.goto('/?reset=1');
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.getByRole('button', { name: 'Try a demo basket' }).click();
  await expect(page.getByTestId('winner')).toContainText('QAR 58.00');
};

test('Hero A: the winner (Keeta) has a Shop at button that opens its guide, with free delivery and no code', async ({ page }) => {
  await loadDemo(page);
  await page.goto('/compare/food');
  await page.getByTestId('winner').getByTestId('shop-at').click();
  await expect(page).toHaveURL(/\/guide\/food\/jb-keeta$/);
  await expect(page.getByRole('heading', { name: 'Shopping guide: Keeta' })).toBeVisible();
  await expect(page.getByTestId('guide-item')).toHaveCount(3);
  await expect(page.getByTestId('guide-item').first()).toContainText('2 × 2pc Chickenjoy');
  await expect(page.getByTestId('guide-automatic').first()).toContainText('Free Delivery');
  await expect(page.getByTestId('guide-automatic').first()).toContainText('No code needed');
  await expect(page.getByTestId('guide-voucher')).toHaveCount(0); // K2 does not apply, so nothing is claimed as applied
  await expect(page.getByRole('button', { name: /Copy/ })).toHaveCount(0);
  await expect(page.getByText('Estimated total (simulated prices)')).toBeVisible();
  await expect(page.getByRole('note')).toContainText("Perq can't place orders");
});

test('no order placement, payment, confirmation or Copy basket anywhere in the guide', async ({ page }) => {
  await loadDemo(page);
  await page.goto('/guide/food/jb-keeta');
  const body = page.locator('body');
  for (const bad of [/\bplace (an? |your )?order\b/i, /\bconfirm (your )?order\b/i, /order confirmed/i, /copy basket/i, /card number/i, /\bpay now\b/i]) {
    await expect(body).not.toContainText(bad);
  }
});

test('Talabat with DEMO-TB20: large benefit headline, small code, actual saving, working Copy demo code', async ({ page }) => {
  await loadDemo(page);
  await page.goto('/vouchers/T2');
  await page.getByRole('button', { name: 'Save DEMO-TB20' }).click();
  await page.goto('/guide/food/jb-talabat');
  const v = page.getByTestId('guide-voucher');
  await expect(v).toHaveCount(1);
  await expect(v).toContainText('20% OFF');
  await expect(v).toContainText('Up to QAR 15');
  await expect(v).toContainText('You save QAR 10.40 here');
  await expect(v.locator('code')).toHaveText('DEMO-TB20');
  await expect(v).toContainText('will not work in the real Talabat app');
  await v.getByRole('button', { name: 'Copy demo code DEMO-TB20' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('DEMO-TB20');
  await expect(page.getByTestId('guide-header')).toContainText('Talabat');
  await expect(page.getByTestId('guide-bar')).toContainText('52.60');
});

test('the open-app link is verified, opens a new tab safely, and the Perq basket stays saved', async ({ page }) => {
  await loadDemo(page);
  await page.goto('/guide/food/jb-talabat');
  const link = page.getByTestId('open-provider').last();
  await expect(link).toHaveAttribute('href', 'https://www.talabat.com/qatar');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
  await page.goto('/compare/food');
  await expect(page.getByTestId('winner')).toContainText('QAR 58.00'); // basket untouched
});

test('Keeta has no verified link, so the guide says to open the app instead', async ({ page }) => {
  await loadDemo(page);
  await page.goto('/guide/food/jb-keeta');
  await expect(page.getByTestId('open-provider')).toHaveCount(0);
  await expect(page.getByTestId('open-provider-fallback').last()).toContainText('Open the Keeta app on your phone');
});

test('an incomplete offer has no Shop button and its guide URL shows a blocking state', async ({ page }) => {
  await loadDemo(page);
  await page.goto('/food/jollibee');
  await page.getByRole('button', { name: 'Add Chocolate Sundae' }).click();
  await page.goto('/compare/food');
  await expect(page.getByTestId('winner')).toBeVisible();
  await expect(page.locator('[data-listing="jb-keeta"]').getByTestId('shop-at')).toHaveCount(0);
  await page.goto('/guide/food/jb-keeta');
  await expect(page.getByText("This store can't deliver your whole basket")).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to Compare' })).toBeVisible();
});

test('an empty basket or unknown app shows a blocking state, not a broken page', async ({ page }) => {
  await page.goto('/?reset=1');
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.goto('/guide/food/jb-talabat');
  await expect(page.getByText('Nothing to guide yet')).toBeVisible();
  await page.goto('/guide/nonsense/x');
  await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible();
});

test('phone: guide fits at 320px; desktop: two columns with the total beside the items', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await loadDemo(page);
  await page.goto('/guide/food/jb-keeta');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByTestId('guide-bar')).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByTestId('guide-bar')).toBeHidden();
  const items = (await page.getByTestId('guide-item').first().boundingBox())!;
  const total = (await page.getByRole('heading', { name: 'Estimated total (simulated prices)' }).boundingBox())!;
  expect(total.x).toBeGreaterThan(items.x + items.width);
});

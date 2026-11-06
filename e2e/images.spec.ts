import { expect, test } from '@playwright/test';

// R4: images always show something. Real files when supplied, a designed tile when not or when loading fails.

test('product thumbnails keep their size, and show a fallback tile when image requests fail', async ({ page }) => {
  await page.route('**/img/**', (route) => route.abort());
  await page.goto('/food/jollibee');
  const thumbs = page.getByTestId('product-thumb');
  await expect(thumbs.first()).toBeVisible();
  const n = await thumbs.count();
  expect(n).toBeGreaterThan(5);
  for (let i = 0; i < n; i++) {
    const box = await thumbs.nth(i).boundingBox();
    expect(box?.width).toBe(72);
    expect(box?.height).toBe(72);
    await expect(thumbs.nth(i).locator('[data-fallback="true"]')).toHaveCount(1);
    await expect(thumbs.nth(i).locator('img')).toHaveCount(0);
  }
});

test('restaurant cards show a logo or a monogram, never a broken image', async ({ page }) => {
  await page.route('**/img/**', (route) => route.abort());
  await page.goto('/food');
  const logos = page.getByTestId('merchant-logo');
  await expect(logos).toHaveCount(6);
  await expect(page.locator('[data-testid="merchant-logo"] [data-fallback="true"]')).toHaveCount(6);
});

test('with no failures, every image that is shown has loaded', async ({ page }) => {
  await page.goto('/grocery');
  await expect(page.getByTestId('product-thumb').first()).toBeVisible();
  const broken = await page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="product-thumb"] img')].filter((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth === 0).length,
  );
  expect(broken).toBe(0);
});

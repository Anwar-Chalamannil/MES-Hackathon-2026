import { expect, test } from '@playwright/test';

// R5: the Home screen. Expected totals come from src/data/demoScenarios.ts.

test.describe('phone', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?reset=1');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Compare smarter');
  });

  test('"Try a demo basket" loads the Jollibee basket and Keeta wins at QAR 58.00', async ({ page }) => {
    await page.getByRole('button', { name: 'Try a demo basket' }).click();
    await expect(page).toHaveURL('/compare/food');
    await expect(page.getByTestId('winner')).toContainText('Keeta');
    await expect(page.getByTestId('winner')).toContainText('QAR 58.00');
  });

  test('"Compare now" follows your basket, and "Try a demo basket" asks before replacing another restaurant', async ({ page }) => {
    await page.goto('/food/mcdonalds');
    await page.getByRole('button', { name: 'Add Big Mac', exact: true }).click();
    await page.goto('/');
    await page.getByRole('link', { name: 'Compare now' }).click();
    await expect(page).toHaveURL('/compare/food');
    await page.goto('/');
    await page.getByRole('button', { name: 'Try a demo basket' }).click();
    await expect(page.getByRole('dialog')).toContainText('Start a new Jollibee basket');
    await page.getByRole('button', { name: 'Keep McDonald' }).click();
    await expect(page).toHaveURL('/');
  });

  test('category tiles go to the three shops, with counts', async ({ page }) => {
    const tiles = page.getByRole('navigation', { name: 'Categories' });
    await expect(tiles).toContainText('6 restaurants');
    await tiles.getByRole('link', { name: /Groceries/ }).click();
    await expect(page).toHaveURL('/grocery');
  });

  test('featured savings: three engine-made cards, and one opens its basket', async ({ page }) => {
    const cards = page.getByTestId('featured-card');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText('Save QAR 5.00');
    await expect(cards.nth(0)).toContainText('Keeta');
    await expect(cards.nth(1)).toContainText('Save QAR 14.75');
    await expect(cards.nth(1)).toContainText('QAR 148.25');
    await expect(cards.nth(2)).toContainText('Save QAR 47.80');
    await expect(cards.nth(2)).toContainText('QAR 97.20');
    await cards.nth(1).getByRole('button', { name: /Compare this basket/ }).click();
    await expect(page).toHaveURL('/compare/grocery');
    await expect(page.getByTestId('winner')).toContainText('Carrefour');
    await expect(page.getByTestId('winner')).toContainText('QAR 148.25');
  });

  test('voucher highlights show the soonest-ending saved vouchers and open the voucher page', async ({ page }) => {
    const items = page.getByTestId('highlight');
    await expect(items).toHaveCount(3);
    await expect(items.first()).toContainText('DEMO-QNB15'); // ends in 5h, the soonest
    await items.first().click();
    await expect(page).toHaveURL('/vouchers/T3');
  });

  test('highlights say so when nothing is saved', async ({ page }) => {
    await page.goto('/vouchers');
    for (let i = 0; i < 12; i++) {
      const remove = page.getByRole('button', { name: /^Remove .* from wallet$/ }).first();
      if (!(await remove.isVisible())) break;
      await remove.click();
    }
    await page.goto('/');
    await expect(page.getByText('No saved vouchers yet')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Discover vouchers' })).toBeVisible();
  });

  test('the search pill searches', async ({ page }) => {
    await page.getByRole('searchbox').fill('cerave');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/search?q=cerave');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });

  test('live comparison toggles still re-rank, and nothing overflows from 320px to 768px', async ({ page }) => {
    await page.getByRole('button', { name: 'I add voucher DEMO-TB20' }).click();
    await expect(page.getByTestId('hero-tag').first()).toContainText('Talabat');
    for (const width of [320, 360, 390, 430, 768]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const [scroll, w] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      expect(scroll, `overflow at ${width}`).toBeLessThanOrEqual(w);
    }
  });
});

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('the live comparison sits in a right rail beside the hero, once', async ({ page }) => {
    await page.goto('/?reset=1');
    await expect(page.getByTestId('hero-tag')).toHaveCount(4);
    const hero = await page.getByRole('heading', { level: 1 }).boundingBox();
    const rail = await page.getByRole('heading', { name: 'Compare prices' }).boundingBox();
    expect(rail!.x).toBeGreaterThan(hero!.x + 400);
    await expect(page.getByRole('link', { name: 'Compare your basket' })).toBeVisible();
    await expect(page.getByRole('search').filter({ hasText: '' })).toHaveCount(1); // header search only
    const [scroll, w] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(scroll).toBeLessThanOrEqual(w);
  });
});

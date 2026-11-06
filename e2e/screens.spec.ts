import { expect, test } from '@playwright/test';

// R6: restyled screens.

const loadDemo = async (page: import('@playwright/test').Page) => {
  await page.goto('/?reset=1');
  await page.getByRole('button', { name: 'Try a demo basket' }).click();
  await expect(page.getByTestId('winner')).toContainText('QAR 58.00');
};

test('phone: two equal sort buttons that fit at 390px, and the winner has the pink pill', async ({ page }) => {
  await loadDemo(page);
  const sort = page.getByRole('radiogroup', { name: 'Sort by' }).getByRole('radio');
  await expect(sort).toHaveCount(2);
  await expect(page.getByRole('radio', { name: 'Biggest discount' })).toHaveCount(0);
  const a = (await sort.nth(0).boundingBox())!;
  const b = (await sort.nth(1).boundingBox())!;
  expect(Math.abs(a.width - b.width)).toBeLessThanOrEqual(1);
  expect(a.height).toBeLessThanOrEqual(48);
  // Discount amounts are still on the cards.
  await expect(page.getByTestId('winner')).toContainText('QAR');
  await expect(page.getByTestId('winner')).toContainText('Pays least');
  const price = page.getByTestId('offer').first().locator('.money').first();
  expect((await price.boundingBox())!.height).toBeLessThan(40); // one line, never wrapped
});

test('phone: Best for your basket says which basket and switches category', async ({ page }) => {
  await loadDemo(page);
  await page.goto('/vouchers');
  await expect(page.getByRole('heading', { name: 'Best for your Food basket' })).toBeVisible();
  await page.getByRole('radio', { name: 'Groceries' }).click();
  await expect(page.getByRole('heading', { name: 'Best for your Grocery basket' })).toBeVisible();
  await expect(page.getByTestId('best-for-basket')).toContainText('Add items');
});

test('phone: About explains images, credits and non-affiliation', async ({ page }) => {
  await page.goto('/about');
  const credits = page.getByRole('region', { name: 'Images and credits' });
  await expect(credits).toContainText('not affiliated with the brands shown');
  await expect(credits).toContainText('illustrative');
});

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('compare has a side panel with the basket, profile and Try a voucher, and cards do not squash prices', async ({ page }) => {
    await loadDemo(page);
    const rail = page.getByRole('complementary', { name: 'Basket and payment profile' });
    await expect(rail).toBeVisible();
    await expect(rail).toContainText('2×');
    await expect(rail).toContainText('2pc Chickenjoy');
    await expect(rail.getByRole('button', { name: /Offers are checked for/ })).toBeVisible();
    await expect(rail.getByRole('button', { name: 'Add DEMO-TB20' })).toBeVisible();
    for (const price of await page.getByTestId('offer').locator('.money').first().all()) {
      expect((await price.boundingBox())!.height).toBeLessThan(40);
    }
    // the side panel works: adding the voucher there changes the winner
    await rail.getByRole('button', { name: 'Add DEMO-TB20' }).click();
    await expect(page.getByTestId('winner')).toContainText('Talabat');
    await expect(page.getByTestId('winner')).toContainText('QAR 52.60');
    const [scroll, w] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(scroll).toBeLessThanOrEqual(w);
  });
});

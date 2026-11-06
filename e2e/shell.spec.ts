import { expect, test } from '@playwright/test';

// R3: navigation shell, alerts, search, compare hub, voucher pages and old-link redirects.

test.describe('phone (390px)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?reset=1');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('bottom tabs, ☰ menu reaches About, and Reset demo asks first', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main' });
    for (const name of ['Home', 'Compare', 'Vouchers']) await expect(nav.getByRole('link', { name })).toBeVisible();
    await expect(nav.getByRole('link', { name: /^Alerts/ })).toBeVisible();

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('dialog')).toContainText('Restaurants');
    await page.getByRole('link', { name: 'About Perq' }).click();
    await expect(page.getByRole('heading', { name: /About/ })).toBeVisible();

    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Reset demo' }).click();
    await expect(page.getByRole('dialog')).toContainText('Reset the demo?');
    await page.getByRole('button', { name: 'Keep my data' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('Compare opens the hub when the basket is empty, and the hub starts shopping or compares', async ({ page }) => {
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Compare' }).click();
    await expect(page).toHaveURL('/compare');
    await expect(page.getByTestId('hub-basket')).toHaveCount(3);
    await expect(page.getByTestId('hub-basket').first()).toContainText('Basket is empty');
    await page.getByRole('link', { name: 'Start shopping Groceries' }).click();
    await expect(page).toHaveURL('/grocery');
  });

  test('alerts: 10 on a fresh device, opening one marks it read, mark all, and it survives a reload', async ({ page }) => {
    const bell = page.getByRole('link', { name: 'Alerts, 10 unread' });
    await expect(bell).toBeVisible();
    await bell.click();
    await expect(page).toHaveURL('/notifications');
    await expect(page.getByTestId('notification')).toHaveCount(10);
    await expect(page.getByText('Alerts appear while Perq is open')).toBeVisible();

    await page.getByTestId('notification').first().click();
    await expect(page).toHaveURL(/\/vouchers\/[A-Za-z0-9-]+$/);
    await expect(page.getByRole('link', { name: 'Alerts, 9 unread' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('link', { name: 'Alerts, 9 unread' })).toBeVisible();

    await page.goto('/notifications');
    await expect(page.locator('[data-unread="true"]')).toHaveCount(9);
    await expect(page.locator('[data-unread="false"]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Mark all as read' }).click();
    await expect(page.locator('[data-unread="true"]')).toHaveCount(0);
    await expect(page.getByText('You are all caught up.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Alerts', exact: true })).toHaveCount(2); // bell and tab, no count
    await page.reload();
    await expect(page.getByTestId('notification')).toHaveCount(10);
    await expect(page.locator('[data-unread="true"]')).toHaveCount(0);
  });

  test('search finds a dish, adds it, and Compare then opens that basket', async ({ page }) => {
    await page.goto('/search?q=yumburger');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await page.getByRole('button', { name: 'Add Yumburger' }).click();
    await expect(page.getByRole('button', { name: 'Decrease Yumburger' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /^Compare/ }).click();
    await expect(page).toHaveURL('/compare/food');
  });

  test('search: suggestions when empty, and a clear message when nothing matches', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByRole('link', { name: 'Chickenjoy' })).toBeVisible();
    await page.getByRole('searchbox').fill('zzzxqw');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'No matches for "zzzxqw"' })).toBeVisible();
  });

  test('search: adding from another restaurant asks before replacing the basket', async ({ page }) => {
    await page.goto('/search?q=yumburger');
    await page.getByRole('button', { name: 'Add Yumburger' }).click();
    await page.goto('/search?q=big mac');
    await page.getByRole('button', { name: /^Add Big Mac/ }).first().click();
    await expect(page.getByRole('dialog')).toContainText('Start a new McDonald');
  });

  test('voucher page: details, unknown id, and old links redirect', async ({ page }) => {
    await page.goto('/vouchers/T3');
    await expect(page.getByRole('heading', { name: 'Voucher details' })).toBeVisible();
    await expect(page.getByTestId('voucher')).toContainText('DEMO-QNB15');
    await expect(page.getByRole('link', { name: /^Compare/ }).last()).toBeVisible();

    await page.goto('/vouchers/nope');
    await expect(page.getByRole('heading', { name: 'Voucher not found' })).toBeVisible();

    await page.goto('/wallet');
    await expect(page).toHaveURL('/vouchers');
    await page.goto('/expiry');
    await expect(page).toHaveURL('/vouchers/expiry');
    await page.goto('/wallet/new');
    await expect(page).toHaveURL('/vouchers/new');
    await page.goto('/wallet/U-abc');
    await expect(page).toHaveURL('/vouchers/U-abc/edit');
  });

  test('saving and removing a seed voucher from its page, and cards link to the page', async ({ page }) => {
    await page.goto('/vouchers/T2');
    await page.getByRole('button', { name: 'Save DEMO-TB20' }).click();
    await expect(page.getByRole('button', { name: 'Remove DEMO-TB20 from vouchers' })).toBeVisible();
    await page.goto('/vouchers');
    await page.getByRole('link', { name: /20% off/ }).first().click();
    await expect(page).toHaveURL(/\/vouchers\//);
  });

  test('no horizontal scroll on the new pages at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    for (const path of ['/search', '/search?q=cerave', '/compare', '/notifications', '/vouchers/T3', '/vouchers/nope']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      expect(scroll, `${path} overflows`).toBeLessThanOrEqual(width);
    }
  });
});

test.describe('desktop (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('sidebar navigation and header search work', async ({ page }) => {
    await page.goto('/?reset=1');
    const side = page.getByRole('complementary').filter({ has: page.getByRole('link', { name: 'Perq home' }) });
    await expect(side).toBeVisible();
    await expect(side.getByRole('link', { name: 'Expiry tracker' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();

    await page.getByRole('searchbox', { name: /Search restaurants/ }).fill('talabat');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/search?q=talabat');
    await expect(page.getByRole('heading', { name: 'Restaurants' })).toBeVisible();

    await side.getByRole('link', { name: 'Pharmacy & care' }).click();
    await expect(page).toHaveURL('/pharmacy');
    await side.getByRole('link', { name: 'Expiry tracker' }).click();
    await expect(page).toHaveURL('/vouchers/expiry');
    const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(scroll).toBeLessThanOrEqual(width);
  });
});

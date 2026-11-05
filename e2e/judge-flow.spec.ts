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
  await expect(page.getByRole('complementary', { name: 'Simulated data notice' })).toContainText('Simulated data');
  // The home page hero is a live comparison: flipping a toggle re-ranks the apps
  const heroFirst = page.getByTestId('hero-tag').first();
  await expect(heroFirst).toContainText('Keeta');
  await expect(heroFirst).toContainText('QAR 58.00');
  await page.getByRole('button', { name: 'I add voucher DEMO-TB20' }).click();
  await expect(heroFirst).toContainText('Talabat');
  await expect(heroFirst).toContainText('QAR 52.60');
  await page.getByRole('button', { name: 'I pay with a Dukhan Bank card' }).click();
  await expect(heroFirst).toContainText('Rafeeq');
  await expect(heroFirst).toContainText('QAR 45.30');
  await expect(page.getByTestId('hero-explanation')).toContainText('Rafeeq has the lowest total');

  await page.getByRole('link', { name: 'Compare your own basket' }).click();
  await page.getByRole('link', { name: /Jollibee/ }).click();

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
    await page.getByRole('button', { name: /Offers are checked for/ }).click();
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
  for (const path of ['/', '/food', '/food/jollibee', '/compare/food', '/grocery', '/pharmacy', '/wallet', '/wallet/new', '/expiry', '/about']) {
    await page.goto(path);
    const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(scroll, `${path} overflows`).toBeLessThanOrEqual(width);
  }

  expect(errors, 'console errors').toEqual([]);
});

test('wallet: add, edit and delete a voucher, and track expiry (all saved across reloads)', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/?reset=1');

  // Validation: an empty form explains what to fix
  await page.goto('/wallet/new');
  await page.getByRole('button', { name: 'Save voucher' }).click();
  await expect(page.getByRole('alert').first()).toContainText('Choose which app');

  // Add a voucher
  await page.getByLabel('App', { exact: true }).selectOption('talabat');
  await page.getByLabel('Name', { exact: true }).fill('E2E voucher');
  await page.getByLabel('Discount', { exact: true }).selectOption('fixed');
  await page.getByLabel('Amount off (QAR)').fill('5');
  await page.getByRole('button', { name: 'Save voucher' }).click();

  const mine = page.getByTestId('voucher').filter({ hasText: 'Your voucher' });
  await expect(mine).toContainText('E2E voucher');
  await expect(mine).toContainText('QAR 5.00 off');

  // Persistence
  await page.reload();
  await expect(mine).toContainText('E2E voucher');

  // Edit
  await mine.getByRole('link', { name: 'Edit' }).click();
  await page.getByLabel('Name', { exact: true }).fill('E2E renamed');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(mine).toContainText('E2E renamed');

  // It shows up in the expiry tracker with a countdown
  await page.goto('/expiry');
  await expect(page.getByTestId('expiry-row').filter({ hasText: 'E2E renamed' })).toContainText('Ends in');

  // Expiry filters (seed vouchers expire relative to the first visit)
  await page.getByRole('button', { name: /^Within 24 hours/ }).click();
  await expect(page.getByTestId('expiry-row')).toHaveCount(3);
  await page.getByRole('button', { name: /^Expired/ }).click();
  await expect(page.getByTestId('expiry-row')).toHaveCount(3);
  await expect(page.getByTestId('expiry-row').first()).toContainText('Expired');

  // Delete (asks first), and it stays deleted after a reload
  await page.goto('/wallet');
  await page.getByRole('button', { name: 'Delete E2E renamed' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByTestId('voucher').filter({ hasText: 'Your voucher' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('voucher').filter({ hasText: 'Your voucher' })).toHaveCount(0);

  expect(errors, 'console errors').toEqual([]);
});

test('resilience: damaged saved data, unknown page, and keyboard use', async ({ page }) => {
  const crashes: string[] = [];
  page.on('pageerror', (e) => crashes.push(e.message));

  // Damaged saved data (wrong shape) is ignored: the app starts fresh instead of crashing
  await page.addInitScript(() => {
    try {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('basketwise', '{"state":{"baskets":5,"wallet":null},"version":1}');
        sessionStorage.setItem('seeded', '1');
      }
    } catch { /* ignore */ }
  });
  await page.goto('/wallet');
  await expect(page.getByRole('heading', { name: 'Voucher wallet' })).toBeVisible();
  await expect(page.getByRole('radio', { name: /Saved \(12\)/ })).toBeVisible(); // defaults restored

  // Saved data that is not even valid JSON
  await page.evaluate(() => localStorage.setItem('basketwise', 'not json {{'));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Voucher wallet' })).toBeVisible();

  // Unknown page: friendly message, a working way home, and a matching tab title
  await page.goto('/no-such-page');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page).toHaveTitle(/Page not found/);
  await page.getByRole('link', { name: 'Go to the home page' }).click();
  await expect(page).toHaveURL('/');
  await expect(page).toHaveTitle(/compare what you actually pay/);

  // Keyboard: the first Tab stop is the skip link
  await page.goto('/about');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();

  // Keyboard: a sheet closes with Escape and returns focus; Tab stays inside it
  await page.goto('/food/jollibee');
  await page.getByRole('button', { name: 'Add 1pc Chickenjoy', exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 400)); // a new page must start at the top, not mid-scroll
  await page.getByRole('link', { name: /Compare 4 apps/ }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  const trigger = page.getByRole('button', { name: /Offers are checked for/ });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  for (let i = 0; i < 25; i++) await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')), 'focus escaped the sheet').toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();

  expect(crashes, 'page errors').toEqual([]);
});

import { describe, expect, it } from 'vitest';
import { compareBasket } from '../compare';
import type { Basket, Catalog, CompareInput, Promotion, SortMode, Wallet } from '../types';
import { ANCHOR, emptyWallet, fixtureBasket, fixtureCatalog, fixtureProfile, NOW, promo } from './fixtures';

// Burger x2: Talabat 40.00 + 9.00 + 2.00 = 51.00. Snoonu 42.00 + 5.00 = 47.00.
const run = (over: Partial<CompareInput> & { promotions?: Promotion[] } = {}) => {
  const { promotions, ...rest } = over;
  const catalog: Catalog = promotions ? { ...fixtureCatalog, promotions } : fixtureCatalog;
  return compareBasket({
    catalog, basket: fixtureBasket, wallet: emptyWallet, profile: fixtureProfile,
    nowMs: NOW, anchorMs: ANCHOR, mode: 'price', ...rest,
  });
};
const totals = (c: ReturnType<typeof run>) => Object.fromEntries(c.ranked.map((o) => [o.listingId, o.totalDh]));
const saved = (...ids: string[]): Wallet => ({ savedIds: ids, custom: [] });
const t = (id: string, over: Partial<Promotion> = {}) => promo({ id, platformId: 'talabat', ...over });
const s = (id: string, over: Partial<Promotion> = {}) => promo({ id, platformId: 'snoonu', ...over });

describe('basic comparison', () => {
  it('compares different platform prices and fees', () => {
    const c = run();
    expect(totals(c)).toEqual({ 'cafe-talabat': 5100, 'cafe-snoonu': 4700 });
    expect(c.winnerId).toBe('cafe-snoonu');
    expect(c.ranked.map((o) => o.listingId)).toEqual(['cafe-snoonu', 'cafe-talabat']);
    expect(c.singlePlatform).toBe(false);
  });
  it('updates when quantities change', () => {
    const basket: Basket = { ...fixtureBasket, lines: [{ productId: 'cafe-burger', qty: 3 }] };
    expect(totals(run({ basket }))).toEqual({ 'cafe-talabat': 6000 + 900 + 200, 'cafe-snoonu': 6300 + 500 });
  });
  it('returns an empty comparison for an empty basket', () => {
    const c = run({ basket: { ...fixtureBasket, lines: [] } });
    expect(c.ranked).toEqual([]);
    expect(c.winnerId).toBeUndefined();
  });
  it('totals always equal items + fees - voucher savings', () => {
    const c = run({
      promotions: [t('T', { benefit: { type: 'fixed', dh: 700 } })],
      wallet: saved('T'),
    });
    for (const o of c.ranked) {
      expect(o.totalDh).toBe(o.itemsDh + o.deliveryDh + o.serviceDh + o.smallOrderDh - o.promoSavingsDh);
      expect(o.totalSavingsDh).toBe(o.saleSavingsDh + o.promoSavingsDh);
    }
  });
});

describe('incomplete baskets', () => {
  it('excludes a platform missing an item from the ranking and lists what is missing', () => {
    const basket: Basket = {
      ...fixtureBasket,
      lines: [{ productId: 'cafe-burger', qty: 2 }, { productId: 'cafe-cola', qty: 1 }], // cola not on Snoonu
    };
    const c = run({ basket });
    expect(c.ranked.map((o) => o.listingId)).toEqual(['cafe-talabat']);
    expect(c.incomplete.map((o) => o.listingId)).toEqual(['cafe-snoonu']);
    expect(c.incomplete[0].missing).toEqual(['cafe-cola']);
    expect(c.winnerId).toBe('cafe-talabat');
    expect(c.ranked[0].totalDh).toBe(4500 + 900 + 200);
  });
  it('has no winner when no platform can deliver everything (rejection case)', () => {
    const c = run({ basket: { ...fixtureBasket, lines: [{ productId: 'ghost', qty: 1 }] } });
    expect(c.ranked).toEqual([]);
    expect(c.incomplete).toHaveLength(2);
    expect(c.winnerId).toBeUndefined();
    expect(c.explanation).toBe('No app in our sample can deliver your whole basket.');
  });
  it('never applies vouchers to an incomplete offer', () => {
    const basket: Basket = { ...fixtureBasket, lines: [{ productId: 'cafe-cola', qty: 1 }, { productId: 'cafe-burger', qty: 1 }] };
    const c = run({ basket, promotions: [s('S', { benefit: { type: 'fixed', dh: 500 } })], wallet: saved('S') });
    expect(c.incomplete[0].applied).toEqual([]);
    expect(c.incomplete[0].evaluations).toEqual([]);
  });
});

describe('single-platform merchants', () => {
  it('shows the offer but names no winner', () => {
    const catalog: Catalog = { ...fixtureCatalog, listings: [fixtureCatalog.listings[0]] };
    const c = compareBasket({
      catalog, basket: fixtureBasket, wallet: emptyWallet, profile: fixtureProfile,
      nowMs: NOW, anchorMs: ANCHOR, mode: 'price',
    });
    expect(c.singlePlatform).toBe(true);
    expect(c.winnerId).toBeUndefined();
    expect(c.ranked).toHaveLength(1);
    expect(c.explanation).toBe('Only on Talabat in our sample, so there is nothing to compare yet.');
  });
});

describe('vouchers change the result', () => {
  const pct20 = t('T2', { benefit: { type: 'percent', pct: 20, capDh: 1500 } });

  it('a saved code can flip the winner', () => {
    const c = run({ promotions: [pct20], wallet: saved('T2') });
    expect(totals(c)['cafe-talabat']).toBe(5100 - 800);
    expect(c.winnerId).toBe('cafe-talabat');
  });
  it('a seed code that is not saved is not used (rejection case)', () => {
    const c = run({ promotions: [pct20], wallet: emptyWallet });
    expect(c.winnerId).toBe('cafe-snoonu');
    expect(c.ranked.find((o) => o.listingId === 'cafe-talabat')?.evaluations).toEqual([]);
  });
  it('a custom voucher in the wallet is used', () => {
    const custom = t('U1', { origin: 'user', benefit: { type: 'fixed', dh: 1000 } });
    const c = run({ wallet: { savedIds: [], custom: [custom] } });
    expect(totals(c)['cafe-talabat']).toBe(5100 - 1000);
  });
  it('auto promotions apply without being saved', () => {
    const freeDelivery = s('S1', { kind: 'auto', benefit: { type: 'free_delivery' }, target: 'delivery' });
    const c = run({ promotions: [freeDelivery] });
    expect(totals(c)['cafe-snoonu']).toBe(4700 - 500);
    expect(c.explanation).toBe('Snoonu has the lowest total: QAR 42.00, helped by free delivery.');
  });
  it('a minimum spend that is not met blocks the voucher and says why (rejection case)', () => {
    const c = run({
      promotions: [t('T', { benefit: { type: 'fixed', dh: 1000 }, conditions: { minSpendDh: 5000, expiry: { relHours: 48 } } })],
      wallet: saved('T'),
    });
    const ev = c.ranked.find((o) => o.listingId === 'cafe-talabat')!.evaluations[0];
    expect(ev.eligible).toBe(false);
    expect(ev.reason).toContain('Add QAR 10.00 more');
    expect(totals(c)['cafe-talabat']).toBe(5100);
  });
  it('an expired voucher is not applied (rejection case)', () => {
    const c = run({
      promotions: [t('T', { benefit: { type: 'fixed', dh: 1000 }, conditions: { expiry: { relHours: -1 } } })],
      wallet: saved('T'),
    });
    expect(totals(c)['cafe-talabat']).toBe(5100);
    expect(c.ranked.find((o) => o.listingId === 'cafe-talabat')!.evaluations[0].reason).toContain('Expired');
  });
  it('a voucher only applies on its own platform', () => {
    const c = run({ promotions: [t('T', { benefit: { type: 'fixed', dh: 1000 } })], wallet: saved('T') });
    expect(totals(c)['cafe-snoonu']).toBe(4700);
  });
  it('explains which eligible voucher was not used', () => {
    const a = t('A', { benefit: { type: 'fixed', dh: 500 } });
    const b = t('B', { benefit: { type: 'fixed', dh: 900 } });
    const c = run({ promotions: [a, b], wallet: saved('A', 'B') });
    const evs = c.ranked.find((o) => o.listingId === 'cafe-talabat')!.evaluations;
    expect(evs.find((e) => e.promoId === 'B')?.reason).toBe('Applied: -QAR 9.00');
    expect(evs.find((e) => e.promoId === 'A')?.reason).toContain('not used');
  });
});

describe('sorting modes', () => {
  const modeWinner = (mode: SortMode, over: Partial<CompareInput> & { promotions?: Promotion[] } = {}) =>
    run({ mode, ...over }).winnerId;

  it('best price, fastest and biggest discount can disagree', () => {
    // Talabat gets a QAR 3.00 voucher: still QAR 1.00 more than Snoonu, but the bigger discount.
    const over = { promotions: [t('T', { benefit: { type: 'fixed', dh: 300 } })], wallet: saved('T') };
    expect(modeWinner('price', over)).toBe('cafe-snoonu');
    expect(modeWinner('fastest', over)).toBe('cafe-talabat'); // 25-35 min vs 30-40 min
    expect(modeWinner('discount', over)).toBe('cafe-talabat');
    expect(run({ mode: 'discount', ...over }).explanation).toBe(
      'Talabat has the biggest discount: QAR 3.00 off. It costs QAR 1.00 more than Best price.',
    );
  });
  it('fastest explains the price gap', () => {
    expect(run({ mode: 'fastest' }).explanation).toBe(
      'Talabat delivers fastest (25–35 min). It costs QAR 4.00 more than Best price.',
    );
  });
});

describe('determinism', () => {
  it('gives the same result for the same input and any wallet order', () => {
    const promotions = [
      t('A', { benefit: { type: 'fixed', dh: 500 } }),
      t('B', { benefit: { type: 'fixed', dh: 500 } }),
    ];
    const one = run({ promotions, wallet: saved('A', 'B') });
    const two = run({ promotions, wallet: saved('B', 'A') });
    expect(two).toEqual(one);
    expect(run({ promotions, wallet: saved('A', 'B') })).toEqual(one);
  });
});

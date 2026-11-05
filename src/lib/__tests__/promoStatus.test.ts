import { describe, expect, it } from 'vitest';
import { compareBasket } from '../../engine/compare';
import {
  ANCHOR, emptyWallet, fixtureBasket, fixtureCatalog, fixtureProfile, NOW, promo,
} from '../../engine/__tests__/fixtures';
import type { Basket, Catalog, Promotion, Wallet } from '../../engine/types';
import { cheapestOffer, promoStatus } from '../promoStatus';

// Burger x2: Talabat 40.00 + 9.00 + 2.00 = 51.00. Snoonu 42.00 + 5.00 = 47.00 (Snoonu is cheapest).
const t = (id: string, over: Partial<Promotion> = {}) => promo({ id, platformId: 'talabat', ...over });
const s = (id: string, over: Partial<Promotion> = {}) => promo({ id, platformId: 'snoonu', ...over });

function status(p: Promotion, opts: { promotions?: Promotion[]; wallet?: Wallet; basket?: Basket; saved?: boolean; catalog?: Catalog } = {}) {
  const catalog = opts.catalog ?? { ...fixtureCatalog, promotions: opts.promotions ?? [p] };
  const basket = opts.basket ?? fixtureBasket;
  const wallet = opts.wallet ?? { savedIds: [p.id], custom: [] };
  const comparison = compareBasket({ catalog, basket, wallet, profile: fixtureProfile, nowMs: NOW, anchorMs: ANCHOR, mode: 'price' });
  return promoStatus(p, { comparison, basket, catalog, profile: fixtureProfile, nowMs: NOW, anchorMs: ANCHOR, saved: opts.saved ?? true });
}

describe('promoStatus', () => {
  it('says a sale applies automatically', () => {
    const sale = t('SALE', { kind: 'sale', benefit: { type: 'sale_price' } });
    expect(status(sale).state).toBe('info');
  });
  it('asks for items when the basket is empty', () => {
    const r = status(t('T'), { basket: { ...fixtureBasket, lines: [] } });
    expect(r.state).toBe('none');
    expect(r.headline).toContain('Add items');
  });
  it('reports where a voucher is applied and the resulting total', () => {
    const r = status(t('T', { benefit: { type: 'fixed', dh: 1000 } }));
    expect(r.state).toBe('applied');
    expect(r.headline).toBe('Applied on Talabat: -QAR 10.00. Your total there is QAR 41.00.');
    expect(r.best).toBe(true); // 41.00 beats Snoonu 47.00
  });
  it('is not "best" when another app is still cheaper', () => {
    const r = status(t('T', { benefit: { type: 'fixed', dh: 300 } })); // Talabat 48.00 vs Snoonu 47.00
    expect(r.state).toBe('applied');
    expect(r.best).toBe(false);
  });
  it('explains a blocked voucher (rejection case)', () => {
    const r = status(t('T', { conditions: { minSpendDh: 9000, expiry: { relHours: 48 } } }));
    expect(r.state).toBe('failed');
    expect(r.headline).toBe('Talabat: Add QAR 50.00 more (minimum QAR 90.00 of eligible items)');
  });
  it('explains an expired voucher', () => {
    const r = status(t('T', { conditions: { expiry: { relHours: -5 } } }));
    expect(r.state).toBe('failed');
    expect(r.headline).toContain('Expired 5h ago');
  });
  it('previews an unsaved voucher without applying it', () => {
    const p = t('T', { benefit: { type: 'fixed', dh: 1000 } });
    const r = status(p, { wallet: emptyWallet, saved: false });
    expect(r.state).toBe('eligible');
    expect(r.headline).toBe('Would save QAR 10.00 on Talabat if you save it.');
  });
  it('says when an eligible voucher was not used', () => {
    const a = t('A', { benefit: { type: 'fixed', dh: 500 } });
    const b = t('B', { benefit: { type: 'fixed', dh: 900 } });
    const r = status(a, { promotions: [a, b], wallet: { savedIds: ['A', 'B'], custom: [] } });
    expect(r.state).toBe('eligible');
    expect(r.headline).toContain('not used');
  });
  it('cannot check a voucher for an app that cannot deliver the whole basket (rejection case)', () => {
    const basket: Basket = { ...fixtureBasket, lines: [{ productId: 'cafe-cola', qty: 1 }, { productId: 'cafe-burger', qty: 1 }] }; // cola not on Snoonu
    const r = status(s('S'), { basket });
    expect(r.state).toBe('none');
    expect(r.headline).toBe("Snoonu can't deliver your whole basket, so this can't be checked.");
  });
  it('says when the app is not in the comparison at all', () => {
    const r = status(promo({ id: 'K', platformId: 'keeta' }));
    expect(r.state).toBe('none');
    expect(r.headline).toContain('not in your current food comparison');
  });
  it('evaluates unsaved auto offers too (always candidates)', () => {
    const auto = s('AUTO', { kind: 'auto', benefit: { type: 'free_delivery' }, target: 'delivery' });
    expect(status(auto, { wallet: emptyWallet }).state).toBe('applied');
  });
});

describe('cheapestOffer', () => {
  it('returns the lowest total whatever the sort mode', () => {
    const c = compareBasket({ catalog: fixtureCatalog, basket: fixtureBasket, wallet: emptyWallet, profile: fixtureProfile, nowMs: NOW, anchorMs: ANCHOR, mode: 'fastest' });
    expect(c.ranked[0].listingId).toBe('cafe-talabat'); // fastest
    expect(cheapestOffer(c)?.listingId).toBe('cafe-snoonu'); // cheapest
  });
  it('returns nothing when nothing is ranked', () => {
    const c = compareBasket({ catalog: fixtureCatalog, basket: { ...fixtureBasket, lines: [] }, wallet: emptyWallet, profile: fixtureProfile, nowMs: NOW, anchorMs: ANCHOR, mode: 'price' });
    expect(cheapestOffer(c)).toBeUndefined();
  });
});

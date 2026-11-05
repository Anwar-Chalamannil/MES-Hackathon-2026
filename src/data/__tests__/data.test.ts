import { describe, expect, it } from 'vitest';
import { expiryBucket, resolveExpiry } from '../../engine/time';
import type { Product, Promotion } from '../../engine/types';
import { catalog } from '../catalog';
import { DEFAULT_SAVED_IDS } from '../defaults';
import { sources } from '../sources';

const ANCHOR = Date.UTC(2026, 10, 5, 9, 0); // same demo clock as demo.test.ts
const { platforms, merchants, listings, products, promotions } = catalog;
const listingById = new Map(listings.map((l) => [l.id, l]));
const sourceById = new Map(sources.map((s) => [s.id, s]));
const expiryOf = (p: Promotion) => resolveExpiry(p.conditions.expiry, ANCHOR);
const isExpired = (p: Promotion) => expiryOf(p) <= ANCHOR;
const byScenario = (s: Product['scenario']) => products.filter((p) => p.scenario === s);
const within = (price: number, ref: number, pct: number) => Math.abs(price - ref) * 100 <= ref * pct;

describe('ids and references', () => {
  it('has unique ids in every collection', () => {
    for (const list of [platforms, merchants, listings, products, promotions, sources]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size, `duplicate id in ${ids.join(',').slice(0, 60)}`).toBe(ids.length);
    }
  });
  it('listings point at real platforms and merchants of the same scenario', () => {
    for (const l of listings) {
      expect(platforms.some((p) => p.id === l.platformId), l.id).toBe(true);
      const m = merchants.find((x) => x.id === l.merchantId);
      expect(m, `${l.id} merchant`).toBeDefined();
      expect(m?.scenario, l.id).toBe(l.scenario);
    }
  });
  it('every product price is for a listing of the right scenario (and merchant for food)', () => {
    for (const p of products) {
      expect(Object.keys(p.prices).length, `${p.id} has a price`).toBeGreaterThan(0);
      for (const listingId of Object.keys(p.prices)) {
        const l = listingById.get(listingId);
        expect(l, `${p.id} -> ${listingId}`).toBeDefined();
        expect(l?.scenario, `${p.id} -> ${listingId}`).toBe(p.scenario);
        if (p.scenario === 'food') expect(l?.merchantId, `${p.id} -> ${listingId}`).toBe(p.merchantId);
      }
    }
  });
  it('every listing is used by at least one product', () => {
    for (const l of listings) {
      expect(products.some((p) => l.id in p.prices), l.id).toBe(true);
    }
  });
  it('every sale has a price at that listing and points to a sale promotion on the same platform', () => {
    for (const p of products) {
      for (const [listingId, sale] of Object.entries(p.sale ?? {})) {
        expect(p.prices[listingId], `${p.id} sale needs a regular price at ${listingId}`).toBeDefined();
        expect(sale.saleDh).toBeLessThan(p.prices[listingId]);
        const promo = promotions.find((x) => x.id === sale.promoId);
        expect(promo?.kind, `${p.id} ${sale.promoId}`).toBe('sale');
        expect(promo?.platformId, `${p.id} ${sale.promoId}`).toBe(listingById.get(listingId)?.platformId);
      }
    }
  });
  it('every sale promotion is used by at least one product', () => {
    for (const promo of promotions.filter((x) => x.kind === 'sale')) {
      expect(products.some((p) => Object.values(p.sale ?? {}).some((s) => s.promoId === promo.id)), promo.id).toBe(true);
    }
  });
});

describe('prices', () => {
  it('are positive whole dirhams, on the right granularity, and near the reference price', () => {
    for (const p of products) {
      const step = p.scenario === 'food' ? 50 : 25; // QAR 0.50 for food, QAR 0.25 for groceries and pharmacy
      const tolerance = p.scenario === 'food' ? 20 : 12; // percent
      expect(Number.isInteger(p.refPriceDh) && p.refPriceDh > 0, `${p.id} ref`).toBe(true);
      const sales = Object.values(p.sale ?? {}).map((s) => s.saleDh);
      for (const price of [...Object.values(p.prices), ...sales]) {
        expect(Number.isInteger(price) && price > 0, `${p.id} price ${price}`).toBe(true);
        expect(price % step, `${p.id} ${price} not a multiple of ${step}`).toBe(0);
      }
      for (const price of Object.values(p.prices)) {
        expect(within(price, p.refPriceDh, tolerance), `${p.id}: ${price} vs ref ${p.refPriceDh}`).toBe(true);
      }
    }
  });
});

describe('catalogue size and shape', () => {
  const restaurants = merchants.filter((m) => m.kind === 'restaurant');
  it('has six restaurants with 6 to 8 items and at least 6 available per listing', () => {
    expect(restaurants).toHaveLength(6);
    for (const m of restaurants) {
      const items = products.filter((p) => p.merchantId === m.id);
      expect(items.length, m.name).toBeGreaterThanOrEqual(6);
      expect(items.length, m.name).toBeLessThanOrEqual(8);
      for (const l of listings.filter((x) => x.merchantId === m.id)) {
        expect(items.filter((p) => l.id in p.prices).length, l.id).toBeGreaterThanOrEqual(6);
      }
    }
  });
  it('has the agreed edge cases: Shake Shack on one platform, Jollibee on four', () => {
    expect(listings.filter((l) => l.merchantId === 'shake-shack')).toHaveLength(1);
    expect(listings.filter((l) => l.merchantId === 'jollibee')).toHaveLength(4);
  });
  it('has 18 to 25 groceries, each on at least 3 stores, and 8 to 12 pharmacy products on at least 3', () => {
    const groceries = byScenario('grocery');
    const pharmacy = byScenario('pharmacy');
    expect(groceries.length).toBeGreaterThanOrEqual(18);
    expect(groceries.length).toBeLessThanOrEqual(25);
    expect(pharmacy.length).toBeGreaterThanOrEqual(8);
    expect(pharmacy.length).toBeLessThanOrEqual(12);
    for (const p of [...groceries, ...pharmacy]) {
      expect(Object.keys(p.prices).length, p.id).toBeGreaterThanOrEqual(3);
      expect(p.brand && p.size, `${p.id} needs brand and size for exact matching`).toBeTruthy();
    }
  });
  it('contains no medicines (pharmacy is skincare, personal care and baby care only)', () => {
    const allowed = new Set(['skincare', 'personal-care', 'baby-care']);
    for (const p of byScenario('pharmacy')) expect(allowed.has(p.category), p.id).toBe(true);
  });
});

describe('promotions', () => {
  it('has 24 to 30 records and at least 2 per platform', () => {
    expect(promotions.length).toBeGreaterThanOrEqual(24);
    expect(promotions.length).toBeLessThanOrEqual(30);
    for (const pl of platforms) {
      expect(promotions.filter((p) => p.platformId === pl.id).length, pl.id).toBeGreaterThanOrEqual(2);
    }
  });
  it('refer to real platforms, merchants and categories', () => {
    const categories = new Set(products.map((p) => p.category));
    for (const p of promotions) {
      expect(platforms.some((x) => x.id === p.platformId), p.id).toBe(true);
      for (const m of p.conditions.merchantIds ?? []) expect(merchants.some((x) => x.id === m), `${p.id} ${m}`).toBe(true);
      for (const c of p.conditions.categories ?? []) expect(categories.has(c), `${p.id} category ${c}`).toBe(true);
    }
  });
  it('active codes start with DEMO- (only expired historical codes are real)', () => {
    for (const p of promotions.filter((x) => x.code && !isExpired(x))) {
      expect(p.code, p.id).toMatch(/^DEMO-/);
    }
  });
  it('researched_historical records are in the past and have real dates', () => {
    for (const p of promotions.filter((x) => x.classification === 'researched_historical')) {
      expect(isExpired(p), p.id).toBe(true);
      expect('iso' in p.conditions.expiry, `${p.id} needs an absolute date`).toBe(true);
    }
  });
  it('has at most 4 auto/membership promotions per platform (keeps the optimiser fast)', () => {
    for (const pl of platforms) {
      const n = promotions.filter((p) => p.platformId === pl.id && (p.kind === 'auto' || p.kind === 'membership')).length;
      expect(n, pl.id).toBeLessThanOrEqual(4);
    }
  });
  it('default wallet ids exist and are codes or bank offers', () => {
    for (const id of DEFAULT_SAVED_IDS) {
      const p = promotions.find((x) => x.id === id);
      expect(p, id).toBeDefined();
      expect(['code', 'bank'], id).toContain(p?.kind);
    }
  });
  it('covers every kind of promotion the engine supports', () => {
    const count = (f: (p: Promotion) => boolean) => promotions.filter(f).length;
    expect(count((p) => p.benefit.type === 'percent' && p.benefit.capDh !== undefined)).toBeGreaterThanOrEqual(4);
    expect(count((p) => p.benefit.type === 'fixed')).toBeGreaterThanOrEqual(3);
    expect(count((p) => p.benefit.type === 'free_delivery')).toBeGreaterThanOrEqual(4);
    expect(count((p) => p.kind === 'bank')).toBeGreaterThanOrEqual(3);
    expect(count((p) => p.conditions.firstOrder === true)).toBeGreaterThanOrEqual(3);
    expect(count((p) => p.kind === 'membership')).toBeGreaterThanOrEqual(3);
    expect(count((p) => p.conditions.categories !== undefined)).toBeGreaterThanOrEqual(2);
    expect(count((p) => p.kind === 'sale')).toBeGreaterThanOrEqual(3);
    expect(count((p) => p.conditions.minSpendDh !== undefined)).toBeGreaterThanOrEqual(5);
    expect(count((p) => Object.values(p.stacking).every((v) => v === false))).toBeGreaterThanOrEqual(2); // non-combinable
    expect(count((p) => p.classification === 'researched_historical')).toBeGreaterThanOrEqual(1);
  });
  it('spreads expiry across every bucket so the tracker has something to show', () => {
    const bucket = (b: string) => promotions.filter((p) => expiryBucket(expiryOf(p), ANCHOR) === b).length;
    expect(bucket('expired')).toBeGreaterThanOrEqual(2);
    expect(bucket('24h')).toBeGreaterThanOrEqual(2);
    expect(bucket('3d')).toBeGreaterThanOrEqual(2);
    expect(bucket('7d')).toBeGreaterThanOrEqual(2);
  });
});

describe('provenance and evidence', () => {
  it('every source reference exists', () => {
    for (const x of [...merchants, ...products, ...promotions]) {
      if (x.sourceId) expect(sourceById.has(x.sourceId), `${x.id} -> ${x.sourceId}`).toBe(true);
    }
  });
  it('researched and documented records name a source', () => {
    for (const m of merchants.filter((x) => x.provenance === 'researched')) expect(m.sourceId, m.id).toBeDefined();
    for (const p of products.filter((x) => x.provenance === 'researched')) expect(p.sourceId, p.id).toBeDefined();
    for (const p of promotions.filter((x) => x.classification !== 'invented_demo')) expect(p.sourceId, p.id).toBeDefined();
  });
  it('classification and confidence never overstate the evidence', () => {
    for (const x of [...merchants, ...products].filter((m) => m.provenance === 'researched')) {
      expect(sourceById.get(x.sourceId!)?.evidence, x.id).toBe('read_directly');
    }
    for (const p of promotions.filter((x) => x.sourceId)) {
      const evidence = sourceById.get(p.sourceId!)!.evidence;
      if (evidence !== 'read_directly') {
        expect(p.classification, `${p.id} cannot be researched from a ${evidence}`).toBe('documented_structure');
        expect(p.confidence, `${p.id} confidence from a ${evidence}`).toBe('low');
      }
      if (p.classification === 'researched_historical') expect(evidence, p.id).toBe('read_directly');
      if (p.confidence === 'high') expect(evidence, p.id).toBe('read_directly');
    }
  });
  it('invented demo records are never high confidence', () => {
    for (const p of promotions.filter((x) => x.classification === 'invented_demo')) expect(p.confidence, p.id).toBe('low');
  });
});

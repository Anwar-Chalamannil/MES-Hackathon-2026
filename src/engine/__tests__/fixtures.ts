import type { Basket, Catalog, PlatformId, PricedOffer, Profile, Promotion, Wallet } from '../types';

/** A ready-made priced offer for sort/explain tests. */
export function offer(
  listingId: string,
  platformId: PlatformId,
  totalDh: number,
  eta: [number, number],
  savingsDh = 0,
  complete = true,
): PricedOffer {
  return {
    listingId, platformId, merchantId: 'm', eta, complete, missing: complete ? [] : ['x'], lines: [],
    itemsDh: totalDh, saleSavingsDh: 0, deliveryDh: 0, serviceDh: 0, smallOrderDh: 0,
    applied: [], promoSavingsDh: savingsDh, totalSavingsDh: savingsDh, totalDh, evaluations: [],
  };
}

/**
 * Tiny catalogue for engine unit tests (P3). Independent of src/data.
 * Two food listings for one merchant 'cafe' plus a second merchant listing, so tests can cover
 * missing items and merchant scoping. All amounts are integer dirhams.
 */
export const NOW = Date.UTC(2026, 10, 5, 9, 0); // 12:00 Qatar time
export const ANCHOR = NOW;
export const HOUR = 3_600_000;

export const fixtureCatalog: Catalog = {
  platforms: [
    { id: 'talabat', name: 'Talabat', color: '#f60', initials: 'T' },
    { id: 'snoonu', name: 'Snoonu', color: '#d00', initials: 'S' },
  ],
  merchants: [
    { id: 'cafe', name: 'Test Cafe', scenario: 'food', kind: 'restaurant', tagline: 'fixture', provenance: 'sample' },
  ],
  listings: [
    {
      id: 'cafe-talabat', platformId: 'talabat', merchantId: 'cafe', scenario: 'food', branchLabel: 'Fixture',
      fees: { deliveryDh: 900, service: { kind: 'fixed', dh: 200 }, smallOrder: { belowDh: 2500, feeDh: 500 } },
      eta: [25, 35],
    },
    {
      id: 'cafe-snoonu', platformId: 'snoonu', merchantId: 'cafe', scenario: 'food', branchLabel: 'Fixture',
      fees: { deliveryDh: 500, service: { kind: 'none' } },
      eta: [30, 40],
    },
  ],
  products: [
    {
      id: 'cafe-burger', scenario: 'food', merchantId: 'cafe', name: 'Burger', category: 'burgers',
      description: 'fixture', refPriceDh: 2000, provenance: 'sample',
      prices: { 'cafe-talabat': 2000, 'cafe-snoonu': 2100 },
    },
    {
      id: 'cafe-cola', scenario: 'food', merchantId: 'cafe', name: 'Cola', category: 'drinks',
      description: 'fixture', refPriceDh: 500, provenance: 'sample',
      prices: { 'cafe-talabat': 500 }, // unavailable on Snoonu -> incomplete there
    },
  ],
  promotions: [],
};

export const fixtureBasket: Basket = {
  scenario: 'food',
  merchantId: 'cafe',
  lines: [{ productId: 'cafe-burger', qty: 2 }],
};

export const fixtureProfile: Profile = {
  channel: 'card', issuer: 'other', network: 'visa', memberships: [], firstOrderOn: [],
};

export const emptyWallet: Wallet = { savedIds: [], custom: [] };

/** Builds a promotion with sensible defaults; override what the test cares about. */
export function promo(over: Partial<Promotion> & Pick<Promotion, 'id' | 'platformId'>): Promotion {
  return {
    name: over.id,
    kind: 'code',
    benefit: { type: 'fixed', dh: 100 },
    target: 'items',
    conditions: { expiry: { relHours: 48 } },
    stacking: { withCodes: false, withBank: true, withMembership: true, withAuto: true },
    verifyInApp: [],
    classification: 'invented_demo',
    confidence: 'low',
    summary: 'fixture promo',
    origin: 'seed',
    ...over,
  };
}

import { describe, expect, it } from 'vitest';
import { offersFor, priceOffer } from '../offers';
import type { Basket, Catalog, Listing } from '../types';
import { ANCHOR, fixtureBasket, fixtureCatalog, HOUR, NOW, promo } from './fixtures';

const talabat = fixtureCatalog.listings[0];
const snoonu = fixtureCatalog.listings[1];

const price = (listing: Listing, basket: Basket, catalog: Catalog = fixtureCatalog) =>
  priceOffer(listing, basket, catalog, NOW, ANCHOR);

describe('offersFor', () => {
  it('returns only the basket merchant listings for food', () => {
    const catalog: Catalog = {
      ...fixtureCatalog,
      listings: [...fixtureCatalog.listings, { ...talabat, id: 'other-talabat', merchantId: 'other' }],
    };
    expect(offersFor(catalog, fixtureBasket).map((l) => l.id)).toEqual(['cafe-talabat', 'cafe-snoonu']);
  });
  it('returns nothing for a food basket with no merchant', () => {
    expect(offersFor(fixtureCatalog, { scenario: 'food', lines: [] })).toEqual([]);
  });
  it('returns all listings of the scenario for grocery', () => {
    const catalog: Catalog = {
      ...fixtureCatalog,
      listings: [
        ...fixtureCatalog.listings,
        { ...talabat, id: 'g1', scenario: 'grocery' },
        { ...talabat, id: 'g2', scenario: 'grocery' },
      ],
    };
    expect(offersFor(catalog, { scenario: 'grocery', lines: [] }).map((l) => l.id)).toEqual(['g1', 'g2']);
  });
});

describe('priceOffer', () => {
  it('multiplies price by quantity and adds fees (different prices per platform)', () => {
    const t = price(talabat, fixtureBasket); // 2 x 20.00
    expect(t.itemsDh).toBe(4000);
    expect(t.deliveryDh).toBe(900);
    expect(t.serviceDh).toBe(200);
    expect(t.smallOrderDh).toBe(0);
    const s = price(snoonu, fixtureBasket); // 2 x 21.00
    expect(s.itemsDh).toBe(4200);
    expect(s.deliveryDh).toBe(500);
    expect(s.serviceDh).toBe(0);
  });

  it('updates when quantity changes', () => {
    const one = price(talabat, { ...fixtureBasket, lines: [{ productId: 'cafe-burger', qty: 1 }] });
    expect(one.itemsDh).toBe(2000);
    const three = price(talabat, { ...fixtureBasket, lines: [{ productId: 'cafe-burger', qty: 3 }] });
    expect(three.itemsDh).toBe(6000);
  });

  it('flags an incomplete basket and lists the missing product (rejection case)', () => {
    const basket: Basket = {
      ...fixtureBasket,
      lines: [{ productId: 'cafe-burger', qty: 1 }, { productId: 'cafe-cola', qty: 1 }],
    };
    const s = price(snoonu, basket);
    expect(s.complete).toBe(false);
    expect(s.missing).toEqual(['cafe-cola']);
    expect(price(talabat, basket).complete).toBe(true);
  });

  it('treats a product id that is not in the catalogue as missing', () => {
    const o = price(talabat, { ...fixtureBasket, lines: [{ productId: 'ghost', qty: 1 }] });
    expect(o.complete).toBe(false);
    expect(o.missing).toEqual(['ghost']);
  });

  it('adds the small-order fee only below the threshold', () => {
    const below = price(talabat, { ...fixtureBasket, lines: [{ productId: 'cafe-cola', qty: 1 }] }); // 5.00 < 25.00
    expect(below.smallOrderDh).toBe(500);
    const exactly = price(talabat, {
      ...fixtureBasket,
      lines: [{ productId: 'cafe-burger', qty: 1 }, { productId: 'cafe-cola', qty: 1 }],
    }); // 25.00 is not below 25.00
    expect(exactly.itemsDh).toBe(2500);
    expect(exactly.smallOrderDh).toBe(0);
  });

  it('computes a percentage service fee within its min and max', () => {
    const percent: Listing = {
      ...talabat,
      fees: { deliveryDh: 800, service: { kind: 'percent', pct: 2, minDh: 100, maxDh: 400 } },
    };
    const fee = (qty: number) => price(percent, { ...fixtureBasket, lines: [{ productId: 'cafe-burger', qty }] }).serviceDh;
    expect(fee(1)).toBe(100); // 2% of 20.00 = 0.40 -> raised to min 1.00
    expect(fee(10)).toBe(400); // 2% of 200.00 = 4.00 -> equals max
    expect(fee(20)).toBe(400); // 2% of 400.00 = 8.00 -> capped at max 4.00
  });

  describe('sale prices', () => {
    const withSale = (expiryHours: number): Catalog => ({
      ...fixtureCatalog,
      products: fixtureCatalog.products.map((p) =>
        p.id === 'cafe-burger' ? { ...p, sale: { 'cafe-talabat': { saleDh: 1500, promoId: 'SALE1' } } } : p,
      ),
      promotions: [
        promo({ id: 'SALE1', platformId: 'talabat', kind: 'sale', benefit: { type: 'sale_price' }, conditions: { expiry: { relHours: expiryHours } } }),
      ],
    });

    it('uses the sale price and reports the sale saving', () => {
      const o = price(talabat, fixtureBasket, withSale(10));
      expect(o.itemsDh).toBe(3000); // 2 x 15.00
      expect(o.saleSavingsDh).toBe(1000); // 2 x 5.00
      expect(o.lines[0]).toMatchObject({ unitDh: 1500, regularDh: 2000, lineDh: 3000 });
    });
    it('does not use an expired sale (rejection case)', () => {
      const o = price(talabat, fixtureBasket, withSale(-1));
      expect(o.itemsDh).toBe(4000);
      expect(o.saleSavingsDh).toBe(0);
    });
    it('stops using the sale exactly when it expires', () => {
      const catalog = withSale(10);
      expect(priceOffer(talabat, fixtureBasket, catalog, NOW + 10 * HOUR - 1, ANCHOR).saleSavingsDh).toBe(1000);
      expect(priceOffer(talabat, fixtureBasket, catalog, NOW + 10 * HOUR, ANCHOR).saleSavingsDh).toBe(0);
    });
    it('does not apply a sale to a different listing', () => {
      expect(price(snoonu, fixtureBasket, withSale(10)).saleSavingsDh).toBe(0);
    });
  });
});

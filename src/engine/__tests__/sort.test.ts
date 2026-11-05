import { describe, expect, it } from 'vitest';
import { sortOffers } from '../sort';
import type { PricedOffer } from '../types';
import { offer } from './fixtures';

const order = (offers: PricedOffer[]) => offers.map((o) => o.listingId);

describe('sortOffers', () => {
  const t = offer('t', 'talabat', 5260, [25, 35], 1040);
  const s = offer('s', 'snoonu', 6000, [30, 40], 0);
  const r = offer('r', 'rafeeq', 4530, [35, 45], 1620);
  const k = offer('k', 'keeta', 5800, [40, 50], 800);
  const all = [t, s, r, k];

  it('price: lowest total first', () => {
    expect(order(sortOffers(all, 'price'))).toEqual(['r', 't', 'k', 's']);
  });
  it('fastest: shortest estimated delivery first', () => {
    expect(order(sortOffers(all, 'fastest'))).toEqual(['t', 's', 'r', 'k']);
  });
  it('discount: biggest saving first', () => {
    expect(order(sortOffers(all, 'discount'))).toEqual(['r', 't', 'k', 's']);
  });
  it('fastest breaks ties on the lower estimate, then price', () => {
    const a = offer('a', 'talabat', 5000, [20, 30]);
    const b = offer('b', 'snoonu', 4000, [25, 30]);
    const c = offer('c', 'rafeeq', 4500, [25, 30]);
    expect(order(sortOffers([c, b, a], 'fastest'))).toEqual(['a', 'b', 'c']);
  });
  it('discount breaks ties on total price', () => {
    const a = offer('a', 'talabat', 5000, [20, 30], 500);
    const b = offer('b', 'snoonu', 4000, [20, 30], 500);
    expect(order(sortOffers([a, b], 'discount'))).toEqual(['b', 'a']);
  });
  it('is deterministic when everything ties: platform id decides', () => {
    const a = offer('a', 'talabat', 5000, [20, 30]);
    const b = offer('b', 'snoonu', 5000, [20, 30]);
    for (const mode of ['price', 'fastest', 'discount'] as const) {
      expect(order(sortOffers([a, b], mode))).toEqual(['b', 'a']); // snoonu < talabat
      expect(order(sortOffers([b, a], mode))).toEqual(['b', 'a']);
    }
  });
  it('drops incomplete offers (rejection case)', () => {
    const cheapButIncomplete = offer('x', 'keeta', 100, [5, 5], 9999, false);
    expect(order(sortOffers([cheapButIncomplete, t], 'price'))).toEqual(['t']);
    expect(order(sortOffers([cheapButIncomplete, t], 'fastest'))).toEqual(['t']);
    expect(order(sortOffers([cheapButIncomplete, t], 'discount'))).toEqual(['t']);
  });
  it('does not change the input array', () => {
    const input = [t, s, r, k];
    sortOffers(input, 'price');
    expect(order(input)).toEqual(['t', 's', 'r', 'k']);
  });
});

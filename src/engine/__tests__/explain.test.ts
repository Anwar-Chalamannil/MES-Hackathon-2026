import { describe, expect, it } from 'vitest';
import { explainGap, explainWinner } from '../explain';
import type { Comparison, PricedOffer } from '../types';
import { offer } from './fixtures';

const cmp = (ranked: PricedOffer[], over: Partial<Comparison> = {}): Comparison => ({
  ranked, incomplete: [], winnerId: ranked[0]?.listingId, explanation: '', singlePlatform: false, ...over,
});

describe('explainGap', () => {
  it('states how much more it costs', () => {
    expect(explainGap(offer('t', 'talabat', 5260, [25, 35]), offer('r', 'rafeeq', 4530, [35, 45]))).toBe('QAR 7.30 more than Best price');
  });
  it('says so when it is the same price', () => {
    expect(explainGap(offer('a', 'talabat', 5000, [1, 2]), offer('b', 'snoonu', 5000, [1, 2]))).toBe('the same as Best price');
  });
});

describe('explainWinner', () => {
  const keeta: PricedOffer = {
    ...offer('k', 'keeta', 5800, [40, 50], 800),
    deliveryDh: 800,
    applied: [{ promoId: 'K1', target: 'delivery', savingDh: 800 }],
  };
  const snoonu = offer('s', 'snoonu', 6000, [30, 40]);

  it('price: names the lowest total and what helped', () => {
    expect(explainWinner(cmp([keeta, snoonu]), 'price')).toBe('Keeta has the lowest total: QAR 58.00, helped by free delivery.');
  });
  it('price: omits the "helped by" part when nothing reduced the total', () => {
    expect(explainWinner(cmp([snoonu]), 'price')).toBe('Snoonu has the lowest total: QAR 60.00.');
  });
  it('fastest: says the fastest app can cost more', () => {
    const fast = offer('t', 'talabat', 5260, [25, 35], 1040);
    const cheap = offer('r', 'rafeeq', 4530, [35, 45], 1620);
    expect(explainWinner(cmp([fast, cheap]), 'fastest')).toBe('Talabat delivers fastest (25–35 min). It costs QAR 7.30 more than Best price.');
  });
  it('fastest: notes when the fastest is also cheapest', () => {
    const fast = offer('t', 'talabat', 4000, [25, 35]);
    const slow = offer('r', 'rafeeq', 4530, [35, 45]);
    expect(explainWinner(cmp([fast, slow]), 'fastest')).toContain('It also has the lowest total.');
  });
  it('discount: warns when the biggest discount is not the cheapest', () => {
    const bigDiscount = offer('t', 'talabat', 4800, [25, 35], 300);
    const cheapest = offer('s', 'snoonu', 4700, [30, 40]);
    expect(explainWinner(cmp([bigDiscount, cheapest]), 'discount')).toBe(
      'Talabat has the biggest discount: QAR 3.00 off. It costs QAR 1.00 more than Best price.',
    );
  });
  it('discount: says so when nobody has a discount', () => {
    expect(explainWinner(cmp([snoonu]), 'discount')).toContain('No discounts apply');
  });
  it('explains a single-platform restaurant', () => {
    const only = offer('ss', 'talabat', 3000, [30, 45]);
    expect(explainWinner(cmp([only], { singlePlatform: true, winnerId: undefined }), 'price')).toBe(
      'Only on Talabat in our sample, so there is nothing to compare yet.',
    );
  });
  it('explains when no app can deliver the whole basket (rejection case)', () => {
    const missing = offer('x', 'snoonu', 100, [1, 1], 0, false);
    expect(explainWinner(cmp([], { incomplete: [missing], winnerId: undefined }), 'price')).toBe(
      'No app in our sample can deliver your whole basket.',
    );
  });
});

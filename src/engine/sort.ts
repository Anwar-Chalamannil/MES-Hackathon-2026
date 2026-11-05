import type { PricedOffer, SortMode } from './types';

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const tieBreak = (a: PricedOffer, b: PricedOffer) => cmp(a.platformId, b.platformId) || cmp(a.listingId, b.listingId);

/**
 * Deterministic sort of complete offers only (incomplete ones are dropped). Returns a new array.
 * price: totalDh, then platform. fastest: slowest estimate (eta[1]), then eta[0], then totalDh, then platform.
 * discount: totalSavingsDh descending, then totalDh, then platform.
 */
export function sortOffers(offers: PricedOffer[], mode: SortMode): PricedOffer[] {
  const compare: (a: PricedOffer, b: PricedOffer) => number =
    mode === 'price'
      ? (a, b) => a.totalDh - b.totalDh || tieBreak(a, b)
      : mode === 'fastest'
        ? (a, b) => a.eta[1] - b.eta[1] || a.eta[0] - b.eta[0] || a.totalDh - b.totalDh || tieBreak(a, b)
        : (a, b) => b.totalSavingsDh - a.totalSavingsDh || a.totalDh - b.totalDh || tieBreak(a, b);
  return offers.filter((o) => o.complete).sort(compare);
}

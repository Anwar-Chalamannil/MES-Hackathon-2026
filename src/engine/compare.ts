import { evaluate } from './eligibility';
import { explainWinner } from './explain';
import { fmt } from './money';
import { offersFor, priceOffer } from './offers';
import { bestCombination } from './optimize';
import { sortOffers } from './sort';
import type {
  Catalog, CompareInput, Comparison, PlatformId, PricedOffer, Promotion, Wallet,
} from './types';

/** Seed codes/bank offers count only when saved; auto and membership promos are always candidates. Custom promos always count. */
function candidatesFor(platformId: PlatformId, catalog: Catalog, wallet: Wallet): Promotion[] {
  const found = new Map<string, Promotion>();
  for (const p of catalog.promotions) {
    if (p.platformId !== platformId || p.kind === 'sale') continue;
    if (p.kind === 'auto' || p.kind === 'membership' || wallet.savedIds.includes(p.id)) found.set(p.id, p);
  }
  for (const p of wallet.custom) {
    if (p.platformId === platformId && p.kind !== 'sale') found.set(p.id, p);
  }
  return [...found.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/**
 * Main entry point. For each listing: priceOffer, evaluate every candidate promotion,
 * bestCombination, then split complete/incomplete and sort. Pure and deterministic.
 */
export function compareBasket(input: CompareInput): Comparison {
  const { catalog, basket, wallet, profile, nowMs, anchorMs, mode } = input;
  const listings = offersFor(catalog, basket);

  if (basket.lines.length === 0 || listings.length === 0) {
    return { ranked: [], incomplete: [], winnerId: undefined, explanation: 'Add items to compare.', singlePlatform: false };
  }

  const complete: PricedOffer[] = [];
  const incomplete: PricedOffer[] = [];

  for (const listing of listings) {
    const base = priceOffer(listing, basket, catalog, nowMs, anchorMs);

    if (!base.complete) {
      // Never ranked and never combined with another merchant. Amounts are informational only.
      incomplete.push({
        ...base,
        applied: [],
        promoSavingsDh: 0,
        totalSavingsDh: base.saleSavingsDh,
        totalDh: base.itemsDh + base.deliveryDh + base.serviceDh + base.smallOrderDh,
        evaluations: [],
      });
      continue;
    }

    const candidates = candidatesFor(listing.platformId, catalog, wallet);
    const evaluations = candidates.map((p) =>
      evaluate(p, { offer: base, basket, catalog, profile, nowMs, anchorMs }),
    );
    const { applied } = bestCombination(evaluations, candidates, base);

    const promoSavingsDh = applied.reduce((sum, a) => sum + a.savingDh, 0);
    const finalEvaluations = evaluations.map((e) => {
      const used = applied.find((a) => a.promoId === e.promoId);
      if (used) return { ...e, reason: `Applied: -${fmt(used.savingDh)}` };
      if (e.eligible && e.savingDh > 0) {
        return { ...e, reason: 'Eligible, but not used: a better combination was chosen' };
      }
      return e;
    });

    complete.push({
      ...base,
      applied,
      promoSavingsDh,
      totalSavingsDh: base.saleSavingsDh + promoSavingsDh,
      totalDh: base.itemsDh + base.deliveryDh + base.serviceDh + base.smallOrderDh - promoSavingsDh,
      evaluations: finalEvaluations,
    });
  }

  const ranked = sortOffers(complete, mode);
  const singlePlatform = listings.length === 1;
  const result: Comparison = {
    ranked,
    incomplete,
    winnerId: singlePlatform ? undefined : ranked[0]?.listingId,
    explanation: '',
    singlePlatform,
  };
  result.explanation = explainWinner(result, mode);
  return result;
}

import { fmt } from './money';
import { sortOffers } from './sort';
import type { Comparison, PlatformId, PricedOffer, SortMode } from './types';

const PLATFORM_LABEL: Record<PlatformId, string> = {
  talabat: 'Talabat', snoonu: 'Snoonu', rafeeq: 'Rafeeq', keeta: 'Keeta', ninja: 'Ninja',
  carrefour: 'Carrefour', lulu: 'Lulu', kulud: 'Kulud', wellcare: 'Wellcare',
};

/** Example: "QAR 7.30 more than Best price". */
export function explainGap(offer: PricedOffer, best: PricedOffer): string {
  const diff = offer.totalDh - best.totalDh;
  return diff > 0 ? `${fmt(diff)} more than Best price` : 'the same as Best price';
}

/** What reduced this offer's total, in plain words. Empty when nothing did. */
function savingsPhrase(o: PricedOffer): string {
  const parts: string[] = [];
  for (const a of o.applied) {
    if (a.target === 'delivery') parts.push(a.savingDh === o.deliveryDh ? 'free delivery' : `${fmt(a.savingDh)} off delivery`);
    else if (a.target === 'service') parts.push(`${fmt(a.savingDh)} off fees`);
    else parts.push(`${fmt(a.savingDh)} off items`);
  }
  if (o.saleSavingsDh > 0) parts.push(`sale prices (${fmt(o.saleSavingsDh)} saved)`);
  return parts.join(' and ');
}

/** Example: "Keeta has the lowest total: QAR 58.00, helped by free delivery." */
export function explainWinner(c: Comparison, mode: SortMode): string {
  if (c.singlePlatform) {
    const only = c.ranked[0] ?? c.incomplete[0];
    return only
      ? `Only on ${PLATFORM_LABEL[only.platformId]} in our sample, so there is nothing to compare yet.`
      : 'Add items to compare.';
  }
  if (c.ranked.length === 0) {
    return c.incomplete.length > 0
      ? 'No app in our sample can deliver your whole basket.'
      : 'Add items to compare.';
  }

  const winner = c.ranked[0];
  const cheapest = sortOffers(c.ranked, 'price')[0];
  const name = PLATFORM_LABEL[winner.platformId];
  const costs = winner.listingId === cheapest.listingId
    ? ' It also has the lowest total.'
    : ` It costs ${explainGap(winner, cheapest)}.`;

  if (mode === 'price') {
    const why = savingsPhrase(winner);
    return `${name} has the lowest total: ${fmt(winner.totalDh)}${why ? `, helped by ${why}` : ''}.`;
  }
  if (mode === 'fastest') {
    return `${name} delivers fastest (${winner.eta[0]}–${winner.eta[1]} min).${costs}`;
  }
  if (winner.totalSavingsDh === 0) {
    return `No discounts apply to this basket, so ${name} is shown first by lowest total.`;
  }
  return `${name} has the biggest discount: ${fmt(winner.totalSavingsDh)} off.${costs}`;
}

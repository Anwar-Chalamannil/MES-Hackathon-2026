import { compareBasket } from '../engine/compare';
import { explainWinner } from '../engine/explain';
import { sortOffers } from '../engine/sort';
import type { CompareInput, Comparison, PricedOffer } from '../engine/types';
import type { CardPreset } from '../data/cardPresets';
import { failsTierRule } from './cardMatch';

export interface CardComparison extends Comparison {
  /** listingId -> the preset of the card whose bank offer made that result (absent when no card offer was used). */
  cardFor: Record<string, CardPreset | undefined>;
}

/**
 * Compares a basket with every saved card at once, without touching the engine.
 *
 * - Run 0 is the person's own profile (or, when they have cards, a profile that matches no card offer).
 * - Each card gets its own run: the profile takes that card's bank and network, and any seed bank offer whose
 *   TIER rule the card fails is removed from that run's wallet BEFORE the engine optimises. So the engine still finds the
 *   best remaining combination (codes, other bank offers, automatic and membership offers). No valid offer is lost.
 * - For each app, the lowest total across the runs wins (ties: fewer vouchers, then the earlier run).
 *
 * With no cards this returns exactly what compareBasket returns.
 */
export function compareWithCards(input: CompareInput, cards: CardPreset[]): CardComparison {
  const baseProfile = cards.length > 0 ? { ...input.profile, issuer: 'other' as const } : input.profile;
  const base = compareBasket({ ...input, profile: baseProfile });
  if (cards.length === 0 || (base.ranked.length === 0 && base.incomplete.length === 0)) return { ...base, cardFor: {} };

  const runs: { offers: PricedOffer[]; card?: CardPreset }[] = [{ offers: base.ranked }];
  for (const card of cards) {
    const savedIds = input.wallet.savedIds.filter((id) => !failsTierRule(card, id));
    const profile = { ...input.profile, issuer: card.issuer, network: card.network };
    const run = compareBasket({ ...input, wallet: { ...input.wallet, savedIds }, profile });
    runs.push({ offers: run.ranked, card });
  }

  const chosen = new Map<string, { offer: PricedOffer; card?: CardPreset }>();
  for (const run of runs) {
    for (const offer of run.offers) {
      const cur = chosen.get(offer.listingId);
      const better =
        !cur ||
        offer.totalDh < cur.offer.totalDh ||
        (offer.totalDh === cur.offer.totalDh && offer.applied.length < cur.offer.applied.length);
      if (better) chosen.set(offer.listingId, { offer, card: run.card });
    }
  }

  const ranked = sortOffers([...chosen.values()].map((c) => c.offer), input.mode);
  const cardFor: Record<string, CardPreset | undefined> = {};
  for (const { offer, card } of chosen.values()) {
    cardFor[offer.listingId] = card && offer.applied.some((a) => a.promoId && isBankPromo(input, a.promoId)) ? card : undefined;
  }
  const result: Comparison = {
    ranked,
    incomplete: base.incomplete,
    winnerId: base.singlePlatform ? undefined : ranked[0]?.listingId,
    explanation: '',
    singlePlatform: base.singlePlatform,
  };
  result.explanation = explainWinner(result, input.mode);
  return { ...result, cardFor };
}

const isBankPromo = (input: CompareInput, promoId: string): boolean =>
  [...input.catalog.promotions, ...input.wallet.custom].some((p) => p.id === promoId && p.kind === 'bank');

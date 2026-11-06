import { CARD_TIER_RULES } from '../data/cardOfferRules';
import { cardPresetById, type CardPreset, type SavedCard } from '../data/cardPresets';
import type { Channel, Promotion } from '../engine/types';

/** An offer is a "card offer" when it names a bank or a network. */
export const isCardOffer = (p: Promotion): boolean => !!(p.conditions.issuers?.length || p.conditions.networks?.length);

/** True when the offer has a tier rule and this card's tier does not satisfy it (an unknown tier cannot satisfy it). */
export function failsTierRule(card: CardPreset, promoId: string): boolean {
  const tiers = CARD_TIER_RULES[promoId];
  return !!tiers && !tiers.includes(card.tier);
}

export type CardMatchStatus = 'matches' | 'cant_confirm' | 'no_match';
export interface CardMatch {
  status: CardMatchStatus;
  /** Plain words, never "guaranteed": we only say whether it matches in our demo data. */
  message: string;
}

/**
 * Does one card meet an offer's card conditions? Checks the four things separately:
 * bank, network, tier (where a rule exists) and the payment channel from the profile.
 */
export function cardMeetsOffer(card: CardPreset, promo: Promotion, channel?: Channel): CardMatch {
  const c = promo.conditions;
  if (c.issuers?.length && !c.issuers.includes(card.issuer)) {
    return { status: 'no_match', message: `Different bank: this offer is for a different card issuer than ${card.bankName}` };
  }
  if (c.networks?.length && !c.networks.includes(card.network)) {
    return { status: 'no_match', message: `Different card network: ${card.network === 'visa' ? 'Visa' : 'Mastercard'} does not match` };
  }
  if (channel && c.channels?.length && !c.channels.includes(channel)) {
    return { status: 'no_match', message: 'Your selected way of paying is not valid for this offer' };
  }
  const tiers = CARD_TIER_RULES[promo.id];
  if (tiers && !tiers.includes(card.tier)) {
    return card.tier === 'unknown'
      ? { status: 'cant_confirm', message: "We can't confirm this card's tier, so the offer is not applied" }
      : { status: 'no_match', message: `This offer needs a ${tiers.join(' or ')} tier card; yours is ${card.tier}` };
  }
  return { status: 'matches', message: 'Matches in our demo data. Check the offer terms in the app' };
}

export interface OfferCardMatches {
  matches: CardPreset[];
  cantConfirm: CardPreset[];
}

/** Which of the person's saved cards match an offer (cards whose preset no longer exists are skipped). */
export function matchingCards(promo: Promotion, cards: SavedCard[], channel?: Channel): OfferCardMatches {
  const out: OfferCardMatches = { matches: [], cantConfirm: [] };
  for (const sc of cards) {
    const preset = cardPresetById.get(sc.presetId);
    if (!preset) continue;
    const m = cardMeetsOffer(preset, promo, channel);
    if (m.status === 'matches') out.matches.push(preset);
    else if (m.status === 'cant_confirm') out.cantConfirm.push(preset);
  }
  return out;
}

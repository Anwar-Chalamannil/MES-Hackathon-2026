import type { CardTier } from './cardPresets';

/**
 * Tier requirements the calculation engine does not model (it only checks bank, network and channel).
 * Keyed by promotion id. A card of another tier, or of an unknown tier, does not get the offer.
 * Offers with no entry here have no tier rule in our data, so every card of the right bank and network is assumed to
 * qualify in the demo; the offer's own "check in the app" notes are still shown.
 *
 * R1 (DEMO-DKB30) is modelled on the Dukhan Bank x Rafeeq terms, whose verify note says "Card tier (Visa Signature)".
 * R2 was a real past Visa Infinite offer.
 */
export const CARD_TIER_RULES: Record<string, CardTier[]> = {
  R1: ['signature', 'infinite'],
  R2: ['infinite'],
};

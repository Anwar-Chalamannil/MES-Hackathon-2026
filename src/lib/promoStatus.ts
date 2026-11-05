import { evaluate } from '../engine/eligibility';
import { fmt } from '../engine/money';
import type { Basket, Catalog, Comparison, PlatformId, PricedOffer, Profile, Promotion, PromoEval } from '../engine/types';

export type PromoState = 'applied' | 'eligible' | 'failed' | 'none' | 'info';

export interface PromoStatus {
  state: PromoState;
  headline: string;
  evaluation?: PromoEval;
  /** True when the app this voucher is applied on also has the lowest total. */
  best?: boolean;
}

export interface StatusInput {
  comparison: Comparison;
  basket: Basket;
  catalog: Catalog;
  profile: Profile;
  nowMs: number;
  anchorMs: number;
  /** Is the voucher in the wallet? Unsaved ones are only previewed. */
  saved: boolean;
}

const SCENARIO_NOUN = { food: 'food', grocery: 'grocery', pharmacy: 'pharmacy and care' } as const;

/** The offer with the lowest total, whatever the sort mode is. */
export function cheapestOffer(c: Comparison): PricedOffer | undefined {
  return [...c.ranked].sort((a, b) => a.totalDh - b.totalDh || (a.listingId < b.listingId ? -1 : 1))[0];
}

/** How one promotion relates to the current basket: applied, eligible, blocked (and why), or not checkable. */
export function promoStatus(promo: Promotion, inp: StatusInput): PromoStatus {
  const { comparison, basket, catalog, profile, nowMs, anchorMs, saved } = inp;
  if (promo.kind === 'sale') {
    return { state: 'info', headline: 'Sale prices apply automatically to the listed products.' };
  }
  if (basket.lines.length === 0) {
    return { state: 'none', headline: 'Add items to a basket to check this voucher.' };
  }

  const platformId: PlatformId = promo.platformId;
  const name = catalog.platforms.find((p) => p.id === platformId)?.name ?? platformId;
  const offer = comparison.ranked.find((o) => o.platformId === platformId);
  if (!offer) {
    return comparison.incomplete.some((o) => o.platformId === platformId)
      ? { state: 'none', headline: `${name} can't deliver your whole basket, so this can't be checked.` }
      : { state: 'none', headline: `${name} is not in your current ${SCENARIO_NOUN[basket.scenario]} comparison.` };
  }

  const evaluation =
    offer.evaluations.find((e) => e.promoId === promo.id) ??
    evaluate(promo, { offer, basket, catalog, profile, nowMs, anchorMs });
  const applied = offer.applied.find((a) => a.promoId === promo.id);
  const best = cheapestOffer(comparison)?.listingId === offer.listingId;

  if (applied) {
    return {
      state: 'applied', evaluation, best,
      headline: `Applied on ${name}: -${fmt(applied.savingDh)}. Your total there is ${fmt(offer.totalDh)}.`,
    };
  }
  if (!evaluation.eligible) return { state: 'failed', evaluation, headline: `${name}: ${evaluation.reason}` };
  if (evaluation.savingDh === 0) {
    return { state: 'eligible', evaluation, headline: `Eligible on ${name}, but it saves nothing on this basket.` };
  }
  if (!saved && (promo.kind === 'code' || promo.kind === 'bank')) {
    return { state: 'eligible', evaluation, headline: `Would save ${fmt(evaluation.savingDh)} on ${name} if you save it.` };
  }
  return { state: 'eligible', evaluation, headline: `Eligible on ${name}, but not used: another offer gives a lower total.` };
}

import { fmt, pctOf } from './money';
import { countdown, formatQatar, resolveExpiry } from './time';
import type {
  Channel, CondResult, Dh, EvalContext, Issuer, Membership, Promotion, PromoEval, Scenario,
} from './types';

const SCENARIO_LABEL: Record<Scenario, string> = {
  food: 'Restaurants',
  grocery: 'Groceries',
  pharmacy: 'Pharmacy & care',
};
const ISSUER_LABEL: Record<Issuer, string> = {
  dukhan: 'Dukhan Bank',
  qnb: 'QNB',
  lulu_cobrand: 'LuLu co-brand',
  other: 'Other bank',
};
const MEMBERSHIP_LABEL: Record<Membership, string> = {
  talabat_pro: 'talabat pro',
  snoonu_plus: 'Snoonu+',
  rafeeq_pro: 'Rafeeq Pro',
  ninja_premium: 'Ninja Premium',
};
const CHANNEL_LABEL: Record<Channel, string> = { card: 'a card', apple_pay: 'Apple Pay', cash: 'cash' };

const list = (items: string[]) => items.join(' or ');

/**
 * Checks every condition of one promotion for one offer and computes its saving from the
 * pre-voucher base. Conditions from data are 'met'/'failed'. Conditions from the demo profile
 * are 'assumed'/'failed_profile'. Each verifyInApp entry is 'verify' and never blocks.
 * The first failing condition becomes the reason.
 */
export function evaluate(promo: Promotion, ctx: EvalContext): PromoEval {
  const { offer, basket, catalog, profile, nowMs, anchorMs } = ctx;
  const c = promo.conditions;
  const conditions: CondResult[] = [];
  const add = (key: string, label: string, status: CondResult['status'], message: string) =>
    conditions.push({ key, label, status, message });

  // Sale prices are applied while pricing the offer and are never vouchers.
  if (promo.kind === 'sale') {
    return {
      promoId: promo.id,
      eligible: false,
      conditions,
      savingDh: 0,
      reason: 'Sale price: applied automatically to the listed products.',
    };
  }

  const platformName = catalog.platforms.find((p) => p.id === promo.platformId)?.name ?? promo.platformId;
  if (promo.platformId !== offer.platformId) {
    add('platform', 'Platform', 'failed', `Only valid on ${platformName}`);
  }

  // Expiry (from data)
  const expiryMs = resolveExpiry(c.expiry, anchorMs);
  const cd = countdown(expiryMs, nowMs);
  if (cd.expired) {
    add('expiry', 'Expiry', 'failed', `${cd.label} (${formatQatar(expiryMs)})`);
  } else {
    add('expiry', 'Expiry', 'met', `Valid until ${formatQatar(expiryMs)}`);
  }

  if (c.scenarios) {
    const ok = c.scenarios.includes(basket.scenario);
    add('scenario', 'Where it applies', ok ? 'met' : 'failed',
      ok ? `Valid for ${SCENARIO_LABEL[basket.scenario]}` : `Only for ${list(c.scenarios.map((s) => SCENARIO_LABEL[s]))}`);
  }

  if (c.merchantIds) {
    const ok = c.merchantIds.includes(offer.merchantId);
    add('merchant', 'Merchant', ok ? 'met' : 'failed', ok ? 'Valid at this merchant' : 'Only valid at selected merchants');
  }

  // Eligible item subtotal: all items, or only items in the promotion's categories.
  let eligibleItemsDh: Dh = offer.itemsDh;
  if (c.categories) {
    eligibleItemsDh = offer.lines
      .filter((l) => {
        const product = catalog.products.find((p) => p.id === l.productId);
        return product !== undefined && c.categories!.includes(product.category);
      })
      .reduce((sum, l) => sum + l.lineDh, 0);
    const ok = eligibleItemsDh > 0;
    add('category', 'Eligible items', ok ? 'met' : 'failed',
      ok ? `Counts ${fmt(eligibleItemsDh)} of ${list(c.categories)} items` : `No ${list(c.categories)} items in your basket`);
  }

  if (c.minSpendDh !== undefined) {
    const ok = eligibleItemsDh >= c.minSpendDh;
    add('minSpend', 'Minimum spend', ok ? 'met' : 'failed',
      ok ? `Minimum spend ${fmt(c.minSpendDh)} reached`
        : `Add ${fmt(c.minSpendDh - eligibleItemsDh)} more (minimum ${fmt(c.minSpendDh)} of eligible items)`);
  }

  // Payment (from the demo profile; never real card details)
  if (c.channels) {
    const ok = c.channels.includes(profile.channel);
    let message = `Paying with ${CHANNEL_LABEL[profile.channel]}`;
    if (!ok) {
      message = profile.channel === 'apple_pay'
        ? 'Not valid with Apple Pay: pay with the card directly'
        : profile.channel === 'cash'
          ? 'Not valid with cash: pay with a card'
          : `Only valid when paying with ${list(c.channels.map((ch) => CHANNEL_LABEL[ch]))}`;
    }
    add('channel', 'Payment method', ok ? 'assumed' : 'failed_profile', message);
  }
  if (c.issuers) {
    const wanted = list(c.issuers.map((i) => ISSUER_LABEL[i]));
    if (profile.channel === 'cash') {
      add('issuer', 'Card bank', 'failed_profile', `Needs a ${wanted} card: you are paying cash`);
    } else {
      const ok = c.issuers.includes(profile.issuer);
      add('issuer', 'Card bank', ok ? 'assumed' : 'failed_profile',
        ok ? `Your card is from ${ISSUER_LABEL[profile.issuer]}` : `Needs a ${wanted} card: you selected ${ISSUER_LABEL[profile.issuer]}`);
    }
  }
  if (c.networks) {
    const wanted = list(c.networks.map((n) => (n === 'visa' ? 'Visa' : 'Mastercard')));
    if (profile.channel === 'cash') {
      add('network', 'Card network', 'failed_profile', `Needs a ${wanted} card: you are paying cash`);
    } else {
      const ok = c.networks.includes(profile.network);
      add('network', 'Card network', ok ? 'assumed' : 'failed_profile',
        ok ? `Your card is ${profile.network === 'visa' ? 'Visa' : 'Mastercard'}`
          : `Needs a ${wanted} card: you selected ${profile.network === 'visa' ? 'Visa' : 'Mastercard'}`);
    }
  }

  if (c.membership) {
    const ok = profile.memberships.includes(c.membership);
    add('membership', 'Membership', ok ? 'assumed' : 'failed_profile',
      ok ? `You selected ${MEMBERSHIP_LABEL[c.membership]}` : `Needs ${MEMBERSHIP_LABEL[c.membership]} membership: turn it on in your profile`);
  }
  if (c.firstOrder) {
    const ok = profile.firstOrderOn.includes(promo.platformId);
    add('firstOrder', 'First order', ok ? 'assumed' : 'failed_profile',
      ok ? `You said you are new to ${platformName}` : `For first orders on ${platformName}: mark yourself as new to ${platformName} in your profile`);
  }

  promo.verifyInApp.forEach((note, i) => add(`verify-${i}`, 'Check in the app', 'verify', note));

  const failed = conditions.find((x) => x.status === 'failed' || x.status === 'failed_profile');
  if (failed) {
    return { promoId: promo.id, eligible: false, conditions, savingDh: 0, reason: failed.message };
  }

  const baseDh = promo.target === 'items' ? eligibleItemsDh : promo.target === 'delivery' ? offer.deliveryDh : offer.serviceDh;
  const b = promo.benefit;
  let savingDh: Dh = 0;
  switch (b.type) {
    case 'percent':
      savingDh = Math.min(pctOf(baseDh, b.pct), b.capDh ?? Number.POSITIVE_INFINITY);
      break;
    case 'fixed':
    case 'delivery_off':
      savingDh = Math.min(b.dh, baseDh);
      break;
    case 'free_delivery':
      savingDh = offer.deliveryDh;
      break;
    case 'service_waiver':
      savingDh = offer.serviceDh;
      break;
    case 'sale_price':
      savingDh = 0;
      break;
  }

  return {
    promoId: promo.id,
    eligible: true,
    conditions,
    savingDh,
    reason: savingDh > 0 ? `Applied: -${fmt(savingDh)}` : 'Eligible, but saves nothing on this order',
  };
}

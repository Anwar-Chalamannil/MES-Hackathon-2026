import { fmt } from '../engine/money';
import type { Channel, Issuer, Membership, Network, Promotion, Scenario } from '../engine/types';

/**
 * Presentation only. Everything here is derived from a promotion's existing benefit, conditions and kind,
 * so nothing is stored twice and the calculation engine is never involved.
 */

/** "QAR 10" for whole riyals, "QAR 17.50" otherwise. */
export const qarShort = (dh: number): string => (dh % 100 === 0 ? `QAR ${dh / 100}` : fmt(dh));

/** The large title: what the customer gets, never the code. */
export function promoHeadline(p: Promotion): string {
  const b = p.benefit;
  const first = p.conditions.firstOrder ? ' Your First Order' : '';
  switch (b.type) {
    case 'percent': return `${b.pct}% OFF${first}`;
    case 'fixed': return `${qarShort(b.dh)} OFF${first}`;
    case 'free_delivery': return 'Free Delivery';
    case 'delivery_off': return `${qarShort(b.dh)} OFF Delivery`;
    case 'service_waiver': return 'No Service Fee';
    case 'sale_price': return 'On Sale';
  }
}

const SCENARIO_LABEL: Record<Scenario, string> = { food: 'Food', grocery: 'Groceries', pharmacy: 'Pharmacy & care' };
const MEMBERSHIP_LABEL: Record<Membership, string> = {
  talabat_pro: 'talabat pro',
  snoonu_plus: 'Snoonu+',
  rafeeq_pro: 'Rafeeq Pro',
  ninja_premium: 'Ninja Premium',
};
const ISSUER_LABEL: Record<Issuer, string> = {
  dukhan: 'Dukhan Bank',
  qnb: 'QNB',
  lulu_cobrand: 'LuLu co-brand (Doha Bank)',
  other: 'another bank',
};
const NETWORK_LABEL: Record<Network, string> = { visa: 'Visa', mastercard: 'Mastercard' };

const cap1 = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s).replace(/-/g, ' ');

/** The smaller line under the title: cap, minimum spend, scope. The cap is "up to", never the actual saving. */
export function promoDetails(p: Promotion, platformName = 'this app'): string {
  const parts: string[] = [];
  const b = p.benefit;
  if (b.type === 'percent' && b.capDh !== undefined) parts.push(`Up to ${qarShort(b.capDh)}`);
  if (p.conditions.minSpendDh !== undefined) parts.push(`On orders above ${qarShort(p.conditions.minSpendDh)}`);
  if (p.conditions.scenarios?.length) parts.push(p.conditions.scenarios.map((s) => SCENARIO_LABEL[s]).join(', '));
  if (p.conditions.categories?.length) parts.push(`${p.conditions.categories.map(cap1).join(', ')} only`);
  if (p.conditions.firstOrder && (b.type === 'free_delivery' || b.type === 'delivery_off' || b.type === 'service_waiver')) {
    parts.push(`First ${platformName} order`);
  }
  if (p.conditions.membership) parts.push(`With ${MEMBERSHIP_LABEL[p.conditions.membership]}`);
  if (p.kind === 'auto') parts.push('Applied automatically');
  if (b.type === 'sale_price') parts.push('Sale price is already in the item price');
  return parts.join(' · ');
}

const channelText = (channels: Channel[]): string => {
  if (channels.length === 1 && channels[0] === 'card') return 'paid by card (not Apple Pay or cash)';
  const label: Record<Channel, string> = { card: 'card', apple_pay: 'Apple Pay', cash: 'cash' };
  return `paid by ${channels.map((c) => label[c]).join(' or ')}`;
};

/**
 * What the person must hold or do. Empty when there is no requirement. This says what the offer asks for;
 * whether a saved card meets it is a separate question (see cardMatch).
 */
export function promoRequirement(p: Promotion): string {
  const c = p.conditions;
  const bits: string[] = [];
  if (c.issuers?.length || c.networks?.length) {
    const bank = c.issuers?.length ? c.issuers.map((i) => ISSUER_LABEL[i]).join(' or ') : '';
    const net = c.networks?.length ? c.networks.map((n) => NETWORK_LABEL[n]).join(' or ') : '';
    bits.push(`Needs a ${[bank, net].filter(Boolean).join(' ')} card`);
  }
  if (c.channels?.length) bits.push(bits.length ? channelText(c.channels) : `Must be ${channelText(c.channels)}`);
  if (c.membership) bits.push(bits.length ? `${MEMBERSHIP_LABEL[c.membership]} membership` : `Needs ${MEMBERSHIP_LABEL[c.membership]} membership`);
  return bits.join(', ');
}

export const isDemoCode = (code?: string): boolean => !!code && code.startsWith('DEMO-');

export type CodeInfo =
  | { kind: 'copy'; code: string; demo: boolean }
  | { kind: 'expired'; code: string }
  | { kind: 'none'; text: string };

/** What goes in the code row. A code is only ever shown if the promotion really has one. */
export function codeInfo(p: Promotion, expired: boolean): CodeInfo {
  if (p.code) return expired ? { kind: 'expired', code: p.code } : { kind: 'copy', code: p.code, demo: isDemoCode(p.code) };
  if (p.kind === 'sale') return { kind: 'none', text: 'Sale price, no code' };
  if (p.kind === 'membership') return { kind: 'none', text: 'No code needed. A membership benefit' };
  if (p.kind === 'auto') return { kind: 'none', text: 'No code needed. Applied automatically' };
  if (p.kind === 'bank') return { kind: 'none', text: 'No code. Pay with an eligible card' };
  return { kind: 'none', text: 'No code' };
}

/** Copying makes sense only for a live code. Sales, automatic and membership offers never have one. */
export const isCopyable = (p: Promotion, expired: boolean): boolean => codeInfo(p, expired).kind === 'copy';

/** A short title for chips, receipts and alerts: the headline plus the platform. */
export const promoShortTitle = (p: Promotion, platformName: string): string => `${promoHeadline(p)} at ${platformName}`;

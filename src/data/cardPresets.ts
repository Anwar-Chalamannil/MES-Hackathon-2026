import type { Issuer, Network } from '../engine/types';

/**
 * Card plans a person can pick from a list. Selection only: Perq never asks for a card number, expiry, CVV or name.
 * Five separate facts per plan, so they are never mixed up:
 * - bankName: who issued it (shown to the person)
 * - issuer: the value the calculation engine understands (a bank outside our offers is 'other')
 * - network: Visa or Mastercard
 * - tier: the plan level, or 'unknown' when we do not know it
 * - cardType: credit or debit
 * The payment channel (card, Apple Pay, cash) is not a card property; it stays in the profile.
 */
export type CardTier = 'infinite' | 'signature' | 'platinum' | 'world' | 'unknown';
export type CardType = 'credit' | 'debit';

export interface CardPreset {
  id: string;
  /** The name shown in the list. */
  label: string;
  bankName: string;
  issuer: Issuer;
  network: Network;
  tier: CardTier;
  cardType: CardType;
  /** Where the plan is publicly described. Generic "another bank" entries have none. */
  sourceUrl?: string;
}

export const CARD_PRESETS: CardPreset[] = [
  {
    id: 'dukhan-visa-infinite', label: 'Dukhan Bank Visa Infinite', bankName: 'Dukhan Bank', issuer: 'dukhan', network: 'visa',
    tier: 'infinite', cardType: 'credit', sourceUrl: 'https://www.dukhanbank.com/personal/cards/credit-cards/visa-infinite-retail',
  },
  {
    id: 'dukhan-visa-signature', label: 'Dukhan Bank Visa Signature', bankName: 'Dukhan Bank', issuer: 'dukhan', network: 'visa',
    tier: 'signature', cardType: 'credit', sourceUrl: 'https://dukhanbank.com/media-center/press-release/dukhan-bank-launches-limited-edition-visa-platinum-and-visa-signature',
  },
  {
    id: 'dukhan-visa-platinum', label: 'Dukhan Bank Visa Platinum', bankName: 'Dukhan Bank', issuer: 'dukhan', network: 'visa',
    tier: 'platinum', cardType: 'credit', sourceUrl: 'https://dukhanbank.com/media-center/press-release/dukhan-bank-launches-limited-edition-visa-platinum-and-visa-signature',
  },
  {
    id: 'qnb-life-rewards-visa-infinite', label: 'QNB Life Rewards Visa Infinite', bankName: 'QNB', issuer: 'qnb', network: 'visa',
    tier: 'infinite', cardType: 'credit', sourceUrl: 'https://qnb.com/sites/qnb/qnbqatar/page/en/envisainfinite.html',
  },
  {
    id: 'qnb-qatar-airways-mastercard-world', label: 'QNB Qatar Airways Mastercard World', bankName: 'QNB', issuer: 'qnb', network: 'mastercard',
    tier: 'world', cardType: 'credit', sourceUrl: 'https://qnb.com/sites/qnb/qnbqatar/page/en/envisainfinite.html',
  },
  {
    id: 'doha-bank-lulu-platinum-mastercard', label: 'Doha Bank LuLu Platinum Mastercard', bankName: 'Doha Bank (LuLu co-brand)', issuer: 'lulu_cobrand',
    network: 'mastercard', tier: 'platinum', cardType: 'credit', sourceUrl: 'https://thepeninsulaqatar.com/article/27/12/2020/Doha-Bank-launches-LuLu-Platinum-Mastercard-Credit-Card',
  },
  { id: 'other-visa-credit', label: 'Another bank: Visa credit card', bankName: 'Another bank', issuer: 'other', network: 'visa', tier: 'unknown', cardType: 'credit' },
  { id: 'other-visa-debit', label: 'Another bank: Visa debit card', bankName: 'Another bank', issuer: 'other', network: 'visa', tier: 'unknown', cardType: 'debit' },
  { id: 'other-mastercard-credit', label: 'Another bank: Mastercard credit card', bankName: 'Another bank', issuer: 'other', network: 'mastercard', tier: 'unknown', cardType: 'credit' },
  { id: 'other-mastercard-debit', label: 'Another bank: Mastercard debit card', bankName: 'Another bank', issuer: 'other', network: 'mastercard', tier: 'unknown', cardType: 'debit' },
];

export const cardPresetById = new Map<string, CardPreset>(CARD_PRESETS.map((c) => [c.id, c]));

/** The list grouped by bank, for a dropdown with groups. */
export function cardPresetGroups(): { bankName: string; cards: CardPreset[] }[] {
  const groups = new Map<string, CardPreset[]>();
  for (const c of CARD_PRESETS) groups.set(c.bankName, [...(groups.get(c.bankName) ?? []), c]);
  return [...groups].map(([bankName, cards]) => ({ bankName, cards }));
}

/** A saved card is just a pointer to a preset, so no card detail is ever stored. */
export interface SavedCard {
  id: string;
  presetId: string;
}

export const MAX_CARDS = 8;

import type { Profile } from '../engine/types';

/** Shown in the UI as "Visa card · Other bank · New to Keeta". */
export const DEFAULT_PROFILE: Profile = {
  channel: 'card',
  issuer: 'other',
  network: 'visa',
  memberships: [],
  firstOrderOn: ['keeta'],
};

/**
 * Seed promotions that start in the wallet (plan v2 section 4.5, "saved").
 * Not in this list: auto/membership/sale promos (always evaluated) and
 * "discover" promos T2, C1, L2 (added by the user via "Try a voucher").
 * P4a must create a promotion for every id here.
 */
export const DEFAULT_SAVED_IDS: string[] = [
  'T3', 'S2', 'S3', 'R1', 'R2', 'K2', 'K3', 'N2', 'N3', 'L1', 'KU3', 'W3',
];

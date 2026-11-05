import type { Promotion } from '../engine/types';

/**
 * 27 demonstration promotions, three per platform (plan v2 section 4.5).
 * Every active code starts with DEMO- and is NOT a real, currently valid offer.
 * Classification: researched_historical (real, past, with its real dates), documented_structure
 * (the kind of offer is publicly documented; numbers may be demo), invented_demo (made up).
 * Expiry: relHours is measured from the demo anchor (first visit); iso dates are absolute.
 */

// Stacking presets. "withCodes: false" on a code means at most one code per order.
const ANY = { withCodes: true, withBank: true, withMembership: true, withAuto: true };
const CODE = { withCodes: false, withBank: true, withMembership: true, withAuto: true };
const NONE = { withCodes: false, withBank: false, withMembership: false, withAuto: false };

const seed = (p: Omit<Promotion, 'origin'>): Promotion => ({ ...p, origin: 'seed' });

export const promotions: Promotion[] = [
  // ---------- Talabat ----------
  seed({
    id: 'T1', platformId: 'talabat', name: 'talabat pro free delivery', kind: 'membership',
    benefit: { type: 'free_delivery' }, target: 'delivery',
    conditions: { membership: 'talabat_pro', expiry: { relHours: 720 } }, stacking: ANY,
    verifyInApp: ['Partner merchants only'], classification: 'documented_structure', confidence: 'medium',
    sourceId: 'talabat-terms', summary: 'Free delivery on eligible orders for talabat pro members.',
  }),
  seed({
    id: 'T2', platformId: 'talabat', name: 'Talabat 20% off food', code: 'DEMO-TB20', kind: 'code',
    benefit: { type: 'percent', pct: 20, capDh: 1500 }, target: 'items',
    conditions: { scenarios: ['food'], minSpendDh: 5000, expiry: { relHours: 48 } }, stacking: CODE,
    verifyInApp: ['Per-customer usage limit'], classification: 'invented_demo', confidence: 'low',
    summary: '20% off food, up to QAR 15, on QAR 50 or more.',
  }),
  seed({
    id: 'T3', platformId: 'talabat', name: 'QNB card 15% off', code: 'DEMO-QNB15', kind: 'bank',
    benefit: { type: 'percent', pct: 15, capDh: 2500 }, target: 'items',
    conditions: { issuers: ['qnb'], channels: ['card', 'apple_pay'], minSpendDh: 8000, expiry: { relHours: 5 } },
    stacking: CODE, verifyInApp: ['Card type'], classification: 'invented_demo', confidence: 'low',
    summary: '15% off with a QNB card, up to QAR 25, on QAR 80 or more.',
  }),

  // ---------- Snoonu ----------
  seed({
    id: 'S1', platformId: 'snoonu', name: 'Snoonu+ free delivery', kind: 'membership',
    benefit: { type: 'free_delivery' }, target: 'delivery',
    conditions: { membership: 'snoonu_plus', expiry: { relHours: 720 } }, stacking: ANY,
    verifyInApp: ['Plan terms'], classification: 'documented_structure', confidence: 'low',
    sourceId: 'snoonu-plus-qatarliving',
    summary: 'Free delivery for Snoonu+ members.', notes: 'Seen only in a search snippet; not verified.',
  }),
  seed({
    id: 'S2', platformId: 'snoonu', name: 'Snoonu QAR 10 off', code: 'DEMO-SNOONU10', kind: 'code',
    benefit: { type: 'fixed', dh: 1000 }, target: 'items',
    conditions: { scenarios: ['food', 'grocery'], minSpendDh: 16000, expiry: { relHours: 120 } }, stacking: CODE,
    verifyInApp: [], classification: 'invented_demo', confidence: 'low',
    summary: 'QAR 10 off food or groceries on QAR 160 or more.',
  }),
  seed({
    id: 'S3', platformId: 'snoonu', name: 'Snoonu first order 40% off', code: 'DEMO-SNFIRST', kind: 'code',
    benefit: { type: 'percent', pct: 40, capDh: 2000 }, target: 'items',
    conditions: { scenarios: ['food'], firstOrder: true, expiry: { relHours: 20 } }, stacking: CODE,
    verifyInApp: ['New-account check'], classification: 'invented_demo', confidence: 'low',
    summary: '40% off your first Snoonu food order, up to QAR 20.',
  }),

  // ---------- Rafeeq ----------
  seed({
    id: 'R1', platformId: 'rafeeq', name: 'Dukhan Bank card 30% off', code: 'DEMO-DKB30', kind: 'bank',
    benefit: { type: 'percent', pct: 30, capDh: 3000 }, target: 'items',
    conditions: { channels: ['card'], issuers: ['dukhan'], networks: ['visa'], minSpendDh: 4000, expiry: { relHours: 66 } },
    stacking: NONE, verifyInApp: ['Card tier (Visa Signature)', '4 uses per customer'],
    classification: 'documented_structure', confidence: 'high', sourceId: 'dukhan-rafeeq-tc-pdf',
    summary: '30% off with a Dukhan Bank Visa card, up to QAR 30. Not with Apple Pay or cash. Cannot combine.',
    notes: 'Modelled on the real DKB30 terms (17 Feb to 19 Mar 2026). This demo version uses a new code and dates.',
  }),
  seed({
    id: 'R2', platformId: 'rafeeq', name: 'Dukhan Visa Infinite 50% off (Feb to Mar 2026)', code: 'DKB50', kind: 'bank',
    benefit: { type: 'percent', pct: 50, capDh: 5000 }, target: 'items',
    conditions: { channels: ['card'], issuers: ['dukhan'], networks: ['visa'], expiry: { iso: '2026-03-19T23:59:00+03:00' } },
    stacking: NONE, verifyInApp: ['Historical offer: no longer valid'],
    classification: 'researched_historical', confidence: 'high', sourceId: 'dukhan-rafeeq-tc-pdf',
    summary: 'A past Dukhan Visa Infinite offer: 50% off, up to QAR 50. Expired.',
    notes: 'Real historical offer shown with its real dates, to demonstrate expiry.',
  }),
  seed({
    id: 'R3', platformId: 'rafeeq', name: 'Rafeeq Pro free delivery', kind: 'membership',
    benefit: { type: 'free_delivery' }, target: 'delivery',
    conditions: { membership: 'rafeeq_pro', expiry: { relHours: 720 } }, stacking: ANY,
    verifyInApp: ['Pro benefits'], classification: 'invented_demo', confidence: 'low',
    summary: 'Free delivery for Rafeeq Pro members.',
    notes: 'A QAR 1 per month Pro campaign is documented (Dukhan Bank, until 31 Dec 2026). The benefits listed here are assumed.',
  }),

  // ---------- Keeta ----------
  seed({
    id: 'K1', platformId: 'keeta', name: 'Keeta new-user free delivery', kind: 'auto',
    benefit: { type: 'free_delivery' }, target: 'delivery',
    conditions: { firstOrder: true, expiry: { relHours: 168 } }, stacking: ANY,
    verifyInApp: ['New-user status'], classification: 'documented_structure', confidence: 'medium',
    sourceId: 'keeta-launch-iamqatar', summary: 'Free delivery on your first Keeta order.',
    notes: 'Keeta advertised free delivery and QAR 200 in vouchers for new users at launch (Aug 2025).',
  }),
  seed({
    id: 'K2', platformId: 'keeta', name: 'Keeta QAR 20 off first order', code: 'DEMO-KEETA20', kind: 'code',
    benefit: { type: 'fixed', dh: 2000 }, target: 'items',
    conditions: { firstOrder: true, minSpendDh: 6000, expiry: { relHours: 144 } }, stacking: CODE,
    verifyInApp: ['Voucher-pack terms'], classification: 'documented_structure', confidence: 'low',
    sourceId: 'mox-keeta-pdf', summary: 'QAR 20 off your first order of QAR 60 or more. Items only, not fees.',
    notes: 'Items-only and minimum-order structure taken from a non-Qatar Keeta offer document.',
  }),
  seed({
    id: 'K3', platformId: 'keeta', name: 'Keeta 25% off', code: 'DEMO-KT25', kind: 'code',
    benefit: { type: 'percent', pct: 25, capDh: 1200 }, target: 'items',
    conditions: { minSpendDh: 3500, expiry: { relHours: -20 } }, stacking: CODE,
    verifyInApp: [], classification: 'invented_demo', confidence: 'low',
    summary: '25% off, up to QAR 12, on QAR 35 or more. Expired.',
  }),

  // ---------- Ninja ----------
  seed({
    id: 'N1', platformId: 'ninja', name: 'Ninja Premium free delivery', kind: 'membership',
    benefit: { type: 'free_delivery' }, target: 'delivery',
    conditions: { membership: 'ninja_premium', minSpendDh: 4000, expiry: { relHours: 720 } }, stacking: ANY,
    verifyInApp: ['Qatar threshold'], classification: 'documented_structure', confidence: 'low',
    sourceId: 'ananinja-faq', summary: 'Free delivery on QAR 40 or more for Ninja Premium members.',
    notes: 'The FAQ states its thresholds in SAR. The QAR amount is assumed.',
  }),
  seed({
    id: 'N2', platformId: 'ninja', name: 'Ninja referral QAR 15 off', code: 'DEMO-NINJAREF', kind: 'code',
    benefit: { type: 'fixed', dh: 1500 }, target: 'items',
    conditions: { firstOrder: true, minSpendDh: 5000, expiry: { relHours: 167 } }, stacking: CODE,
    verifyInApp: ['Referral link'], classification: 'documented_structure', confidence: 'medium',
    sourceId: 'ananinja-faq', summary: 'QAR 15 off your first order of QAR 50 or more, from a friend referral.',
  }),
  seed({
    id: 'N3', platformId: 'ninja', name: 'Ninja dairy 15% off', code: 'DEMO-NJDAIRY', kind: 'code',
    benefit: { type: 'percent', pct: 15, capDh: 1000 }, target: 'items',
    conditions: { categories: ['dairy'], expiry: { relHours: 9 } },
    stacking: { withCodes: false, withBank: true, withMembership: false, withAuto: true },
    verifyInApp: [], classification: 'documented_structure', confidence: 'medium', sourceId: 'ananinja-faq',
    summary: '15% off dairy, up to QAR 10. Not with Ninja Premium.',
    notes: 'The FAQ says a discount code cannot be combined with a Premium offer.',
  }),

  // ---------- Carrefour ----------
  seed({
    id: 'C1', platformId: 'carrefour', name: 'Carrefour 10% off groceries', code: 'DEMO-SAVE10', kind: 'code',
    benefit: { type: 'percent', pct: 10, capDh: 2000 }, target: 'items',
    conditions: { scenarios: ['grocery'], minSpendDh: 10000, expiry: { relHours: 96 } }, stacking: CODE,
    verifyInApp: ['Current code'], classification: 'documented_structure', confidence: 'low',
    sourceId: 'carrefour-snippet', summary: '10% off groceries, up to QAR 20, on QAR 100 or more.',
    notes: 'A "SAVE10, max 20QR" style code was seen in search snippets. The minimum spend is assumed.',
  }),
  seed({
    id: 'C2', platformId: 'carrefour', name: 'Carrefour free delivery from QAR 99', kind: 'auto',
    benefit: { type: 'free_delivery' }, target: 'delivery',
    conditions: { minSpendDh: 9900, expiry: { relHours: 156 } }, stacking: ANY,
    verifyInApp: ['Slot type'], classification: 'documented_structure', confidence: 'low',
    sourceId: 'carrefour-snippet', summary: 'Free delivery on orders of QAR 99 or more.',
    notes: 'Free express delivery over QAR 99 was promoted in 2025 (search snippet).',
  }),
  seed({
    id: 'C3', platformId: 'carrefour', name: 'Carrefour weekly deals: milk and Tide', kind: 'sale',
    benefit: { type: 'sale_price' }, target: 'items',
    conditions: { expiry: { relHours: 40 } }, stacking: ANY,
    verifyInApp: [], classification: 'invented_demo', confidence: 'low',
    summary: 'Sale prices on Almarai milk and Tide at Carrefour.',
  }),

  // ---------- Lulu ----------
  seed({
    id: 'L1', platformId: 'lulu', name: 'LuLu Mastercard 20% off (Sep 2026 flash)', kind: 'bank',
    benefit: { type: 'percent', pct: 20, capDh: 4500 }, target: 'items',
    conditions: {
      scenarios: ['grocery'], channels: ['card'], issuers: ['lulu_cobrand'], networks: ['mastercard'],
      minSpendDh: 20000, expiry: { iso: '2026-09-27T23:59:00+03:00' },
    },
    stacking: CODE, verifyInApp: ['Past offer'], classification: 'documented_structure', confidence: 'low',
    sourceId: 'lulu-mastercard-snippet',
    summary: '20% off with a Qatar LuLu Mastercard, up to QAR 45, on QAR 200 or more. Expired.',
    notes: 'Seen only in a search snippet. The cap differs between versions of the terms (QAR 45 or 80) and the dates are unverified.',
  }),
  seed({
    id: 'L2', platformId: 'lulu', name: 'Lulu QAR 15 off groceries', code: 'DEMO-LULU15', kind: 'code',
    benefit: { type: 'fixed', dh: 1500 }, target: 'items',
    conditions: { scenarios: ['grocery'], minSpendDh: 15000, expiry: { relHours: 120 } }, stacking: CODE,
    verifyInApp: [], classification: 'invented_demo', confidence: 'low',
    summary: 'QAR 15 off groceries on QAR 150 or more.',
  }),
  seed({
    id: 'L3', platformId: 'lulu', name: 'Lulu rice week: India Gate 5kg', kind: 'sale',
    benefit: { type: 'sale_price' }, target: 'items',
    conditions: { expiry: { relHours: 70 } }, stacking: ANY,
    verifyInApp: [], classification: 'invented_demo', confidence: 'low',
    summary: 'Sale price on India Gate Basmati 5kg at Lulu.',
  }),

  // ---------- Kulud ----------
  seed({
    id: 'KU1', platformId: 'kulud', name: 'Kulud skincare offers: CeraVe 20% off', kind: 'sale',
    benefit: { type: 'sale_price' }, target: 'items',
    conditions: { expiry: { relHours: 96 } }, stacking: ANY,
    verifyInApp: [], classification: 'invented_demo', confidence: 'low',
    summary: 'Sale prices on CeraVe at Kulud.',
    notes: 'The Kulud offers page could not be verified (it showed Wellcare content), so this is a demo sale.',
  }),
  seed({
    id: 'KU2', platformId: 'kulud', name: 'Kulud free delivery over QAR 100', kind: 'auto',
    benefit: { type: 'free_delivery' }, target: 'delivery',
    conditions: { minSpendDh: 10000, expiry: { relHours: 720 } }, stacking: ANY,
    verifyInApp: ['Threshold'], classification: 'invented_demo', confidence: 'low',
    summary: 'Free delivery on orders of QAR 100 or more.',
  }),
  seed({
    id: 'KU3', platformId: 'kulud', name: 'Kulud skincare 10% off', code: 'DEMO-KULUD10', kind: 'code',
    benefit: { type: 'percent', pct: 10, capDh: 1500 }, target: 'items',
    conditions: { categories: ['skincare'], minSpendDh: 8000, expiry: { relHours: 70 } }, stacking: CODE,
    verifyInApp: [], classification: 'invented_demo', confidence: 'low',
    summary: '10% off skincare, up to QAR 15, on QAR 80 or more.',
  }),

  // ---------- Wellcare ----------
  seed({
    id: 'W1', platformId: 'wellcare', name: 'Wellcare free delivery from QAR 89', kind: 'auto',
    benefit: { type: 'free_delivery' }, target: 'delivery',
    conditions: { minSpendDh: 8900, expiry: { relHours: 720 } }, stacking: ANY,
    verifyInApp: [], classification: 'documented_structure', confidence: 'high', sourceId: 'wellcare-home',
    summary: 'Free delivery on orders of QAR 89 or more.',
  }),
  seed({
    id: 'W2', platformId: 'wellcare', name: 'Wellcare La Roche-Posay 25% off', kind: 'sale',
    benefit: { type: 'sale_price' }, target: 'items',
    conditions: { expiry: { relHours: 54 } }, stacking: ANY,
    verifyInApp: [], classification: 'documented_structure', confidence: 'medium', sourceId: 'wellcare-home',
    summary: 'Sale price on La Roche-Posay Anthelios at Wellcare.',
    notes: 'Percentage-off items are shown on the Wellcare site. The brand and discount here are chosen for the demo.',
  }),
  seed({
    id: 'W3', platformId: 'wellcare', name: 'Wellcare first order QAR 20 off', code: 'DEMO-WELL20', kind: 'code',
    benefit: { type: 'fixed', dh: 2000 }, target: 'items',
    conditions: {
      categories: ['skincare', 'personal-care'], firstOrder: true, minSpendDh: 15000, expiry: { relHours: 144 },
    },
    stacking: CODE, verifyInApp: ['New-account check'], classification: 'invented_demo', confidence: 'low',
    summary: 'QAR 20 off your first skincare or personal-care order of QAR 150 or more.',
  }),
];

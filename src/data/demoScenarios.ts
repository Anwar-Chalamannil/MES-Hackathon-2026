import type { Basket, Dh, Profile, SortMode } from '../engine/types';
import { DEFAULT_PROFILE } from './defaults';

/**
 * AUTHORITATIVE demo specification (plan v2 section 5). Datasets, tests, E2E and the pitch all read this.
 * Totals are integer dirhams. If an expected number looks wrong, re-derive it by hand and fix the
 * data or the engine. NEVER edit an expectation just to make a test pass.
 *
 * Each step is self-contained: wallet = DEFAULT_SAVED_IDS + addSaved, profile = DEFAULT_PROFILE + profile.
 * Time: now = demo anchor.
 */
export interface DemoStep {
  id: string;
  action: string;
  basket: Basket;
  profile: Profile;
  addSaved: string[];
  mode: SortMode;
  expect: {
    /** listingId of the winner. Omitted when singlePlatform. */
    winner?: string;
    singlePlatform?: boolean;
    /** listingId -> final payable total, or 'incomplete'. */
    totals: Record<string, Dh | 'incomplete'>;
    /** Promotions that must be evaluated as not eligible, with a fragment of the reason. */
    rejections?: { listingId: string; promoId: string; reasonIncludes: string }[];
    /** The winner in other modes for the same state. */
    modeChecks?: { mode: SortMode; winner: string }[];
    /** Winner total minus the best-price total, and the exact gap text fragment. */
    gap?: { dh: Dh; textIncludes: string };
  };
}

export interface DemoScenario {
  id: string;
  title: string;
  steps: DemoStep[];
}

const profile = (over: Partial<Profile> = {}): Profile => ({ ...DEFAULT_PROFILE, ...over });
const foodBasket = (merchantId: string, lines: [string, number][]): Basket => ({
  scenario: 'food',
  merchantId,
  lines: lines.map(([productId, qty]) => ({ productId, qty })),
});
const shopBasket = (scenario: 'grocery' | 'pharmacy', lines: [string, number][]): Basket => ({
  scenario,
  lines: lines.map(([productId, qty]) => ({ productId, qty })),
});

// ---- Hero A: Jollibee ----
const JB_HERO = foodBasket('jollibee', [['jb-cj-2pc', 2], ['jb-spaghetti', 1], ['jb-coke-reg', 1]]);
const JB_NO_SPAG = foodBasket('jollibee', [['jb-cj-2pc', 2], ['jb-coke-reg', 1]]);
const JB_WITH_SUNDAE = foodBasket('jollibee', [
  ['jb-cj-2pc', 2], ['jb-spaghetti', 1], ['jb-coke-reg', 1], ['jb-sundae-choc', 1],
]);
const DUKHAN = { channel: 'card', issuer: 'dukhan', network: 'visa' } as const;

const heroA: DemoScenario = {
  id: 'hero-a-jollibee',
  title: 'Hero A: Jollibee',
  steps: [
    {
      id: 'A1', action: 'Default profile', basket: JB_HERO, profile: profile(), addSaved: [], mode: 'price',
      expect: {
        winner: 'jb-keeta',
        totals: { 'jb-talabat': 6300, 'jb-snoonu': 6000, 'jb-rafeeq': 6150, 'jb-keeta': 5800 },
        rejections: [{ listingId: 'jb-keeta', promoId: 'K2', reasonIncludes: '3.00' }],
      },
    },
    {
      id: 'A2', action: 'Add DEMO-TB20', basket: JB_HERO, profile: profile(), addSaved: ['T2'], mode: 'price',
      expect: {
        winner: 'jb-talabat',
        totals: { 'jb-talabat': 5260, 'jb-snoonu': 6000, 'jb-rafeeq': 6150, 'jb-keeta': 5800 },
      },
    },
    {
      id: 'A3', action: 'Remove spaghetti (TB20 no longer applies)', basket: JB_NO_SPAG, profile: profile(),
      addSaved: ['T2'], mode: 'price',
      expect: {
        winner: 'jb-keeta',
        totals: { 'jb-talabat': 5000, 'jb-snoonu': 4650, 'jb-rafeeq': 4800, 'jb-keeta': 4400 },
        rejections: [{ listingId: 'jb-talabat', promoId: 'T2', reasonIncludes: '11.00' }],
      },
    },
    {
      id: 'A4', action: 'Restore spaghetti, bank Dukhan (card, Visa)', basket: JB_HERO, profile: profile(DUKHAN),
      addSaved: ['T2'], mode: 'price',
      expect: {
        winner: 'jb-rafeeq',
        totals: { 'jb-talabat': 5260, 'jb-snoonu': 6000, 'jb-rafeeq': 4530, 'jb-keeta': 5800 },
        modeChecks: [{ mode: 'discount', winner: 'jb-rafeeq' }],
      },
    },
    {
      id: 'A5', action: 'Channel Apple Pay (bank still Dukhan)', basket: JB_HERO,
      profile: profile({ ...DUKHAN, channel: 'apple_pay' }), addSaved: ['T2'], mode: 'price',
      expect: {
        winner: 'jb-talabat',
        totals: { 'jb-talabat': 5260, 'jb-snoonu': 6000, 'jb-rafeeq': 6150, 'jb-keeta': 5800 },
        rejections: [{ listingId: 'jb-rafeeq', promoId: 'R1', reasonIncludes: 'Apple Pay' }],
      },
    },
    {
      id: 'A6', action: 'Channel card again, mode Fastest', basket: JB_HERO, profile: profile(DUKHAN),
      addSaved: ['T2'], mode: 'fastest',
      expect: {
        winner: 'jb-talabat',
        totals: { 'jb-talabat': 5260, 'jb-snoonu': 6000, 'jb-rafeeq': 4530, 'jb-keeta': 5800 },
        gap: { dh: 730, textIncludes: '7.30' },
      },
    },
    {
      id: 'A7', action: 'Add Chocolate Sundae (unavailable on Keeta)', basket: JB_WITH_SUNDAE, profile: profile(),
      addSaved: [], mode: 'price',
      expect: {
        winner: 'jb-snoonu',
        totals: { 'jb-talabat': 6900, 'jb-snoonu': 6650, 'jb-rafeeq': 6800, 'jb-keeta': 'incomplete' },
      },
    },
  ],
};

// ---- Hero B: Grocery ----
const GR_WEEKLY: [string, number][] = [
  ['gr-almarai-milk-2l', 2], ['gr-indiagate-basmati-5kg', 1], ['gr-lipton-yl-100', 1],
  ['gr-fairy-lemon-1l', 1], ['gr-tide-3kg', 1], ['gr-lays-salted-170g', 1],
];
const GR_FAIRY2: [string, number][] = GR_WEEKLY.map(([id, q]) => [id, id === 'gr-fairy-lemon-1l' ? 2 : q]);

const heroB: DemoScenario = {
  id: 'hero-b-grocery',
  title: 'Hero B: Weekly grocery basket',
  steps: [
    {
      id: 'B1', action: 'Default: Lulu has the cheapest items, Carrefour wins on delivery',
      basket: shopBasket('grocery', GR_WEEKLY), profile: profile(), addSaved: [], mode: 'price',
      expect: {
        winner: 'carrefour',
        totals: {
          carrefour: 14825, lulu: 15300, ninja: 'incomplete',
          'talabat-mart': 16075, 'snoonu-lulu': 15700, 'rafeeq-market': 16300,
        },
        rejections: [{ listingId: 'snoonu-lulu', promoId: 'S2', reasonIncludes: '11.00' }],
      },
    },
    {
      id: 'B2', action: 'Add DEMO-LULU15 (minimum spend not met)',
      basket: shopBasket('grocery', GR_WEEKLY), profile: profile(), addSaved: ['L2'], mode: 'price',
      expect: {
        winner: 'carrefour',
        totals: {
          carrefour: 14825, lulu: 15300, ninja: 'incomplete',
          'talabat-mart': 16075, 'snoonu-lulu': 15700, 'rafeeq-market': 16300,
        },
        rejections: [{ listingId: 'lulu', promoId: 'L2', reasonIncludes: '7.00' }],
      },
    },
    {
      id: 'B3', action: 'Two Fairy: Lulu crosses 150 and the voucher unlocks',
      basket: shopBasket('grocery', GR_FAIRY2), profile: profile(), addSaved: ['L2'], mode: 'price',
      expect: {
        winner: 'lulu',
        totals: {
          carrefour: 15775, lulu: 14725, ninja: 'incomplete',
          'talabat-mart': 17050, 'snoonu-lulu': 16675, 'rafeeq-market': 17300,
        },
      },
    },
  ],
};

// ---- Hero C: Pharmacy ----
const PH_CREAM_CLEANSER: [string, number][] = [['ph-cerave-cream-340g', 1], ['ph-cerave-cleanser-236ml', 1]];
const PH_PLUS_SUN: [string, number][] = [...PH_CREAM_CLEANSER, ['ph-lrp-anthelios-50ml', 1]];

const heroC: DemoScenario = {
  id: 'hero-c-pharmacy',
  title: 'Hero C: Skincare',
  steps: [
    {
      id: 'C1', action: 'Cream + cleanser', basket: shopBasket('pharmacy', PH_CREAM_CLEANSER),
      profile: profile(), addSaved: [], mode: 'price',
      expect: {
        winner: 'kulud',
        totals: { wellcare: 13000, kulud: 9720, 'talabat-wellcare': 14500, 'snoonu-kulud': 14400 },
      },
    },
    {
      id: 'C2', action: 'Add sunscreen', basket: shopBasket('pharmacy', PH_PLUS_SUN),
      profile: profile(), addSaved: [], mode: 'price',
      expect: {
        winner: 'kulud',
        totals: { wellcare: 20350, kulud: 18800, 'talabat-wellcare': 24300, 'snoonu-kulud': 24100 },
      },
    },
    {
      id: 'C3', action: 'First order on Wellcare (DEMO-WELL20 unlocks)', basket: shopBasket('pharmacy', PH_PLUS_SUN),
      profile: profile({ firstOrderOn: ['keeta', 'wellcare'] }), addSaved: [], mode: 'price',
      expect: {
        winner: 'wellcare',
        totals: { wellcare: 18350, kulud: 18800, 'talabat-wellcare': 24300, 'snoonu-kulud': 24100 },
      },
    },
  ],
};

// ---- McDonald's small-order fee ----
const heroM: DemoScenario = {
  id: 'hero-m-mcdonalds',
  title: "McDonald's small-order fee",
  steps: [
    {
      id: 'M1', action: 'One McFlurry: Talabat adds a small-order fee',
      basket: foodBasket('mcdonalds', [['mcd-mcflurry-oreo', 1]]), profile: profile(), addSaved: [], mode: 'price',
      expect: { winner: 'mcd-snoonu', totals: { 'mcd-talabat': 2100, 'mcd-snoonu': 1650, 'mcd-rafeeq': 1900 } },
    },
    {
      id: 'M2', action: 'Add a Big Mac Meal: the fee disappears',
      basket: foodBasket('mcdonalds', [['mcd-mcflurry-oreo', 1], ['mcd-bigmac-meal-m', 1]]),
      profile: profile(), addSaved: [], mode: 'price',
      expect: { winner: 'mcd-talabat', totals: { 'mcd-talabat': 4100, 'mcd-snoonu': 4300, 'mcd-rafeeq': 4500 } },
    },
  ],
};

// ---- Shake Shack: one platform only ----
const heroS: DemoScenario = {
  id: 'edge-shake-shack',
  title: 'Shake Shack: only on one platform',
  steps: [
    {
      id: 'S1', action: 'Single listing: nothing to compare',
      basket: foodBasket('shake-shack', [['ss-shackburger', 1]]), profile: profile(), addSaved: [], mode: 'price',
      expect: { singlePlatform: true, totals: {} },
    },
  ],
};

export const DEMO_SCENARIOS: DemoScenario[] = [heroA, heroB, heroC, heroM, heroS];

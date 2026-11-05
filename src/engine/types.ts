// FROZEN CONTRACT (plan v2 §3.2). Change only with an explicit plan update.
// Pure types: no React, no imports from src/data.

/** Integer dirhams. 1 QAR = 100 dh. Never use floats for money. */
export type Dh = number;

export type Scenario = 'food' | 'grocery' | 'pharmacy';
export type PlatformId =
  | 'talabat' | 'snoonu' | 'rafeeq' | 'keeta'
  | 'ninja' | 'carrefour' | 'lulu' | 'kulud' | 'wellcare';
export type Provenance = 'researched' | 'name_researched_price_estimated' | 'sample';
export type PromoClass = 'researched_historical' | 'documented_structure' | 'invented_demo';

export type Channel = 'card' | 'apple_pay' | 'cash'; // how the user pays
export type Issuer = 'dukhan' | 'qnb' | 'lulu_cobrand' | 'other'; // bank that issued the card (ignored for cash)
export type Network = 'visa' | 'mastercard'; // card scheme (ignored for cash)
export type Membership = 'talabat_pro' | 'snoonu_plus' | 'rafeeq_pro' | 'ninja_premium';

export interface Platform {
  id: PlatformId;
  name: string;
  color: string;
  initials: string;
}

export interface Merchant {
  id: string;
  name: string;
  scenario: Scenario;
  kind: 'restaurant' | 'store' | 'pharmacy' | 'shop';
  cuisine?: string;
  tagline: string;
  provenance: Provenance;
  sourceId?: string;
}

export interface FeeRules {
  deliveryDh: Dh;
  service:
    | { kind: 'none' }
    | { kind: 'fixed'; dh: Dh }
    | { kind: 'percent'; pct: number; minDh: Dh; maxDh: Dh };
  smallOrder?: { belowDh: Dh; feeDh: Dh };
}

export interface Listing {
  id: string;
  platformId: PlatformId;
  merchantId: string;
  scenario: Scenario;
  branchLabel: string;
  fees: FeeRules;
  /** Estimated delivery minutes [min, max]. */
  eta: [min: number, max: number];
}

export interface Product {
  id: string;
  scenario: Scenario;
  /** Set for food (merchant-scoped products). */
  merchantId?: string;
  name: string;
  brand?: string;
  size?: string;
  variant?: string;
  category: string;
  description: string;
  refPriceDh: Dh;
  provenance: Provenance;
  sourceId?: string;
  /** listingId -> price. A missing key means unavailable at that listing. */
  prices: Record<string, Dh>;
  /** listingId -> sale price. Applied only while the sale promo has not expired. */
  sale?: Record<string, { saleDh: Dh; promoId: string }>;
}

export type Expiry = { relHours: number } | { iso: string };

export type Benefit =
  | { type: 'percent'; pct: number; capDh?: Dh }
  | { type: 'fixed'; dh: Dh }
  | { type: 'free_delivery' }
  | { type: 'delivery_off'; dh: Dh }
  | { type: 'service_waiver' }
  | { type: 'sale_price' }; // metadata only; the optimiser never considers it

export type PromoTarget = 'items' | 'delivery' | 'service';

export interface Promotion {
  id: string;
  platformId: PlatformId;
  name: string;
  code?: string;
  kind: 'code' | 'bank' | 'membership' | 'auto' | 'sale';
  benefit: Benefit;
  target: PromoTarget;
  conditions: {
    minSpendDh?: Dh;
    scenarios?: Scenario[];
    merchantIds?: string[];
    categories?: string[];
    /** Each checked separately. Omitted = any. */
    channels?: Channel[];
    issuers?: Issuer[];
    networks?: Network[];
    membership?: Membership;
    firstOrder?: boolean;
    expiry: Expiry;
  };
  stacking: {
    withCodes: boolean;
    withBank: boolean;
    withMembership: boolean;
    withAuto: boolean;
  };
  verifyInApp: string[];
  classification: PromoClass;
  confidence: 'high' | 'medium' | 'low';
  sourceId?: string;
  /** One plain-English line for the card. */
  summary: string;
  notes?: string;
  origin: 'seed' | 'user';
}

export interface Source {
  id: string;
  url: string;
  title: string;
  accessed: string; // ISO date
  evidence: 'read_directly' | 'search_snippet' | 'third_party';
}

export interface Catalog {
  platforms: Platform[];
  merchants: Merchant[];
  listings: Listing[];
  products: Product[];
  promotions: Promotion[];
}

export interface BasketLine {
  productId: string;
  qty: number; // 1..20
}

export interface Basket {
  scenario: Scenario;
  /** Food baskets belong to exactly one restaurant. */
  merchantId?: string;
  lines: BasketLine[];
}

/** Demo selections only. Never card numbers. */
export interface Profile {
  channel: Channel;
  issuer: Issuer;
  network: Network;
  memberships: Membership[];
  firstOrderOn: PlatformId[];
}

/** custom: origin 'user', kind 'code' | 'bank' only, iso expiry. */
export interface Wallet {
  savedIds: string[];
  custom: Promotion[];
}

export type SortMode = 'price' | 'fastest' | 'discount';

/** Persisted store shape, version 1. */
export interface PersistedState {
  baskets: Record<Scenario, Basket>;
  activeScenario: Scenario;
  wallet: Wallet;
  profile: Profile;
  sortMode: SortMode;
  demoAnchor: number; // epoch ms; seed promo relHours are measured from here
}

// ---- Engine results ----

export type CondStatus = 'met' | 'failed' | 'assumed' | 'failed_profile' | 'verify';

export interface CondResult {
  key: string;
  label: string;
  status: CondStatus;
  message: string;
}

export interface PromoEval {
  promoId: string;
  /** True when no condition is 'failed' or 'failed_profile'. */
  eligible: boolean;
  conditions: CondResult[];
  /** Saving from the pre-voucher base (0 when not eligible). */
  savingDh: Dh;
  /** First failure message, or "Applied: -QAR x". */
  reason: string;
}

export interface AppliedPromo {
  promoId: string;
  target: PromoTarget;
  savingDh: Dh;
}

export interface OfferLine {
  productId: string;
  qty: number;
  unitDh: Dh;
  regularDh: Dh;
  lineDh: Dh;
}

/** Everything about an offer before vouchers are chosen. */
export interface PricedBase {
  listingId: string;
  platformId: PlatformId;
  merchantId: string;
  eta: [number, number];
  complete: boolean;
  /** Missing product ids at this listing. */
  missing: string[];
  lines: OfferLine[];
  itemsDh: Dh;
  saleSavingsDh: Dh;
  deliveryDh: Dh;
  serviceDh: Dh;
  smallOrderDh: Dh;
}

export interface PricedOffer extends PricedBase {
  applied: AppliedPromo[];
  promoSavingsDh: Dh;
  totalSavingsDh: Dh; // saleSavingsDh + promoSavingsDh
  totalDh: Dh;
  /** Every candidate promo, eligible or not. */
  evaluations: PromoEval[];
}

export interface Comparison {
  ranked: PricedOffer[];
  incomplete: PricedOffer[];
  /** listingId of ranked[0]; undefined when singlePlatform or nothing ranked. */
  winnerId?: string;
  explanation: string;
  singlePlatform: boolean;
}

export interface CompareInput {
  catalog: Catalog;
  basket: Basket;
  wallet: Wallet;
  profile: Profile;
  nowMs: number;
  anchorMs: number;
  mode: SortMode;
}

export interface EvalContext {
  offer: PricedBase;
  basket: Basket;
  catalog: Catalog;
  profile: Profile;
  nowMs: number;
  anchorMs: number;
}

/** Amounts the optimiser may reduce (smallOrderDh is never discounted). */
export interface OptimizeBase {
  itemsDh: Dh;
  deliveryDh: Dh;
  serviceDh: Dh;
  smallOrderDh: Dh;
}

export interface OptimizeResult {
  applied: AppliedPromo[];
  totalDh: Dh;
}

export type ExpiryBucket = 'expired' | '24h' | '3d' | '7d' | 'later';

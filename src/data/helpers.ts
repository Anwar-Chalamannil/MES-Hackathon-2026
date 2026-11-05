import type { Dh, Product, Provenance } from '../engine/types';

/**
 * Zips a list of prices (in listing order) into a listingId -> price map.
 * null means "not available at that listing" and the key is simply left out.
 */
export function priceMap(listingIds: string[], values: (Dh | null)[]): Record<string, Dh> {
  if (values.length !== listingIds.length) {
    throw new Error(`priceMap: expected ${listingIds.length} prices, got ${values.length}`);
  }
  const out: Record<string, Dh> = {};
  listingIds.forEach((id, i) => {
    const v = values[i];
    if (v !== null) out[id] = v;
  });
  return out;
}

/** [id, name, category, description, reference price (dh), prices in listing order] */
export type FoodRow = [
  id: string,
  name: string,
  category: string,
  description: string,
  refPriceDh: Dh,
  prices: (Dh | null)[],
];

export function makeFoodProducts(
  merchantId: string,
  listingIds: string[],
  rows: FoodRow[],
  provenance: Provenance,
  sourceId?: string,
): Product[] {
  return rows.map(([id, name, category, description, refPriceDh, prices]) => ({
    id,
    scenario: 'food',
    merchantId,
    name,
    category,
    description,
    refPriceDh,
    provenance,
    ...(sourceId ? { sourceId } : {}),
    prices: priceMap(listingIds, prices),
  }));
}

export interface RetailRow {
  id: string;
  brand: string;
  name: string;
  size: string;
  variant?: string;
  category: string;
  description: string;
  refPriceDh: Dh;
  /** Regular prices in listing order; null = unavailable. */
  prices: (Dh | null)[];
  /** listingId -> sale price. Applied only while the sale promotion is unexpired. */
  sale?: Record<string, { saleDh: Dh; promoId: string }>;
}

export function makeRetailProducts(
  scenario: 'grocery' | 'pharmacy',
  listingIds: string[],
  rows: RetailRow[],
): Product[] {
  return rows.map(({ prices, sale, ...rest }) => ({
    ...rest,
    scenario,
    provenance: 'sample' as const,
    prices: priceMap(listingIds, prices),
    ...(sale ? { sale } : {}),
  }));
}

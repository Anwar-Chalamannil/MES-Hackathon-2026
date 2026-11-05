import type { Listing, Merchant, Platform, Product, Promotion } from '../engine/types';
import { catalog } from './catalog';

/** Quick lookups by id. The catalogue never changes while the app runs. */
export const productById = new Map<string, Product>(catalog.products.map((p) => [p.id, p]));
export const merchantById = new Map<string, Merchant>(catalog.merchants.map((m) => [m.id, m]));
export const platformById = new Map<string, Platform>(catalog.platforms.map((p) => [p.id, p]));
export const listingById = new Map<string, Listing>(catalog.listings.map((l) => [l.id, l]));
export const promoById = new Map<string, Promotion>(catalog.promotions.map((p) => [p.id, p]));

/** Finds a seed or custom (user-made) promotion by id. */
export const findPromo = (id: string, custom: Promotion[]): Promotion | undefined =>
  promoById.get(id) ?? custom.find((p) => p.id === id);

export const platformName =(id: string) => platformById.get(id)?.name ?? id;

/** Listings (merchant on a platform) for one merchant. */
export const listingsOfMerchant = (merchantId: string): Listing[] =>
  catalog.listings.filter((l) => l.merchantId === merchantId);

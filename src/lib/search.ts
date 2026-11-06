import { catalog } from '../data/catalog';
import type { Merchant, Platform, Product } from '../engine/types';

export interface SearchResults {
  query: string;
  restaurants: Merchant[];
  products: Product[];
  /** Delivery apps whose name matched, with the stores/restaurants they carry. */
  apps: { platform: Platform; merchants: Merchant[] }[];
}

/** Words typed in any case or with extra spaces all match the same way. */
export const normalise = (s: string): string =>
  s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/(\d)\s(kg|g|ml|l|pcs?)\b/g, '$1$2') // "340 g" and "340g" are the same size
    .trim();

/** Suggestions shown when the search box is empty. All exist in the catalogue. */
export const SEARCH_SUGGESTIONS = ['Chickenjoy', 'Milk', 'CeraVe', 'Pizza', 'Talabat', 'Karak'];

const productText = (p: Product): string =>
  normalise([p.name, p.brand, p.size, p.variant, p.description, p.category].filter(Boolean).join(' '));

const merchantText = (m: Merchant): string => normalise([m.name, m.cuisine, m.tagline].filter(Boolean).join(' '));

/**
 * Searches the real catalogue. Every word must appear somewhere (so "cerave cream" finds the cream, not the cleanser).
 * Pure: the catalogue is passed in so tests can use any data.
 */
export function search(query: string, source = catalog): SearchResults {
  const q = normalise(query);
  const empty: SearchResults = { query: q, restaurants: [], products: [], apps: [] };
  if (!q) return empty;
  const words = q.split(' ');
  const all = (text: string) => words.every((w) => text.includes(w));

  const restaurants = source.merchants.filter((m) => m.kind === 'restaurant' && all(merchantText(m)));
  const products = source.products.filter((p) => all(productText(p)));

  const apps = source.platforms
    .filter((pl) => all(normalise(pl.name)))
    .map((platform) => {
      const ids = new Set(source.listings.filter((l) => l.platformId === platform.id).map((l) => l.merchantId));
      return { platform, merchants: source.merchants.filter((m) => ids.has(m.id)) };
    });

  // An app match also surfaces the restaurants it carries, so "talabat" finds places to order from.
  const viaApps = apps.flatMap((a) => a.merchants).filter((m) => m.kind === 'restaurant');
  const merged = [...restaurants, ...viaApps.filter((m) => !restaurants.some((r) => r.id === m.id))];

  return { query: q, restaurants: merged, products, apps };
}

export const hasResults = (r: SearchResults): boolean => r.restaurants.length + r.products.length + r.apps.length > 0;

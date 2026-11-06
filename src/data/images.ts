import type { Merchant, Product } from '../engine/types';
import { IMAGE_FILES, type ImageExt } from './imageFiles.generated';

/**
 * Where every image comes from, and its alt text. The files themselves are made by `npm run images`
 * from the originals in assets-src/, and src/data/imageFiles.generated.ts lists which ones exist.
 * A missing file is never an error: the screen shows a designed fallback tile instead.
 *
 * Product image order: the team's own photo (products/{productId}) first, else the shared dish photo
 * (dishes/{dishKey}), else the fallback. Never hotlink, never copy from Talabat, Snoonu or retailer sites.
 */
export type ImageKind = keyof typeof IMAGE_FILES;
export type ImageSize = 160 | 480;

export interface ImageSource {
  /** Smallest file; for SVG the only file. */
  src: string;
  /** Present for photos: 160w and 480w versions. */
  srcSet?: string;
  alt: string;
  /** True for generic stock food photos, so the screen can say "illustrative". */
  illustrative: boolean;
}

/** File url, or undefined when that image has not been supplied yet. */
export function imageUrl(kind: ImageKind, id: string, size: ImageSize = 160): string | undefined {
  const ext: ImageExt | undefined = IMAGE_FILES[kind][id];
  if (!ext) return undefined;
  return ext === 'svg' ? `/img/${kind}/${id}.svg` : `/img/${kind}/${id}-${size}.webp`;
}

function sourceFor(kind: ImageKind, id: string, alt: string, illustrative: boolean): ImageSource | undefined {
  const small = imageUrl(kind, id, 160);
  if (!small) return undefined;
  const big = imageUrl(kind, id, 480)!;
  return { src: small, srcSet: small === big ? undefined : `${small} 160w, ${big} 480w`, alt, illustrative };
}

export const merchantLogo = (m: Pick<Merchant, 'id' | 'name'>) => sourceFor('merchants', m.id, `${m.name} logo`, false);

export const platformLogo = (platformId: string, name: string) => sourceFor('platforms', platformId, `${name} logo`, false);

/** What each restaurant product looks like, by shared dish photo key. */
export const DISH_KEYS: Record<string, string> = {
  'jb-cj-1pc': 'fried-chicken', 'jb-cj-2pc': 'fried-chicken', 'jb-bucket-6pc': 'chicken-bucket',
  'jb-yumburger': 'burger', 'jb-spaghetti': 'spaghetti', 'jb-fries-reg': 'fries',
  'jb-coke-reg': 'cola-glass', 'jb-sundae-choc': 'sundae',
  'mcd-mcflurry-oreo': 'ice-cream-cup', 'mcd-bigmac-meal-m': 'cheeseburger', 'mcd-bigmac': 'cheeseburger',
  'mcd-mcchicken': 'chicken-sandwich', 'mcd-nuggets-6': 'nuggets', 'mcd-fries-m': 'fries',
  'mcd-apple-pie': 'apple-pie', 'mcd-coke-m': 'cola-glass',
  'km-karak-tea': 'karak-tea', 'km-saffron-karak': 'karak-tea', 'km-chapati-cheese': 'chapati-roll',
  'km-chapati-zaatar': 'chapati-roll', 'km-chapati-nutella': 'chapati-roll', 'km-egg-paratha': 'paratha',
  'km-mint-lemonade': 'mint-lemonade',
  'pzh-margherita-m': 'pizza-margherita', 'pzh-pepperoni-m': 'pizza-pepperoni', 'pzh-super-supreme-m': 'pizza-supreme',
  'pzh-chicken-supreme-m': 'pizza-supreme', 'pzh-garlic-bread': 'garlic-bread', 'pzh-wings-6': 'chicken-wings',
  'pzh-pepsi-1-5l': 'cola-glass',
  'fw-flat-white': 'flat-white-coffee', 'fw-spanish-latte': 'flat-white-coffee', 'fw-cappuccino': 'cappuccino',
  'fw-iced-americano': 'iced-americano', 'fw-butter-croissant': 'croissant', 'fw-banana-bread': 'banana-bread',
  'ss-shackburger': 'burger', 'ss-smokeshack': 'cheeseburger', 'ss-chickn-shack': 'chicken-sandwich',
  'ss-crinkle-fries': 'fries', 'ss-vanilla-shake': 'milkshake', 'ss-lemonade': 'lemonade',
};

/** Alt text for each dish photo. The photos are generic, so they are always described as illustrative. */
export const DISH_ALT: Record<string, string> = {
  'fried-chicken': 'Fried chicken pieces', 'chicken-bucket': 'A bucket of fried chicken', burger: 'A burger',
  cheeseburger: 'A cheeseburger', 'chicken-sandwich': 'A chicken sandwich', fries: 'French fries', nuggets: 'Chicken nuggets',
  spaghetti: 'A plate of spaghetti', sundae: 'A chocolate sundae', 'ice-cream-cup': 'A cup of ice cream',
  'apple-pie': 'A baked apple pie', 'cola-glass': 'A glass of cola', 'karak-tea': 'A cup of karak tea',
  'chapati-roll': 'A chapati roll', paratha: 'A paratha with egg', 'mint-lemonade': 'Mint lemonade',
  'pizza-margherita': 'A margherita pizza', 'pizza-pepperoni': 'A pepperoni pizza', 'pizza-supreme': 'A supreme pizza',
  'garlic-bread': 'Garlic bread', 'chicken-wings': 'Chicken wings', 'flat-white-coffee': 'A flat white coffee',
  cappuccino: 'A cappuccino', 'iced-americano': 'An iced americano', croissant: 'A butter croissant',
  'banana-bread': 'A slice of banana bread', milkshake: 'A milkshake', lemonade: 'A glass of lemonade',
};

/** Credits for the shared dish photos, shown on the About page. Filled in when the approved shortlist is downloaded. */
export const DISH_CREDITS: Record<string, { author: string; source: 'Unsplash' | 'Pexels'; url: string }> = {};

export function productImage(p: Product): ImageSource | undefined {
  const detail = [p.brand, p.name, p.size].filter(Boolean).join(' ');
  const own = sourceFor('products', p.id, p.scenario === 'food' ? p.name : detail, false);
  if (own) return own;
  const dish = DISH_KEYS[p.id];
  if (!dish) return undefined;
  return sourceFor('dishes', dish, `${DISH_ALT[dish] ?? p.name} (illustrative)`, true);
}

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

/** The wide Doha skyline photo on the Home banner (assets-src/hero/doha-skyline). Decorative, so its alt text is empty. */
export function heroImage(): (ImageSource & { width: number; height: number }) | undefined {
  if (!IMAGE_FILES.hero['doha-skyline']) return undefined;
  const small = '/img/hero/doha-skyline-800.webp';
  const big = '/img/hero/doha-skyline-1600.webp';
  return { src: small, srcSet: `${small} 800w, ${big} 1600w`, alt: '', illustrative: false, width: 1600, height: 854 };
}

export const merchantLogo = (m: Pick<Merchant, 'id' | 'name'>) => sourceFor('merchants', m.id, `${m.name} logo`, false);

export const platformLogo = (platformId: string, name: string) => sourceFor('platforms', platformId, `${name} logo`, false);

/** What each restaurant product looks like, by shared dish photo key. */
export const DISH_KEYS: Record<string, string> = {
  'jb-cj-1pc': 'fried-chicken',
  'jb-cj-2pc': 'fried-chicken',
  'jb-bucket-6pc': 'chicken-bucket',
  'jb-yumburger': 'burger',
  'jb-spaghetti': 'spaghetti',
  'jb-fries-reg': 'fries',
  'jb-coke-reg': 'cola-glass',
  'jb-sundae-choc': 'sundae',
  'mcd-mcflurry-oreo': 'ice-cream-cup',
  'mcd-bigmac-meal-m': 'big-mac',
  'mcd-bigmac': 'big-mac',
  'mcd-mcchicken': 'mcchicken',
  'mcd-nuggets-6': 'nuggets',
  'mcd-fries-m': 'fries',
  'mcd-apple-pie': 'apple-pie',
  'mcd-coke-m': 'cola-glass',
  'km-karak-tea': 'karak-tea',
  'km-saffron-karak': 'saffron-karak',
  'km-chapati-cheese': 'chapati-cheese',
  'km-chapati-zaatar': 'chapati-zaatar',
  'km-chapati-nutella': 'chapati-nutella',
  'km-egg-paratha': 'paratha',
  'km-mint-lemonade': 'mint-lemonade',
  'pzh-margherita-m': 'pizza-margherita',
  'pzh-pepperoni-m': 'pizza-pepperoni',
  'pzh-super-supreme-m': 'pizza-super-supreme',
  'pzh-chicken-supreme-m': 'pizza-chicken-supreme',
  'pzh-garlic-bread': 'garlic-bread',
  'pzh-wings-6': 'chicken-wings',
  'pzh-pepsi-1-5l': 'cola-glass',
  'fw-flat-white': 'flat-white-coffee',
  'fw-spanish-latte': 'spanish-latte',
  'fw-cappuccino': 'cappuccino',
  'fw-iced-americano': 'iced-americano',
  'fw-butter-croissant': 'croissant',
  'fw-banana-bread': 'banana-bread',
  'ss-shackburger': 'shackburger',
  'ss-smokeshack': 'smokeshack',
  'ss-chickn-shack': 'chickn-shack',
  'ss-crinkle-fries': 'fries',
  'ss-vanilla-shake': 'milkshake',
  'ss-lemonade': 'lemonade',
};

/** Alt text for each dish photo. The photos are generic, so they are always described as illustrative. */
export const DISH_ALT: Record<string, string> = {
  'fried-chicken': 'Fried chicken drumsticks',
  'chicken-bucket': 'A bucket of fried chicken',
  'burger': 'A burger',
  'shackburger': 'A cheeseburger with lettuce and tomato',
  'big-mac': 'A double cheeseburger',
  'smokeshack': 'A bacon cheeseburger',
  'mcchicken': 'A crispy chicken burger',
  'chickn-shack': 'A crispy chicken burger with pickles',
  'fries': 'French fries',
  'nuggets': 'Chicken nuggets',
  'spaghetti': 'A plate of spaghetti',
  'sundae': 'A chocolate sundae',
  'ice-cream-cup': 'Ice cream cups',
  'apple-pie': 'Apple pastries',
  'cola-glass': 'A glass of iced cola',
  'karak-tea': 'A glass of milky tea',
  'saffron-karak': 'Milky tea topped with saffron',
  'chapati-cheese': 'A grilled flatbread roll with cheese',
  'chapati-zaatar': 'Za\'atar flatbread',
  'chapati-nutella': 'A folded flatbread with chocolate',
  'paratha': 'Paratha with onion and mint',
  'mint-lemonade': 'Mint lemonade',
  'lemonade': 'A glass of lemonade',
  'pizza-margherita': 'A margherita pizza',
  'pizza-pepperoni': 'A pepperoni pizza',
  'pizza-super-supreme': 'A loaded pizza',
  'pizza-chicken-supreme': 'A chicken pizza',
  'garlic-bread': 'Garlic bread',
  'chicken-wings': 'Chicken wings',
  'flat-white-coffee': 'A flat white coffee',
  'spanish-latte': 'An iced milky coffee',
  'cappuccino': 'A cappuccino',
  'iced-americano': 'An iced americano',
  'croissant': 'A butter croissant',
  'banana-bread': 'A slice of banana bread',
  'milkshake': 'A milkshake',
};

/** Credits for the shared dish photos, shown on the About page. Filled in when the approved shortlist is downloaded. */
export const DISH_CREDITS: Record<string, { author: string; source: 'Unsplash' | 'Pexels'; url: string }> = {
  'milkshake': { author: 'Alejandro Aznar', source: 'Pexels', url: 'https://www.pexels.com/photo/28525197/' },
  'banana-bread': { author: 'Polina Tankilevitch', source: 'Pexels', url: 'https://www.pexels.com/photo/5419341/' },
  'croissant': { author: 'Polina Tankilevitch', source: 'Pexels', url: 'https://www.pexels.com/photo/4828275/' },
  'pizza-margherita': { author: 'Rene Strgar', source: 'Pexels', url: 'https://www.pexels.com/photo/35068608/' },
  'garlic-bread': { author: 'nikhil bali', source: 'Pexels', url: 'https://www.pexels.com/photo/13062441/' },
  'chicken-wings': { author: 'Valeria Boltneva', source: 'Pexels', url: 'https://www.pexels.com/photo/8862763/' },
  'cappuccino': { author: 'Alexey Demidov', source: 'Pexels', url: 'https://www.pexels.com/photo/9949102/' },
  'iced-americano': { author: 'Nguyễn Tiến Thịnh', source: 'Pexels', url: 'https://www.pexels.com/photo/34932738/' },
  'fried-chicken': { author: 'Kai-Chieh Chan', source: 'Pexels', url: 'https://www.pexels.com/photo/5652264/' },
  'chicken-bucket': { author: 'Hakim LEVEL', source: 'Pexels', url: 'https://www.pexels.com/photo/33037756/' },
  'burger': { author: 'Valeria Boltneva', source: 'Pexels', url: 'https://www.pexels.com/photo/1639565/' },
  'shackburger': { author: 'pedro furtado', source: 'Pexels', url: 'https://www.pexels.com/photo/30500751/' },
  'big-mac': { author: 'Gonzalo Acuña', source: 'Pexels', url: 'https://www.pexels.com/photo/10922927/' },
  'smokeshack': { author: 'Mike C', source: 'Pexels', url: 'https://www.pexels.com/photo/38895877/' },
  'mcchicken': { author: 'Qamar Rehman', source: 'Pexels', url: 'https://www.pexels.com/photo/11354487/' },
  'chickn-shack': { author: 'Eiliv Aceron', source: 'Pexels', url: 'https://www.pexels.com/photo/6896379/' },
  'fries': { author: 'Alena Shekhovtcova', source: 'Pexels', url: 'https://www.pexels.com/photo/6941036/' },
  'nuggets': { author: 'Evgeniya Davydova', source: 'Pexels', url: 'https://www.pexels.com/photo/11710531/' },
  'spaghetti': { author: 'Rendy Ramdani', source: 'Pexels', url: 'https://www.pexels.com/photo/12211642/' },
  'sundae': { author: 'Karl Solano', source: 'Pexels', url: 'https://www.pexels.com/photo/9510367/' },
  'ice-cream-cup': { author: 'Ali Dashti', source: 'Pexels', url: 'https://www.pexels.com/photo/22809608/' },
  'apple-pie': { author: 'Jessica Davis', source: 'Pexels', url: 'https://www.pexels.com/photo/9368665/' },
  'cola-glass': { author: 'Ron Lach', source: 'Pexels', url: 'https://www.pexels.com/photo/8879617/' },
  'karak-tea': { author: 'vishranthanadka7', source: 'Pexels', url: 'https://www.pexels.com/photo/37186989/' },
  'saffron-karak': { author: 'Denys Gromov', source: 'Pexels', url: 'https://www.pexels.com/photo/12419206/' },
  'chapati-cheese': { author: 'Fernanda Lima', source: 'Pexels', url: 'https://www.pexels.com/photo/16418670/' },
  'chapati-zaatar': { author: 'eat kubba', source: 'Pexels', url: 'https://www.pexels.com/photo/7935287/' },
  'chapati-nutella': { author: 'ROMAN ODINTSOV', source: 'Pexels', url: 'https://www.pexels.com/photo/5902967/' },
  'paratha': { author: 'Mohammad Fahim', source: 'Pexels', url: 'https://www.pexels.com/photo/40262786/' },
  'mint-lemonade': { author: 'Bilal Moazzam', source: 'Pexels', url: 'https://www.pexels.com/photo/39536485/' },
  'lemonade': { author: 'Patricia Beliga', source: 'Pexels', url: 'https://www.pexels.com/photo/16411715/' },
  'pizza-pepperoni': { author: 'Alejandro Aznar', source: 'Pexels', url: 'https://www.pexels.com/photo/12557605/' },
  'pizza-super-supreme': { author: 'Mohammad Fahim', source: 'Pexels', url: 'https://www.pexels.com/photo/40262797/' },
  'pizza-chicken-supreme': { author: 'Amit Fulwaria', source: 'Pexels', url: 'https://www.pexels.com/photo/20115307/' },
  'flat-white-coffee': { author: 'Anne-marie _', source: 'Pexels', url: 'https://www.pexels.com/photo/36851643/' },
  'spanish-latte': { author: 'Denys Gromov', source: 'Pexels', url: 'https://www.pexels.com/photo/18142624/' },
};

export function productImage(p: Product): ImageSource | undefined {
  const detail = [p.brand, p.name, p.size].filter(Boolean).join(' ');
  const own = sourceFor('products', p.id, p.scenario === 'food' ? p.name : detail, false);
  if (own) return own;
  const dish = DISH_KEYS[p.id];
  if (!dish) return undefined;
  return sourceFor('dishes', dish, `${DISH_ALT[dish] ?? p.name} (illustrative)`, true);
}

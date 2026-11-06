import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { catalog } from '../catalog';
import { IMAGE_FILES } from '../imageFiles.generated';
import { DISH_ALT, DISH_CREDITS, DISH_KEYS, imageUrl, merchantLogo, platformLogo, productImage } from '../images';

const exists = (...p: string[]) => fs.existsSync(path.join(process.cwd(), ...p));
const foodProducts = catalog.products.filter((p) => p.scenario === 'food');

describe('dish photo mapping', () => {
  it('every mapped product exists, and every restaurant product has a dish photo key', () => {
    const ids = new Set(catalog.products.map((p) => p.id));
    for (const id of Object.keys(DISH_KEYS)) expect(ids.has(id), `${id} is not a product`).toBe(true);
    for (const p of foodProducts) expect(DISH_KEYS[p.id], `${p.id} has no dish key`).toBeDefined();
  });
  it('every dish key has alt text, and the alt text is never empty', () => {
    for (const key of new Set(Object.values(DISH_KEYS))) expect(DISH_ALT[key]?.length, key).toBeGreaterThan(3);
  });
  it('uses at most 40 dish photo keys', () => {
    expect(new Set(Object.values(DISH_KEYS)).size).toBeLessThanOrEqual(40);
  });
});

describe('supplied image files', () => {
  it('every logo and photo is named after something that really exists (catches typos in file names)', () => {
    const merchants = new Set(catalog.merchants.map((m) => m.id));
    const platforms = new Set<string>(catalog.platforms.map((p) => p.id));
    const products = new Set(catalog.products.map((p) => p.id));
    const dishes = new Set(Object.keys(DISH_ALT));
    for (const id of Object.keys(IMAGE_FILES.merchants)) expect(merchants.has(id), `merchants/${id}`).toBe(true);
    for (const id of Object.keys(IMAGE_FILES.platforms)) expect(platforms.has(id), `platforms/${id}`).toBe(true);
    for (const id of Object.keys(IMAGE_FILES.products)) expect(products.has(id), `products/${id}`).toBe(true);
    for (const id of Object.keys(IMAGE_FILES.dishes)) expect(dishes.has(id), `dishes/${id}`).toBe(true);
    expect(Object.keys(IMAGE_FILES.hero).filter((id) => id !== 'doha-skyline'), 'hero images must be named doha-skyline').toEqual([]);
  });

  it('every listed file exists in public/img (and in both sizes for photos)', () => {
    for (const [kind, items] of Object.entries(IMAGE_FILES)) {
      for (const [id, ext] of Object.entries(items)) {
        if (ext === 'svg') expect(exists('public', 'img', kind, `${id}.svg`), `${kind}/${id}.svg`).toBe(true);
        else for (const size of kind === 'hero' ? [800, 1600] : [160, 480]) expect(exists('public', 'img', kind, `${id}-${size}.webp`), `${kind}/${id}-${size}.webp`).toBe(true);
      }
    }
  });

  it('every dish photo has a credit with an author and a link', () => {
    for (const id of Object.keys(IMAGE_FILES.dishes)) {
      const c = DISH_CREDITS[id];
      expect(c, `credit for ${id}`).toBeDefined();
      expect(c.author.length).toBeGreaterThan(1);
      expect(c.url).toMatch(/^https:\/\/(unsplash|www\.pexels)\.com\//);
    }
  });

  it('only files that really exist are ever requested', () => {
    for (const m of catalog.merchants) {
      const logo = merchantLogo(m);
      if (logo) expect(exists('public', logo.src.replace(/^\//, ''))).toBe(true);
    }
    for (const pl of catalog.platforms) {
      const logo = platformLogo(pl.id, pl.name);
      if (logo) expect(exists('public', logo.src.replace(/^\//, ''))).toBe(true);
    }
    for (const p of catalog.products) {
      const img = productImage(p);
      if (img) expect(exists('public', img.src.replace(/^\//, '')), p.id).toBe(true);
    }
  });

  it('a missing image gives nothing to request (so the fallback tile shows) (rejection case)', () => {
    expect(imageUrl('merchants', 'no-such-merchant')).toBeUndefined();
    expect(imageUrl('products', 'no-such-product', 480)).toBeUndefined();
    expect(merchantLogo({ id: 'no-such-merchant', name: 'X' })).toBeUndefined();
    expect(platformLogo('no-such-platform', 'X')).toBeUndefined();
  });

  it('alt text names the thing, and dish photos are labelled illustrative', () => {
    for (const p of catalog.products) {
      const img = productImage(p);
      if (!img) continue;
      expect(img.alt.length).toBeGreaterThan(3);
      if (img.illustrative) expect(img.alt).toContain('(illustrative)');
    }
  });
});

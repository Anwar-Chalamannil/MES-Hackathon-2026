import { describe, expect, it } from 'vitest';
import { catalog } from '../../data/catalog';
import { hasResults, normalise, SEARCH_SUGGESTIONS, search } from '../search';

const names = (r: ReturnType<typeof search>) => r.products.map((p) => p.name);

describe('search over the real catalogue', () => {
  it('finds a dish by name', () => {
    expect(names(search('chickenjoy')).some((n) => /chickenjoy/i.test(n))).toBe(true);
  });
  it('finds a product by brand', () => {
    const r = search('almarai');
    expect(r.products.length).toBeGreaterThan(0);
    expect(r.products.every((p) => /almarai/i.test(`${p.name} ${p.brand} ${p.description}`))).toBe(true);
  });
  it('finds a product by size', () => {
    expect(names(search('340g')).some((n) => /cream/i.test(n))).toBe(true);
  });
  it('finds a product by variant', () => {
    const withVariant = catalog.products.find((p) => p.variant);
    expect(withVariant).toBeDefined();
    expect(search(withVariant!.variant!).products.map((p) => p.id)).toContain(withVariant!.id);
  });
  it('finds a product by words in its description', () => {
    const p = catalog.products.find((x) => x.description.split(' ').length > 3)!;
    const word = p.description.split(' ').find((w) => w.length > 5)!;
    expect(search(word).products.map((x) => x.id)).toContain(p.id);
  });
  it('requires every word to match, so a narrower query returns fewer results', () => {
    const wide = search('cerave').products.length;
    const narrow = search('cerave cream').products;
    expect(narrow.length).toBeGreaterThan(0);
    expect(narrow.length).toBeLessThan(wide);
  });
  it('finds a restaurant by name or cuisine', () => {
    expect(search('jollibee').restaurants.map((m) => m.id)).toContain('jollibee');
    expect(search('pizza').restaurants.map((m) => m.id)).toContain('pizza-hut');
  });
  it('an app name finds the app and the restaurants on it', () => {
    const r = search('Talabat');
    expect(r.apps.map((a) => a.platform.id)).toEqual(['talabat']);
    expect(r.restaurants.map((m) => m.id)).toEqual(expect.arrayContaining(['jollibee', 'shake-shack']));
  });
  it('ignores case and extra spaces', () => {
    expect(search('  CERAVE   Cream ').products.map((p) => p.id)).toEqual(search('cerave cream').products.map((p) => p.id));
    expect(normalise('  A   b ')).toBe('a b');
  });
  it('an empty or blank query returns nothing (rejection case)', () => {
    expect(hasResults(search(''))).toBe(false);
    expect(hasResults(search('   '))).toBe(false);
  });
  it('a query with no match returns nothing (rejection case)', () => {
    expect(hasResults(search('zzzxqw'))).toBe(false);
  });
  it('every suggestion finds something', () => {
    for (const s of SEARCH_SUGGESTIONS) expect(hasResults(search(s)), s).toBe(true);
  });
});

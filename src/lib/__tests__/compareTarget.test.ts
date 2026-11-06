import { describe, expect, it } from 'vitest';
import type { Basket, Scenario } from '../../engine/types';
import { compareTarget } from '../compareTarget';

const basket = (scenario: Scenario, n: number): Basket => ({
  scenario,
  lines: Array.from({ length: n }, (_, i) => ({ productId: `p${i}`, qty: 1 })),
});
const baskets = (f: number, g: number, p: number) => ({ food: basket('food', f), grocery: basket('grocery', g), pharmacy: basket('pharmacy', p) });

describe('compareTarget', () => {
  it('opens the hub when every basket is empty (rejection case)', () => {
    expect(compareTarget(baskets(0, 0, 0), 'food')).toBe('/compare');
  });
  it('opens the active basket when it has items', () => {
    expect(compareTarget(baskets(1, 2, 0), 'grocery')).toBe('/compare/grocery');
  });
  it('falls back to the first basket with items when the active one is empty', () => {
    expect(compareTarget(baskets(0, 0, 3), 'food')).toBe('/compare/pharmacy');
    expect(compareTarget(baskets(0, 2, 3), 'pharmacy')).toBe('/compare/pharmacy');
    expect(compareTarget(baskets(0, 2, 3), 'food')).toBe('/compare/grocery');
  });
});

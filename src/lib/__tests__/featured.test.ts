import { describe, expect, it } from 'vitest';
import { catalog } from '../../data/catalog';
import { DEFAULT_SAVED_IDS } from '../../data/defaults';
import { DEMO_SCENARIOS } from '../../data/demoScenarios';
import { compareBasket } from '../../engine/compare';
import { featuredSavings } from '../featured';

const ANCHOR = Date.UTC(2026, 10, 5, 9, 0);

describe('featured savings', () => {
  const list = featuredSavings(ANCHOR);

  it('has one card for each category', () => {
    expect(list.map((f) => f.scenario)).toEqual(['food', 'grocery', 'pharmacy']);
  });

  it('values equal a fresh engine run on the same demo step', () => {
    for (const f of list) {
      const step = DEMO_SCENARIOS.flatMap((s) => s.steps).find((s) => s.id === f.stepId)!;
      const result = compareBasket({
        catalog, basket: step.basket,
        wallet: { savedIds: [...DEFAULT_SAVED_IDS, ...step.addSaved], custom: [] },
        profile: step.profile, nowMs: ANCHOR, anchorMs: ANCHOR, mode: 'price',
      });
      const totals = result.ranked.map((o) => o.totalDh);
      expect(f.winner.totalDh).toBe(Math.min(...totals));
      expect(f.highest.totalDh).toBe(Math.max(...totals));
      expect(f.saveDh).toBe(Math.max(...totals) - Math.min(...totals));
    }
  });

  it('matches the demo spec: winner totals QAR 58.00, 148.25 and 97.20', () => {
    expect(list.map((f) => f.winner.totalDh)).toEqual([5800, 14825, 9720]);
    expect(list.map((f) => f.winner.platformId)).toEqual(['keeta', 'carrefour', 'kulud']);
  });

  it('each saving is the gap to the most expensive complete app, and is positive', () => {
    expect(list.map((f) => f.saveDh)).toEqual([500, 1475, 4780]);
    for (const f of list) expect(f.saveDh).toBeGreaterThan(0);
  });

  it('counts the items in the basket', () => {
    expect(list[0].itemCount).toBe(4); // 2 Chickenjoy + spaghetti + Coke
  });
});

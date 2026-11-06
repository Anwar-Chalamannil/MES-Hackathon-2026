import { catalog } from '../data/catalog';
import { DEFAULT_SAVED_IDS } from '../data/defaults';
import { DEMO_SCENARIOS, type DemoStep } from '../data/demoScenarios';
import { compareBasket } from '../engine/compare';
import type { Basket, Dh, PricedOffer, Scenario } from '../engine/types';

export interface FeaturedSaving {
  /** DemoStep id this card is built from. */
  stepId: string;
  scenario: Scenario;
  title: string;
  basket: Basket;
  winner: PricedOffer;
  /** Most expensive complete offer, for the comparison. */
  highest: PricedOffer;
  /** Highest total minus lowest total, straight from the engine. Never hard-coded. */
  saveDh: Dh;
  itemCount: number;
}

/** The step of each hero demo that is shown on Home. */
const FEATURED_STEPS: { scenarioId: string; stepId: string; title: string }[] = [
  { scenarioId: 'hero-a-jollibee', stepId: 'A1', title: 'Jollibee Chickenjoy meal' },
  { scenarioId: 'hero-b-grocery', stepId: 'B1', title: 'Weekly groceries' },
  { scenarioId: 'hero-c-pharmacy', stepId: 'C1', title: 'Skincare essentials' },
];

/** Compare a demo step at its own time (the anchor), with the default wallet and the step's profile. */
export function featuredFromStep(step: DemoStep, title: string, anchorMs: number): FeaturedSaving | undefined {
  const result = compareBasket({
    catalog,
    basket: step.basket,
    wallet: { savedIds: [...DEFAULT_SAVED_IDS, ...step.addSaved], custom: [] },
    profile: step.profile,
    nowMs: anchorMs,
    anchorMs,
    mode: 'price',
  });
  const byTotal = [...result.ranked].sort((a, b) => a.totalDh - b.totalDh);
  const winner = byTotal[0];
  const highest = byTotal[byTotal.length - 1];
  if (!winner || !highest) return undefined;
  return {
    stepId: step.id,
    scenario: step.basket.scenario,
    title,
    basket: step.basket,
    winner,
    highest,
    saveDh: highest.totalDh - winner.totalDh,
    itemCount: step.basket.lines.reduce((n, l) => n + l.qty, 0),
  };
}

/** Three featured baskets, one per category, computed by the real engine. */
export function featuredSavings(anchorMs: number): FeaturedSaving[] {
  return FEATURED_STEPS.flatMap(({ scenarioId, stepId, title }) => {
    const step = DEMO_SCENARIOS.find((s) => s.id === scenarioId)?.steps.find((s) => s.id === stepId);
    const item = step && featuredFromStep(step, title, anchorMs);
    return item ? [item] : [];
  });
}

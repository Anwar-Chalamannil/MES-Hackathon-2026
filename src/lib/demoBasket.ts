import { DEMO_SCENARIOS } from '../data/demoScenarios';
import type { Basket, Scenario } from '../engine/types';
import { useAppStore } from '../store/useAppStore';

/** The Hero A basket (2 Chickenjoy 2pc, Jolly Spaghetti, Coke): Keeta wins at QAR 58.00 on a default profile. */
export function heroBasket(): Basket {
  const step = DEMO_SCENARIOS.find((s) => s.id === 'hero-a-jollibee')?.steps.find((s) => s.id === 'A1');
  if (!step) throw new Error('Hero A step A1 is missing from demoScenarios');
  return step.basket;
}

/** Would loading this basket throw away a different restaurant's items? The UI asks first when true. */
export function wouldReplaceFood(incoming: Basket): boolean {
  if (incoming.scenario !== 'food') return false;
  const current = useAppStore.getState().baskets.food;
  return current.lines.length > 0 && current.merchantId !== incoming.merchantId;
}

/** Replaces the basket of that category with a copy of the given basket and makes it the active one. */
export function loadBasket(basket: Basket): Scenario {
  const { startBasket, addItem } = useAppStore.getState();
  startBasket(basket.scenario, basket.merchantId);
  for (const line of basket.lines) {
    for (let i = 0; i < line.qty; i++) addItem(basket.scenario, line.productId, basket.merchantId);
  }
  return basket.scenario;
}

/** "Try a demo basket": loads Hero A. */
export const loadDemoBasket = (): Scenario => loadBasket(heroBasket());

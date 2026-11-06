import type { Basket, Scenario } from '../engine/types';

const ORDER: Scenario[] = ['food', 'grocery', 'pharmacy'];

/**
 * Where "Compare now" goes: the basket you last used if it has items, else the first basket that has items,
 * else the Compare hub (which explains and offers to start shopping).
 */
export function compareTarget(baskets: Record<Scenario, Basket>, active: Scenario): string {
  const hasItems = (s: Scenario) => baskets[s].lines.length > 0;
  if (hasItems(active)) return `/compare/${active}`;
  const first = ORDER.find(hasItems);
  return first ? `/compare/${first}` : '/compare';
}

import { useMemo } from 'react';
import { catalog } from '../data/catalog';
import { compareBasket } from '../engine/compare';
import type { Comparison, Scenario } from '../engine/types';
import { useAppStore } from '../store/useAppStore';
import { useNow } from './useNow';

/** Live comparison for one scenario. Recomputes whenever the basket, wallet, profile or mode changes. */
export function useComparison(scenario: Scenario): Comparison {
  const basket = useAppStore((s) => s.baskets[scenario]);
  const wallet = useAppStore((s) => s.wallet);
  const profile = useAppStore((s) => s.profile);
  const mode = useAppStore((s) => s.sortMode);
  const anchorMs = useAppStore((s) => s.demoAnchor);
  const nowMs = useNow();
  return useMemo(
    () => compareBasket({ catalog, basket, wallet, profile, nowMs, anchorMs, mode }),
    [basket, wallet, profile, mode, anchorMs, nowMs],
  );
}

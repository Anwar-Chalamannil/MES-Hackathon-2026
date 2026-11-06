import { useMemo } from 'react';
import { catalog } from '../data/catalog';
import { cardPresetById, type CardPreset } from '../data/cardPresets';
import type { Scenario } from '../engine/types';
import { compareWithCards, type CardComparison } from '../lib/cardComparison';
import { toUiSortMode } from '../lib/sortModes';
import { useAppStore } from '../store/useAppStore';
import { useNow } from './useNow';

/**
 * Live comparison for one scenario. Recomputes whenever the basket, wallet, profile, cards or mode changes.
 * With no saved cards the result is exactly the engine's. With cards, every card is tried and the best is kept.
 */
export function useComparison(scenario: Scenario): CardComparison {
  const basket = useAppStore((s) => s.baskets[scenario]);
  const wallet = useAppStore((s) => s.wallet);
  const profile = useAppStore((s) => s.profile);
  const savedCards = useAppStore((s) => s.cards);
  const mode = toUiSortMode(useAppStore((s) => s.sortMode));
  const anchorMs = useAppStore((s) => s.demoAnchor);
  const nowMs = useNow();
  return useMemo(() => {
    const presets = savedCards.map((c) => cardPresetById.get(c.presetId)).filter((p): p is CardPreset => !!p);
    return compareWithCards({ catalog, basket, wallet, profile, nowMs, anchorMs, mode }, presets);
  }, [basket, wallet, profile, savedCards, mode, anchorMs, nowMs]);
}

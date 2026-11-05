import { useCallback } from 'react';
import { catalog } from '../data/catalog';
import type { Promotion } from '../engine/types';
import { promoStatus, type PromoStatus } from '../lib/promoStatus';
import { useAppStore } from '../store/useAppStore';
import { useComparison } from './useComparison';
import { useNow } from './useNow';

/** Everything a voucher screen needs to say how each voucher relates to the basket you are shopping for. */
export function useVoucherStatus() {
  const scenario = useAppStore((s) => s.activeScenario);
  const basket = useAppStore((s) => s.baskets[scenario]);
  const profile = useAppStore((s) => s.profile);
  const anchorMs = useAppStore((s) => s.demoAnchor);
  const nowMs = useNow();
  const comparison = useComparison(scenario);

  const statusFor = useCallback(
    (promo: Promotion, saved: boolean): PromoStatus =>
      promoStatus(promo, { comparison, basket, catalog, profile, nowMs, anchorMs, saved }),
    [comparison, basket, profile, nowMs, anchorMs],
  );

  return { statusFor, comparison, scenario, basket, nowMs, anchorMs };
}

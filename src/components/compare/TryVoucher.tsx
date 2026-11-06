import { useMemo } from 'react';
import { Check, Plus } from 'lucide-react';
import { catalog } from '../../data/catalog';
import { DEFAULT_SAVED_IDS } from '../../data/defaults';
import { resolveExpiry } from '../../engine/time';
import type { Scenario } from '../../engine/types';
import { useNow } from '../../hooks/useNow';
import { useAppStore } from '../../store/useAppStore';
import Button from '../ui/Button';
import PlatformChip from '../ui/PlatformChip';
import VoucherBenefit from '../vouchers/VoucherBenefit';

/**
 * Seed vouchers that are not in the wallet by default and fit this scenario. Adding one saves it to the
 * wallet, and the comparison updates straight away. Added vouchers stay listed so they can be removed.
 */
export default function TryVoucher({ scenario }: { scenario: Scenario }) {
  const savedIds = useAppStore((s) => s.wallet.savedIds);
  const anchor = useAppStore((s) => s.demoAnchor);
  const saveSeed = useAppStore((s) => s.saveSeed);
  const unsaveSeed = useAppStore((s) => s.unsaveSeed);
  const now = useNow();

  const options = useMemo(() => {
    const platformIds = new Set(catalog.listings.filter((l) => l.scenario === scenario).map((l) => l.platformId));
    return catalog.promotions.filter(
      (p) =>
        (p.kind === 'code' || p.kind === 'bank') &&
        !DEFAULT_SAVED_IDS.includes(p.id) &&
        platformIds.has(p.platformId) &&
        (!p.conditions.scenarios || p.conditions.scenarios.includes(scenario)) &&
        resolveExpiry(p.conditions.expiry, anchor) > now,
    );
  }, [scenario, anchor, now]);

  if (options.length === 0) return null;
  return (
    <section aria-labelledby="try-title" className="space-y-2">
      <h2 id="try-title" className="text-[15px] font-extrabold">Try a voucher</h2>
      <ul className="space-y-2">
        {options.map((p) => {
          const added = savedIds.includes(p.id);
          const name = p.code ?? p.name;
          return (
            <li key={p.id} className="flex items-center gap-3 rounded-card border border-line bg-surface p-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <PlatformChip platformId={p.platformId} />
                </div>
                <VoucherBenefit promo={p} size="md" />
              </div>
              {added ? (
                <Button variant="secondary" aria-label={`Added ${name}. Press to remove`} onClick={() => unsaveSeed(p.id)}>
                  <Check size={16} aria-hidden="true" /> Added
                </Button>
              ) : (
                <Button aria-label={`Add ${name}`} onClick={() => saveSeed(p.id)}>
                  <Plus size={16} aria-hidden="true" /> Add
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-[12px] text-muted">Demo vouchers only. They are not real offers.</p>
    </section>
  );
}

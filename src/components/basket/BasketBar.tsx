import { useState } from 'react';
import { ShoppingBasket } from 'lucide-react';
import { catalog } from '../../data/catalog';
import { offersFor } from '../../engine/offers';
import type { Scenario } from '../../engine/types';
import { useAppStore } from '../../store/useAppStore';
import { ButtonLink } from '../ui/Button';
import BasketSheet from './BasketSheet';

/** Sticky bar above the bottom nav (phones and tablets). Desktop shows the basket in a side panel instead. */
export default function BasketBar({ scenario }: { scenario: Scenario }) {
  const basket = useAppStore((s) => s.baskets[scenario]);
  const [open, setOpen] = useState(false);
  const count = basket.lines.reduce((n, l) => n + l.qty, 0);
  const apps = offersFor(catalog, basket).length;
  if (count === 0) return null;

  return (
    <>
      <div
        className="fixed inset-x-0 z-20 px-4 lg:hidden"
        style={{ bottom: 'calc(64px + env(safe-area-inset-bottom) + 8px)' }}
      >
        <div className="mx-auto flex max-w-xl items-center gap-2 rounded-card border border-line bg-surface p-2 shadow-lg">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-btn px-2 text-left active:bg-brand-soft"
            aria-label={`Edit basket, ${count} ${count === 1 ? 'item' : 'items'}`}
          >
            <ShoppingBasket size={22} className="shrink-0 text-brand" aria-hidden="true" />
            <span className="truncate text-[15px] font-bold">{count} {count === 1 ? 'item' : 'items'}</span>
          </button>
          <ButtonLink to={`/compare/${scenario}`}>
            Compare {apps} {apps === 1 ? 'app' : 'apps'}
          </ButtonLink>
        </div>
      </div>
      <BasketSheet scenario={scenario} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

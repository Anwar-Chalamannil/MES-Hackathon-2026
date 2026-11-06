import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Pencil } from 'lucide-react';
import { merchantById } from '../data/lookup';
import BasketSheet from '../components/basket/BasketSheet';
import BasketSummary from '../components/compare/BasketSummary';
import IncompleteList from '../components/compare/IncompleteList';
import ModeSwitch from '../components/compare/ModeSwitch';
import OfferCard from '../components/compare/OfferCard';
import ProfileBar from '../components/compare/ProfileBar';
import TryVoucher from '../components/compare/TryVoucher';
import WinnerCard from '../components/compare/WinnerCard';
import Button, { ButtonLink } from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import type { Scenario } from '../engine/types';
import { useComparison } from '../hooks/useComparison';
import { useAppStore } from '../store/useAppStore';
import NotFound from './NotFound';

const SCENARIOS: Record<Scenario, { title: string; shopPath: string }> = {
  food: { title: 'Food delivery', shopPath: '/food' },
  grocery: { title: 'Groceries', shopPath: '/grocery' },
  pharmacy: { title: 'Pharmacy & care', shopPath: '/pharmacy' },
};

export default function Compare() {
  const { scenario } = useParams();
  if (scenario !== 'food' && scenario !== 'grocery' && scenario !== 'pharmacy') return <NotFound />;
  return <CompareScenario scenario={scenario} />;
}

function CompareScenario({ scenario }: { scenario: Scenario }) {
  const comparison = useComparison(scenario);
  const basket = useAppStore((s) => s.baskets[scenario]);
  const mode = useAppStore((s) => s.sortMode);
  const setActiveScenario = useAppStore((s) => s.setActiveScenario);
  const [editing, setEditing] = useState(false);
  useEffect(() => setActiveScenario(scenario), [scenario, setActiveScenario]);

  const { title, shopPath } = SCENARIOS[scenario];
  const count = basket.lines.reduce((n, l) => n + l.qty, 0);
  const merchant = basket.merchantId ? merchantById.get(basket.merchantId) : undefined;
  const cheapestDh = comparison.ranked.length ? Math.min(...comparison.ranked.map((o) => o.totalDh)) : 0;
  const winner = comparison.winnerId ? comparison.ranked.find((o) => o.listingId === comparison.winnerId) : undefined;
  const rest = comparison.ranked.filter((o) => o.listingId !== comparison.winnerId);

  if (count === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-[24px] font-extrabold tracking-tight">Compare</h1>
        <EmptyState title="Your basket is empty" text={`Add items from ${title.toLowerCase()} to see what each app charges.`}>
          <ButtonLink to={shopPath}>Start shopping</ButtonLink>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="pb-8 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
      <div className="min-w-0 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[24px] font-extrabold tracking-tight">Compare</h1>
          <p className="truncate text-[14px] text-muted">
            {title}, {count} {count === 1 ? 'item' : 'items'}{merchant ? `, ${merchant.name}` : ''}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)} className="lg:hidden">
          <Pencil size={16} aria-hidden="true" /> Edit basket
        </Button>
      </div>

      <div className="sticky top-16 z-20 -mx-4 bg-bg px-4 py-2">
        <ModeSwitch />
      </div>

      <div className="lg:hidden"><ProfileBar scenario={scenario} /></div>

      {comparison.singlePlatform && <p className="rounded-card bg-brand-soft px-4 py-3 text-[14px] font-semibold text-brand">{comparison.explanation}</p>}
      {!comparison.singlePlatform && comparison.ranked.length === 0 && (
        <p className="rounded-card bg-brand-soft px-4 py-3 text-[14px] font-semibold text-brand">{comparison.explanation}</p>
      )}

      {winner && <WinnerCard offer={winner} cheapestDh={cheapestDh} mode={mode} explanation={comparison.explanation} />}

      {(comparison.singlePlatform ? comparison.ranked : rest).length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {(comparison.singlePlatform ? comparison.ranked : rest).map((o) => (
            <li key={o.listingId} className="min-w-0"><OfferCard offer={o} cheapestDh={cheapestDh} mode={mode} /></li>
          ))}
        </ul>
      )}

      <IncompleteList offers={comparison.incomplete} />
      <div className="lg:hidden"><TryVoucher scenario={scenario} /></div>
      <p className="text-[12px] text-muted">
        All prices, fees, delivery times and vouchers are simulated examples. Conditions marked "check in the app" cannot be verified here.
      </p>

      </div>

      <aside aria-label="Basket and payment profile" className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <BasketSummary basket={basket} onEdit={() => setEditing(true)} />
          <ProfileBar scenario={scenario} />
          <TryVoucher scenario={scenario} />
        </div>
      </aside>

      <BasketSheet scenario={scenario} open={editing} onClose={() => setEditing(false)} showCompare={false} />
    </div>
  );
}

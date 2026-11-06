import { Pill, ShoppingBasket, Utensils } from 'lucide-react';
import { merchantById } from '../data/lookup';
import type { Scenario } from '../engine/types';
import { ButtonLink } from '../components/ui/Button';
import { useAppStore } from '../store/useAppStore';

const CARDS: { scenario: Scenario; title: string; icon: typeof Utensils; shop: string; blurb: string }[] = [
  { scenario: 'food', title: 'Restaurants', icon: Utensils, shop: '/food', blurb: 'One restaurant at a time, compared across the delivery apps.' },
  { scenario: 'grocery', title: 'Groceries', icon: ShoppingBasket, shop: '/grocery', blurb: 'Stores and delivery apps, same products and quantities.' },
  { scenario: 'pharmacy', title: 'Pharmacy & care', icon: Pill, shop: '/pharmacy', blurb: 'Skincare and personal care. No medicines.' },
];

/** All three baskets in one place, so Compare never opens an empty basket by surprise. */
export default function CompareHub() {
  const baskets = useAppStore((s) => s.baskets);
  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-tight">Compare</h1>
        <p className="mt-1 text-[15px] text-muted">Pick a basket to see what each app charges after fees and vouchers.</p>
      </div>
      <ul className="grid gap-3 md:grid-cols-3">
        {CARDS.map(({ scenario, title, icon: Icon, shop, blurb }) => {
          const basket = baskets[scenario];
          const count = basket.lines.reduce((n, l) => n + l.qty, 0);
          const merchant = basket.merchantId ? merchantById.get(basket.merchantId)?.name : undefined;
          return (
            <li key={scenario} data-testid="hub-basket" data-scenario={scenario} className="flex min-w-0 flex-col rounded-card border border-line bg-surface p-4 shadow-card">
              <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full bg-blue-50 text-brand">
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <h2 className="mt-3 text-[18px] font-extrabold">{title}</h2>
              <p className="mt-1 text-[14px] text-muted">{blurb}</p>
              <p className="mt-3 text-[15px] font-semibold">
                {count === 0 ? 'Basket is empty' : `${count} ${count === 1 ? 'item' : 'items'}${merchant ? ` from ${merchant}` : ''}`}
              </p>
              <div className="mt-auto pt-4">
                {count > 0 ? (
                  <ButtonLink to={`/compare/${scenario}`} className="w-full" aria-label={`Compare ${title}`}>Compare</ButtonLink>
                ) : (
                  <ButtonLink to={shop} variant="secondary" className="w-full" aria-label={`Start shopping ${title}`}>Start shopping</ButtonLink>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

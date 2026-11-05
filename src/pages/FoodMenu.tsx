import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { catalog } from '../data/catalog';
import { listingsOfMerchant, merchantById } from '../data/lookup';
import BasketBar from '../components/basket/BasketBar';
import BasketContent from '../components/basket/BasketContent';
import ReplaceBasketDialog from '../components/basket/ReplaceBasketDialog';
import ProductBrowse from '../components/catalog/ProductBrowse';
import EmptyState from '../components/ui/EmptyState';
import { ButtonLink } from '../components/ui/Button';
import { PlatformDots } from '../components/ui/PlatformChip';
import { platformName } from '../data/lookup';
import { useAppStore } from '../store/useAppStore';

export default function FoodMenu() {
  const { merchantId = '' } = useParams();
  const merchant = merchantById.get(merchantId);
  const basket = useAppStore((s) => s.baskets.food);
  const addItem = useAppStore((s) => s.addItem);
  const setQty = useAppStore((s) => s.setQty);
  const startBasket = useAppStore((s) => s.startBasket);
  const setActiveScenario = useAppStore((s) => s.setActiveScenario);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => setActiveScenario('food'), [setActiveScenario]);

  const listings = useMemo(() => listingsOfMerchant(merchantId), [merchantId]);
  const items = useMemo(() => catalog.products.filter((p) => p.merchantId === merchantId), [merchantId]);

  if (!merchant || merchant.kind !== 'restaurant') {
    return (
      <EmptyState title="Restaurant not found" text="It may have been removed from the sample data.">
        <ButtonLink to="/food">See all restaurants</ButtonLink>
      </EmptyState>
    );
  }

  const platformIds = [...new Set(listings.map((l) => l.platformId))];
  const otherMerchant = basket.lines.length > 0 && basket.merchantId && basket.merchantId !== merchantId ? merchantById.get(basket.merchantId) : undefined;

  const handleAdd = (productId: string) => {
    if (otherMerchant) setPending(productId);
    else addItem('food', productId, merchantId);
  };
  const confirmReplace = () => {
    if (pending) {
      startBasket('food', merchantId);
      addItem('food', pending, merchantId);
    }
    setPending(null);
  };

  return (
    <div className="pb-28 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:pb-8">
      <div className="min-w-0 space-y-4">
        <Link to="/food" className="inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-brand">
          <ChevronLeft size={18} aria-hidden="true" /> Restaurants
        </Link>
        <header>
          <h1 className="text-[26px] leading-tight font-extrabold tracking-tight">{merchant.name}</h1>
          <p className="text-[15px] text-muted">{merchant.cuisine}</p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-muted">
            <PlatformDots platformIds={platformIds} />
            Simulated availability: {platformIds.map(platformName).join(', ')}
          </p>
        </header>

        <ProductBrowse
          products={items}
          qtyOf={(id) => (basket.merchantId === merchantId ? (basket.lines.find((l) => l.productId === id)?.qty ?? 0) : 0)}
          onAdd={handleAdd}
          onQty={(id, q) => setQty('food', id, q)}
          availability={(p) => ({ on: listings.filter((l) => l.id in p.prices).length, total: listings.length })}
          searchLabel={`Search the ${merchant.name} menu`}
          searchPlaceholder="Search the menu"
        />
        <p className="text-[12px] text-muted">
          Prices shown are the lowest across apps. Each app prices, charges fees and delivers differently, and that is what we compare.
        </p>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-3 rounded-card border border-line bg-surface p-4">
          <h2 className="text-[17px] font-extrabold">Your basket</h2>
          <BasketContent scenario="food" />
        </div>
      </aside>

      <BasketBar scenario="food" />
      <ReplaceBasketDialog
        open={pending !== null}
        fromName={otherMerchant?.name ?? ''}
        toName={merchant.name}
        onConfirm={confirmReplace}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

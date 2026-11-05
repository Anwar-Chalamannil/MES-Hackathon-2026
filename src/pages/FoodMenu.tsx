import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { catalog } from '../data/catalog';
import { listingsOfMerchant, merchantById } from '../data/lookup';
import BasketBar from '../components/basket/BasketBar';
import BasketContent from '../components/basket/BasketContent';
import ReplaceBasketDialog from '../components/basket/ReplaceBasketDialog';
import CategoryChips from '../components/catalog/CategoryChips';
import ProductRow from '../components/catalog/ProductRow';
import EmptyState from '../components/ui/EmptyState';
import { ButtonLink } from '../components/ui/Button';
import { PlatformDots } from '../components/ui/PlatformChip';
import SearchInput from '../components/ui/SearchInput';
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
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => setActiveScenario('food'), [setActiveScenario]);

  const listings = useMemo(() => listingsOfMerchant(merchantId), [merchantId]);
  const items = useMemo(() => catalog.products.filter((p) => p.merchantId === merchantId), [merchantId]);
  const categories = useMemo(() => [...new Set(items.map((p) => p.category))], [items]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (p) => (category === null || p.category === category) && (q === '' || `${p.name} ${p.description}`.toLowerCase().includes(q)),
    );
  }, [items, category, query]);

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

        <SearchInput value={query} onChange={setQuery} label={`Search the ${merchant.name} menu`} placeholder="Search the menu" />
        <CategoryChips categories={categories} selected={category} onSelect={setCategory} />

        {visible.length === 0 ? (
          <EmptyState title="No items found" text="Try another search or category." />
        ) : (
          <ul className="space-y-2">
            {visible.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                qty={basket.merchantId === merchantId ? (basket.lines.find((l) => l.productId === p.id)?.qty ?? 0) : 0}
                onAdd={() => handleAdd(p.id)}
                onQty={(q) => setQty('food', p.id, q)}
                availableOn={listings.filter((l) => l.id in p.prices).length}
                totalApps={listings.length}
              />
            ))}
          </ul>
        )}
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

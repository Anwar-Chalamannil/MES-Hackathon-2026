import { useEffect, useMemo, useState } from 'react';
import { catalog } from '../data/catalog';
import MerchantCard from '../components/catalog/MerchantCard';
import ScenarioTabs from '../components/catalog/ScenarioTabs';
import EmptyState from '../components/ui/EmptyState';
import SearchInput from '../components/ui/SearchInput';
import { useAppStore } from '../store/useAppStore';
import BasketBar from '../components/basket/BasketBar';

export default function Food() {
  const [query, setQuery] = useState('');
  const setActiveScenario = useAppStore((s) => s.setActiveScenario);
  useEffect(() => setActiveScenario('food'), [setActiveScenario]);

  const restaurants = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.merchants.filter(
      (m) => m.kind === 'restaurant' && (q === '' || `${m.name} ${m.cuisine ?? ''}`.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="space-y-4 pb-20">
      <ScenarioTabs />
      <div>
        <h1 className="text-[24px] font-extrabold tracking-tight">Food delivery</h1>
        <p className="mt-1 text-[15px] text-muted">Pick a restaurant, add your meal, then compare the apps that deliver it.</p>
      </div>
      <SearchInput value={query} onChange={setQuery} label="Search restaurants" placeholder="Search restaurants or cuisine" />
      {restaurants.length === 0 ? (
        <EmptyState title="No restaurants found" text={`Nothing matches "${query}". Try a different name or cuisine.`} />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((m) => (
            <li key={m.id}><MerchantCard merchant={m} /></li>
          ))}
        </ul>
      )}
      <p className="text-[12px] text-muted">Restaurant availability on each app is simulated for this prototype.</p>
      <BasketBar scenario="food" />
    </div>
  );
}

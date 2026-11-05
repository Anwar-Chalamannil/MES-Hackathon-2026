import { useEffect, useMemo } from 'react';
import { catalog } from '../data/catalog';
import BasketBar from '../components/basket/BasketBar';
import BasketContent from '../components/basket/BasketContent';
import ProductBrowse from '../components/catalog/ProductBrowse';
import ScenarioTabs from '../components/catalog/ScenarioTabs';
import { PlatformDots } from '../components/ui/PlatformChip';
import { platformName } from '../data/lookup';
import { useAppStore } from '../store/useAppStore';

const COPY = {
  grocery: {
    title: 'Groceries',
    intro: 'Pick the exact same branded products, then compare which store or app gives the lowest total.',
    note: 'Prices differ by store. Each store also has its own delivery fee and free-delivery rules.',
    search: 'Search groceries',
    placeholder: 'Search by product or brand',
  },
  pharmacy: {
    title: 'Pharmacy & personal care',
    intro: 'Skincare, personal care and baby care from Wellcare and Kulud, and the apps that deliver them.',
    note: 'Skincare, personal care and baby care only. No prescription or other medicines are included.',
    search: 'Search pharmacy and personal care',
    placeholder: 'Search by product or brand',
  },
} as const;

/** Groceries and pharmacy: the same shop screen, driven by the scenario. */
export default function ScenarioShop({ scenario }: { scenario: 'grocery' | 'pharmacy' }) {
  const copy = COPY[scenario];
  const basket = useAppStore((s) => s.baskets[scenario]);
  const addItem = useAppStore((s) => s.addItem);
  const setQty = useAppStore((s) => s.setQty);
  const setActiveScenario = useAppStore((s) => s.setActiveScenario);
  useEffect(() => setActiveScenario(scenario), [scenario, setActiveScenario]);

  const products = useMemo(() => catalog.products.filter((p) => p.scenario === scenario), [scenario]);
  const listings = useMemo(() => catalog.listings.filter((l) => l.scenario === scenario), [scenario]);
  const platformIds = [...new Set(listings.map((l) => l.platformId))];

  return (
    <div className="pb-28 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:pb-8">
      <div className="min-w-0 space-y-4">
        <ScenarioTabs />
        <header>
          <h1 className="text-[24px] font-extrabold tracking-tight">{copy.title}</h1>
          <p className="mt-1 text-[15px] text-muted">{copy.intro}</p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-muted">
            <PlatformDots platformIds={platformIds} />
            Simulated stores and apps: {platformIds.map(platformName).join(', ')}
          </p>
        </header>

        <ProductBrowse
          products={products}
          qtyOf={(id) => basket.lines.find((l) => l.productId === id)?.qty ?? 0}
          onAdd={(id) => addItem(scenario, id)}
          onQty={(id, q) => setQty(scenario, id, q)}
          availability={(p) => ({ on: Object.keys(p.prices).length, total: listings.length })}
          searchLabel={copy.search}
          searchPlaceholder={copy.placeholder}
        />
        <p className="text-[12px] text-muted">{copy.note} All prices and availability are simulated.</p>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-3 rounded-card border border-line bg-surface p-4">
          <h2 className="text-[17px] font-extrabold">Your basket</h2>
          <BasketContent scenario={scenario} />
        </div>
      </aside>

      <BasketBar scenario={scenario} />
    </div>
  );
}

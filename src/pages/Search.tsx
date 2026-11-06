import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ChevronRight, Search as SearchIcon } from 'lucide-react';
import { catalog } from '../data/catalog';
import { listingsOfMerchant, merchantById } from '../data/lookup';
import type { Product } from '../engine/types';
import ReplaceBasketDialog from '../components/basket/ReplaceBasketDialog';
import ProductRow from '../components/catalog/ProductRow';
import EmptyState from '../components/ui/EmptyState';
import { PlatformDots } from '../components/ui/PlatformChip';
import { hasResults, search, SEARCH_SUGGESTIONS } from '../lib/search';
import { useAppStore } from '../store/useAppStore';

/** Searches restaurants, products and apps across the whole catalogue. */
export default function Search() {
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get('q') ?? '';
  const [text, setText] = useState(urlQuery);
  const input = useRef<HTMLInputElement>(null);
  const baskets = useAppStore((s) => s.baskets);
  const addItem = useAppStore((s) => s.addItem);
  const setQty = useAppStore((s) => s.setQty);
  const startBasket = useAppStore((s) => s.startBasket);
  const [pending, setPending] = useState<Product | null>(null);

  useEffect(() => setText(urlQuery), [urlQuery]);
  useEffect(() => {
    if (!urlQuery) input.current?.focus({ preventScroll: true });
  }, [urlQuery]);

  const results = useMemo(() => search(urlQuery), [urlQuery]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = text.trim();
    setParams(q ? { q } : {}, { replace: true });
  };

  const qtyOf = (p: Product) => baskets[p.scenario].lines.find((l) => l.productId === p.id)?.qty ?? 0;
  const availability = (p: Product) => {
    const total = p.merchantId ? listingsOfMerchant(p.merchantId).length : catalog.listings.filter((l) => l.scenario === p.scenario).length;
    return { on: Object.keys(p.prices).length, total };
  };
  const otherMerchant = pending && baskets.food.lines.length > 0 && baskets.food.merchantId !== pending.merchantId
    ? merchantById.get(baskets.food.merchantId ?? '')
    : undefined;

  const add = (p: Product) => {
    if (p.scenario === 'food') {
      const b = baskets.food;
      if (b.lines.length > 0 && b.merchantId && b.merchantId !== p.merchantId) {
        setPending(p);
        return;
      }
      addItem('food', p.id, p.merchantId);
    } else {
      addItem(p.scenario, p.id);
    }
  };
  const confirmReplace = () => {
    if (pending) {
      startBasket('food', pending.merchantId);
      addItem('food', pending.id, pending.merchantId);
    }
    setPending(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-8">
      <h1 className="text-[24px] font-extrabold tracking-tight">Search</h1>
      <form role="search" onSubmit={submit} className="relative">
        <label className="block">
          <span className="sr-only">Search restaurants, products and apps</span>
          <SearchIcon size={20} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input
            ref={input}
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Try Chickenjoy, milk, CeraVe or Talabat"
            className="min-h-12 w-full rounded-full border border-control bg-surface pr-4 pl-12 text-[16px] placeholder:text-muted"
          />
        </label>
      </form>

      {!urlQuery ? (
        <section aria-labelledby="suggest">
          <h2 id="suggest" className="mb-2 text-[15px] font-extrabold">Popular searches</h2>
          <ul className="flex flex-wrap gap-2">
            {SEARCH_SUGGESTIONS.map((s) => (
              <li key={s}>
                <Link to={`/search?q=${encodeURIComponent(s)}`} className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-[14px] font-semibold active:bg-blue-50">
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : !hasResults(results) ? (
        <EmptyState title={`No matches for "${urlQuery}"`} text="Check the spelling, or try a dish, brand, size or app name.">
          <div className="flex flex-wrap justify-center gap-2">
            {SEARCH_SUGGESTIONS.slice(0, 3).map((s) => (
              <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-[14px] font-semibold">
                {s}
              </Link>
            ))}
          </div>
        </EmptyState>
      ) : (
        <div className="space-y-6" aria-live="polite">
          {results.apps.length > 0 && (
            <p className="text-[14px] text-muted">
              {results.apps.map((a) => a.platform.name).join(', ')} {results.apps.length === 1 ? 'is' : 'are'} a delivery app in our sample. Showing what it carries.
            </p>
          )}
          {results.restaurants.length > 0 && (
            <section aria-labelledby="res-restaurants">
              <h2 id="res-restaurants" className="mb-2 text-[17px] font-extrabold">Restaurants</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {results.restaurants.map((m) => (
                  <li key={m.id}>
                    <Link to={`/food/${m.id}`} className="flex min-h-16 items-center gap-3 rounded-card border border-line bg-surface p-3 active:bg-blue-50">
                      <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-[18px] font-extrabold text-brand">{m.name.charAt(0)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{m.name}</span>
                        <span className="flex items-center gap-2 text-[13px] text-muted">
                          {m.cuisine}
                          <PlatformDots platformIds={[...new Set(listingsOfMerchant(m.id).map((l) => l.platformId))]} />
                        </span>
                      </span>
                      <ChevronRight size={20} aria-hidden="true" className="text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {results.products.length > 0 && (
            <section aria-labelledby="res-products">
              <h2 id="res-products" className="mb-2 text-[17px] font-extrabold">Products</h2>
              <ul className="space-y-2">
                {results.products.map((p) => {
                  const a = availability(p);
                  const where = p.merchantId ? merchantById.get(p.merchantId)?.name : p.scenario === 'grocery' ? 'Groceries' : 'Pharmacy & care';
                  return (
                    <ProductRow
                      key={p.id}
                      product={{ ...p, description: `${where} · ${p.description}` }}
                      qty={qtyOf(p)}
                      onAdd={() => add(p)}
                      onQty={(q) => setQty(p.scenario, p.id, q)}
                      availableOn={a.on}
                      totalApps={a.total}
                    />
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}

      <ReplaceBasketDialog
        open={pending !== null}
        fromName={otherMerchant?.name ?? ''}
        toName={pending?.merchantId ? (merchantById.get(pending.merchantId)?.name ?? '') : ''}
        onConfirm={confirmReplace}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

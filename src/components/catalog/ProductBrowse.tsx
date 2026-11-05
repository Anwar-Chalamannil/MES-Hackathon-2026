import { useMemo, useState } from 'react';
import type { Product } from '../../engine/types';
import EmptyState from '../ui/EmptyState';
import SearchInput from '../ui/SearchInput';
import CategoryChips from './CategoryChips';
import ProductRow from './ProductRow';

/** Search, category chips and the product list. Shared by restaurant menus, groceries and pharmacy. */
export default function ProductBrowse({
  products, qtyOf, onAdd, onQty, availability, searchLabel, searchPlaceholder,
}: {
  products: Product[];
  qtyOf: (productId: string) => number;
  onAdd: (productId: string) => void;
  onQty: (productId: string, qty: number) => void;
  /** How many apps/stores sell it, out of how many are compared. */
  availability: (product: Product) => { on: number; total: number };
  searchLabel: string;
  searchPlaceholder: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === null || p.category === category) &&
        (q === '' || [p.name, p.brand, p.size, p.variant, p.description].filter(Boolean).join(' ').toLowerCase().includes(q)),
    );
  }, [products, category, query]);

  return (
    <div className="space-y-4">
      <SearchInput value={query} onChange={setQuery} label={searchLabel} placeholder={searchPlaceholder} />
      <CategoryChips categories={categories} selected={category} onSelect={setCategory} />
      {visible.length === 0 ? (
        <EmptyState title="No items found" text="Try another search or category." />
      ) : (
        <ul className="space-y-2">
          {visible.map((p) => {
            const { on, total } = availability(p);
            return (
              <ProductRow
                key={p.id}
                product={p}
                qty={qtyOf(p.id)}
                onAdd={() => onAdd(p.id)}
                onQty={(q) => onQty(p.id, q)}
                availableOn={on}
                totalApps={total}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}

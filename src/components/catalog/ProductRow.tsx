import { Plus } from 'lucide-react';
import type { Product } from '../../engine/types';
import Money from '../ui/Money';
import ProductThumb from '../media/ProductThumb';
import QtyStepper from '../ui/QtyStepper';

/** One selectable product. `availableOn`/`totalApps` explain why a product may be missing on some apps. */
export default function ProductRow({
  product, qty, onAdd, onQty, availableOn, totalApps,
}: {
  product: Product;
  qty: number;
  onAdd: () => void;
  onQty: (qty: number) => void;
  availableOn: number;
  totalApps: number;
}) {
  const from = Math.min(...Object.values(product.prices));
  const detail = [product.brand, product.size, product.variant].filter(Boolean).join(', ');
  return (
    <li className="flex items-center gap-3 rounded-card border border-line bg-surface p-3">
      <ProductThumb product={product} size={72} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[16px] font-bold leading-snug">{product.name}</p>
        <p className="truncate text-[13px] text-muted">{detail || product.description}</p>
        <p className="mt-1 text-[14px]">
          <span className="text-muted">from </span>
          <Money dh={from} />
          {availableOn < totalApps && (
            <span className="ml-2 rounded-full bg-warn/10 px-2 py-0.5 text-[12px] font-semibold text-warn">
              {availableOn} of {totalApps} {product.scenario === 'food' ? 'apps' : 'stores'}
            </span>
          )}
        </p>
      </div>
      {qty > 0 ? (
        <QtyStepper qty={qty} name={product.name} onChange={onQty} />
      ) : (
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Add ${product.name}`}
          className="flex min-h-11 items-center gap-1 rounded-btn bg-brand px-4 text-[15px] font-bold text-white active:bg-blue-800"
        >
          <Plus size={18} aria-hidden="true" /> Add
        </button>
      )}
    </li>
  );
}

import { Minus, Plus } from 'lucide-react';
import { MAX_QTY } from '../../store/useAppStore';

const btn =
  'flex size-11 items-center justify-center rounded-full border border-line bg-surface text-brand active:bg-brand-soft disabled:opacity-40';

/** Quantity control. Decreasing from 1 removes the item (onChange(0)). */
export default function QtyStepper({ qty, name, onChange }: { qty: number; name: string; onChange: (qty: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} aria-label={`Decrease ${name}`} onClick={() => onChange(qty - 1)}>
        <Minus size={18} aria-hidden="true" />
      </button>
      <span className="min-w-6 text-center text-[16px] font-bold tabular-nums" aria-label={`${qty} of ${name}`}>
        {qty}
      </span>
      <button type="button" className={btn} aria-label={`Increase ${name}`} disabled={qty >= MAX_QTY} onClick={() => onChange(qty + 1)}>
        <Plus size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

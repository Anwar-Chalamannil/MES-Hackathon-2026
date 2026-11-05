import { Trash2 } from 'lucide-react';
import { catalog } from '../../data/catalog';
import { merchantById, productById } from '../../data/lookup';
import { offersFor } from '../../engine/offers';
import type { Scenario } from '../../engine/types';
import { useAppStore } from '../../store/useAppStore';
import Button, { ButtonLink } from '../ui/Button';
import QtyStepper from '../ui/QtyStepper';

/** The basket list with quantity editing. Used in the phone sheet and the desktop side panel. */
export default function BasketContent({
  scenario, onNavigate, showCompare = true,
}: {
  scenario: Scenario;
  onNavigate?: () => void;
  showCompare?: boolean;
}) {
  const basket = useAppStore((s) => s.baskets[scenario]);
  const setQty = useAppStore((s) => s.setQty);
  const clearBasket = useAppStore((s) => s.clearBasket);
  const apps = offersFor(catalog, basket).length;
  const merchant = basket.merchantId ? merchantById.get(basket.merchantId) : undefined;

  if (basket.lines.length === 0) {
    return <p className="py-6 text-center text-[15px] text-muted">Your basket is empty. Add items to compare apps.</p>;
  }

  return (
    <div className="space-y-4">
      {merchant && <p className="text-[14px] text-muted">From <strong className="text-ink">{merchant.name}</strong></p>}
      <ul className="space-y-3">
        {basket.lines.map((line) => {
          const product = productById.get(line.productId);
          const name = product?.name ?? line.productId;
          return (
            <li key={line.productId} className="flex items-center justify-between gap-3">
              <span className="min-w-0 text-[15px] font-semibold leading-snug">{name}</span>
              <QtyStepper qty={line.qty} name={name} onChange={(q) => setQty(scenario, line.productId, q)} />
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2 pt-1">
        {showCompare && (
          <ButtonLink to={`/compare/${scenario}`} className="flex-1" onClick={onNavigate}>
            Compare {apps} {apps === 1 ? 'app' : 'apps'}
          </ButtonLink>
        )}
        <Button variant="secondary" onClick={() => clearBasket(scenario)} aria-label="Clear basket">
          <Trash2 size={18} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

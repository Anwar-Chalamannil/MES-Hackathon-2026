import { Link } from 'react-router';
import { Pill, ShoppingBasket, Utensils } from 'lucide-react';
import { catalog } from '../../data/catalog';

const COUNT = {
  food: catalog.merchants.filter((m) => m.kind === 'restaurant').length,
  grocery: catalog.products.filter((p) => p.scenario === 'grocery').length,
  pharmacy: catalog.products.filter((p) => p.scenario === 'pharmacy').length,
};

const TILES = [
  { to: '/food', title: 'Restaurants', sub: `${COUNT.food} restaurants`, icon: Utensils },
  { to: '/grocery', title: 'Groceries', sub: `${COUNT.grocery} products`, icon: ShoppingBasket },
  { to: '/pharmacy', title: 'Pharmacy & care', sub: `${COUNT.pharmacy} products`, icon: Pill },
] as const;

/** The three things Perq compares. Counts come from the real catalogue. */
export default function CategoryTiles() {
  return (
    <nav aria-label="Categories">
      <ul className="grid grid-cols-3 gap-3">
        {TILES.map(({ to, title, sub, icon: Icon }) => (
          <li key={to} className="min-w-0">
            <Link
              to={to}
              className="flex h-full min-h-[112px] flex-col items-center justify-center gap-2 rounded-[18px] border border-line bg-surface px-1.5 py-3 text-center shadow-card active:bg-blue-50"
            >
              <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-pink-50 text-ink">
                <Icon size={24} strokeWidth={1.75} />
              </span>
              <span className="text-[14px] leading-tight font-bold">{title}</span>
              <span className="text-[12px] leading-none text-muted">{sub}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import { Link } from 'react-router';
import { Pill, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { APP_TAGLINE } from '../config';

const TILES = [
  { to: '/food', title: 'Food delivery', text: 'Restaurants on Talabat, Snoonu, Rafeeq, Keeta', icon: UtensilsCrossed },
  { to: '/grocery', title: 'Groceries', text: 'Carrefour, Lulu, Ninja and delivery apps', icon: ShoppingCart },
  { to: '/pharmacy', title: 'Pharmacy & care', text: 'Skincare and personal care, no medicines', icon: Pill },
] as const;

export default function Home() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-[32px] leading-tight font-extrabold tracking-tight">{APP_TAGLINE}</h1>
        <p className="mt-3 text-[17px] text-muted">
          Compare one basket across apps and see what you actually pay after delivery, fees and vouchers.
        </p>
      </section>

      <ul className="grid gap-3 md:grid-cols-3">
        {TILES.map(({ to, title, text, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex min-h-20 items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-sm"
            >
              <Icon className="shrink-0 text-brand" size={28} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-[17px] font-bold">{title}</span>
                <span className="block text-[15px] text-muted">{text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

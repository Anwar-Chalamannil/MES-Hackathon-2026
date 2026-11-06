import { Link, useLocation } from 'react-router';
import { Info, Pill, ShoppingBasket, Timer, Utensils } from 'lucide-react';
import Logo from '../brand/Logo';
import CountBadge from '../ui/CountBadge';
import { useNavItems } from './navItems';

const CATEGORIES = [
  { to: '/food', label: 'Restaurants', icon: Utensils },
  { to: '/grocery', label: 'Groceries', icon: ShoppingBasket },
  { to: '/pharmacy', label: 'Pharmacy & care', icon: Pill },
] as const;

const row = (on: boolean) =>
  `flex min-h-11 items-center gap-3 rounded-btn px-3 text-[15px] font-semibold ${on ? 'bg-blue-50 text-brand' : 'text-ink hover:bg-bg'}`;

/** Desktop navigation (hidden on phones, where the bottom tabs and the ☰ menu do this job). */
export default function Sidebar() {
  const items = useNavItems();
  const { pathname } = useLocation();
  const expiryActive = pathname === '/vouchers/expiry';

  return (
    <aside aria-label="Sidebar" className="fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col gap-6 overflow-y-auto border-r border-line bg-surface px-4 py-5 lg:flex">
      <Link to="/" aria-label="Perq home" className="inline-flex min-h-11 items-center rounded-btn px-1">
        <Logo variant="inline" height={52} />
      </Link>

      <nav aria-label="Main">
        <ul className="space-y-1">
          {items.map(({ to, label, icon: Icon, isActive, badge }) => (
            <li key={label}>
              <Link to={to} aria-current={isActive && !expiryActive ? 'page' : undefined} className={row(isActive && !expiryActive)}>
                <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                <span className="flex-1">{label}</span>
                <CountBadge count={badge} />
              </Link>
            </li>
          ))}
          <li>
            <Link to="/vouchers/expiry" aria-current={expiryActive ? 'page' : undefined} className={row(expiryActive)}>
              <Timer size={22} strokeWidth={1.75} aria-hidden="true" />
              <span className="flex-1">Expiry tracker</span>
            </Link>
          </li>
        </ul>
      </nav>

      <nav aria-label="Shop categories" className="border-t border-line pt-4">
        <p className="px-3 pb-2 text-[12px] font-bold tracking-wide text-muted uppercase">Shop</p>
        <ul className="space-y-1">
          {CATEGORIES.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} aria-current={pathname === to || pathname.startsWith(`${to}/`) ? 'page' : undefined} className={row(pathname === to || pathname.startsWith(`${to}/`))}>
                <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto border-t border-line pt-4">
        <Link to="/about" aria-current={pathname === '/about' ? 'page' : undefined} className={row(pathname === '/about')}>
          <Info size={22} strokeWidth={1.75} aria-hidden="true" />
          About Perq
        </Link>
      </div>
    </aside>
  );
}

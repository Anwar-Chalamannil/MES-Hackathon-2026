import { Link, NavLink } from 'react-router';
import { APP_NAME } from '../../config';
import { NAV_ITEMS } from './navItems';

export default function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-4">
        <Link to="/" className="text-[17px] font-extrabold tracking-tight text-brand">
          {APP_NAME}
        </Link>
        <nav aria-label="Main" className="hidden gap-1 lg:flex">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-btn px-3 py-2 text-[15px] font-semibold ${
                  isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <NavLink to="/about" className="rounded-btn px-3 py-2 text-[15px] font-semibold text-muted hover:text-ink">
            About
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

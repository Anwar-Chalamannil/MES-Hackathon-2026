import { NavLink } from 'react-router';
import { NAV_ITEMS } from './navItems';

export default function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-1 text-[12px] font-semibold ${
                  isActive ? 'text-brand' : 'text-muted'
                }`
              }
            >
              <Icon size={22} aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

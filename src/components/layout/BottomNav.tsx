import { Link } from 'react-router';
import { useNavItems } from './navItems';

export default function BottomNav() {
  const items = useNavItems();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {items.map(({ to, label, icon: Icon, isActive }) => (
          <li key={label}>
            <Link
              to={to}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[12px] font-semibold ${isActive ? 'text-brand' : 'text-muted'}`}
            >
              <Icon size={22} aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

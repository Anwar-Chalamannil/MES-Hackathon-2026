import { Link } from 'react-router';
import CountBadge from '../ui/CountBadge';
import { useNavItems } from './navItems';

export default function BottomNav() {
  const items = useNavItems();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto grid max-w-xl grid-cols-4 px-1">
        {items.map(({ to, label, icon: Icon, isActive, badge }) => (
          <li key={label}>
            <Link
              to={to}
              aria-current={isActive ? 'page' : undefined}
              className="flex min-h-16 flex-col items-center justify-center gap-1 text-[12px] font-semibold"
            >
              <span className={`relative flex h-8 w-14 items-center justify-center rounded-full ${isActive ? 'bg-blue-50 text-brand' : 'text-muted'}`}>
                <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                <CountBadge count={badge} className="absolute -top-1 right-1" />
              </span>
              <span className={isActive ? 'text-brand' : 'text-muted'}>
                {label}
                {badge > 0 && <span className="sr-only">{label === 'Alerts' ? `, ${badge} new` : `, ${badge} items`}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

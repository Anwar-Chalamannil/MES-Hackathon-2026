import { Link } from 'react-router';
import { APP_NAME } from '../../config';
import { useNavItems } from './navItems';

export default function TopNav() {
  const items = useNavItems();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-4">
        <Link to="/" className="text-[17px] font-extrabold tracking-tight text-brand">
          {APP_NAME}
        </Link>
        <nav aria-label="Main" className="hidden gap-1 lg:flex">
          {items.map(({ to, label, isActive }) => (
            <Link
              key={label}
              to={to}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-btn px-3 py-2 text-[15px] font-semibold ${isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'}`}
            >
              {label}
            </Link>
          ))}
          <Link to="/about" className="rounded-btn px-3 py-2 text-[15px] font-semibold text-muted hover:text-ink">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

import { Link } from 'react-router';
import Logo from '../brand/Logo';
import { useNavItems } from './navItems';

export default function TopNav() {
  const items = useNavItems();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-4">
        <Link to="/" className="inline-flex min-h-11 items-center rounded-btn">
          <Logo variant="inline" height={40} />
        </Link>
        <nav aria-label="Main" className="hidden gap-1 lg:flex">
          {items.map(({ to, label, isActive }) => (
            <Link
              key={label}
              to={to}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center rounded-btn px-3 text-[15px] font-semibold ${isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'}`}
            >
              {label}
            </Link>
          ))}
          <Link to="/about" className="inline-flex min-h-11 items-center rounded-btn px-3 text-[15px] font-semibold text-muted hover:text-ink">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Menu, Search } from 'lucide-react';
import Logo from '../brand/Logo';
import MenuSheet from './MenuSheet';
import NotificationBell from './NotificationBell';

/**
 * Phones: ☰ menu, logo, bell. Desktop (the sidebar holds the logo and navigation): a wide search field and the bell.
 */
export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-2 px-2 lg:gap-4 lg:px-6">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-haspopup="dialog"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink active:bg-blue-50 lg:hidden"
        >
          <Menu size={24} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <Link to="/" aria-label="Perq home" className="mx-auto inline-flex min-h-11 items-center rounded-btn lg:hidden">
          <Logo variant="inline" height={44} />
        </Link>

        <form role="search" aria-label="Site search" onSubmit={submit} className="relative mx-auto hidden w-full max-w-xl lg:block">
          <label className="block">
            <span className="sr-only">Search restaurants, products and apps</span>
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants, products or apps"
              className="min-h-11 w-full rounded-full border border-control bg-bg pr-4 pl-11 text-[16px] placeholder:text-muted"
            />
          </label>
        </form>

        <div className="ml-auto lg:ml-0">
          <NotificationBell />
        </div>
      </div>
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import BottomNav from './BottomNav';
import ErrorBoundary from './ErrorBoundary';
import { pageName, pageTitle } from './pageTitle';
import SimulatedBanner from './SimulatedBanner';
import TopNav from './TopNav';

export default function AppShell() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const lastPath = useRef<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Always keep the tab title right. When the path actually changes (not on first load, and not when React
  // re-runs effects in development): go to the top, move focus to the new page, and tell screen readers.
  useEffect(() => {
    document.title = pageTitle(pathname);
    const previous = lastPath.current;
    lastPath.current = pathname;
    if (previous === null || previous === pathname) return;
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
    setAnnouncement(pageName(pathname));
  }, [pathname]);

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-btn focus:bg-brand focus:px-4 focus:py-3 focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <TopNav />
      <SimulatedBanner />
      <main
        id="main"
        ref={main}
        tabIndex={-1}
        className="mx-auto max-w-[1120px] px-4 pt-6 pb-[calc(88px+env(safe-area-inset-bottom))] outline-none lg:pb-12"
      >
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <BottomNav />
      <div role="status" aria-live="polite" className="sr-only">{announcement}</div>
    </div>
  );
}

import { Link, useLocation } from 'react-router';

const TABS = [
  { to: '/food', label: 'Restaurants' },
  { to: '/grocery', label: 'Groceries' },
  { to: '/pharmacy', label: 'Pharmacy & care' },
];

/** Switch between the three shopping scenarios. Each keeps its own basket. */
export default function ScenarioTabs() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Shopping categories" className="grid grid-cols-3 gap-1 rounded-card border border-line bg-surface p-1">
      {TABS.map((t) => {
        const on = pathname.startsWith(t.to);
        return (
          <Link
            key={t.to}
            to={t.to}
            aria-current={on ? 'page' : undefined}
            className={`flex min-h-11 items-center justify-center rounded-[10px] text-[14px] font-bold ${on ? 'bg-brand text-white' : 'text-muted active:bg-blue-50'}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

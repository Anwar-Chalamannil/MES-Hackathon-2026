import { Bell, Home, Scale, Ticket } from 'lucide-react';
import { useLocation } from 'react-router';
import { useNotifications } from '../../hooks/useNotifications';
import { useAppStore } from '../../store/useAppStore';

/**
 * The four main destinations. Compare opens the basket you last shopped in if it has items,
 * otherwise the Compare hub that shows all three baskets.
 */
export function useNavItems() {
  const { pathname } = useLocation();
  const active = useAppStore((s) => s.activeScenario);
  const activeCount = useAppStore((s) => s.baskets[s.activeScenario].lines.length);
  const basketCount = useAppStore((s) =>
    Object.values(s.baskets).reduce((n, b) => n + b.lines.reduce((m, l) => m + l.qty, 0), 0),
  );
  const { unreadCount } = useNotifications();

  const items = [
    { to: '/', label: 'Home', icon: Home, badge: 0, match: (p: string) => p === '/' },
    {
      to: activeCount > 0 ? `/compare/${active}` : '/compare',
      label: 'Compare', icon: Scale, badge: basketCount, match: (p: string) => p.startsWith('/compare'),
    },
    { to: '/vouchers', label: 'Vouchers', icon: Ticket, badge: 0, match: (p: string) => p.startsWith('/vouchers') },
    { to: '/notifications', label: 'Alerts', icon: Bell, badge: unreadCount, match: (p: string) => p.startsWith('/notifications') },
  ];
  return items.map((i) => ({ ...i, isActive: i.match(pathname) }));
}

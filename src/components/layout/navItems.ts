import { Home, ShoppingBasket, Scale, Ticket } from 'lucide-react';
import { useLocation } from 'react-router';
import { useAppStore } from '../../store/useAppStore';

/** Main navigation. "Compare" opens the scenario you last shopped in. */
export function useNavItems() {
  const { pathname } = useLocation();
  const active = useAppStore((s) => s.activeScenario);
  const items = [
    { to: '/', label: 'Home', icon: Home, match: (p: string) => p === '/' },
    { to: '/food', label: 'Shop', icon: ShoppingBasket, match: (p: string) => /^\/(food|grocery|pharmacy)/.test(p) },
    { to: `/compare/${active}`, label: 'Compare', icon: Scale, match: (p: string) => p.startsWith('/compare') },
    { to: '/wallet', label: 'Wallet', icon: Ticket, match: (p: string) => /^\/(wallet|expiry)/.test(p) },
  ];
  return items.map((i) => ({ ...i, isActive: i.match(pathname) }));
}

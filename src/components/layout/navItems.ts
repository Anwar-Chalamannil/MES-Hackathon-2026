import { Home, ShoppingBasket, Scale, Ticket } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/food', label: 'Shop', icon: ShoppingBasket, end: false },
  { to: '/compare/food', label: 'Compare', icon: Scale, end: false },
  { to: '/wallet', label: 'Wallet', icon: Ticket, end: false },
] as const;

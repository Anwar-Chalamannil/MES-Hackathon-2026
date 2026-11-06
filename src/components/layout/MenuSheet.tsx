import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Info, Pill, RotateCcw, Search, ShoppingBasket, Timer, Utensils } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import Button from '../ui/Button';
import Sheet from '../ui/Sheet';

const LINKS = [
  { to: '/search', label: 'Search', icon: Search },
  { to: '/food', label: 'Restaurants', icon: Utensils },
  { to: '/grocery', label: 'Groceries', icon: ShoppingBasket },
  { to: '/pharmacy', label: 'Pharmacy & care', icon: Pill },
  { to: '/vouchers/expiry', label: 'Expiry tracker', icon: Timer },
  { to: '/about', label: 'About Perq', icon: Info },
] as const;

/** The ☰ menu on phones: everything that is not a bottom tab, plus Reset demo (asks first). */
export default function MenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const resetDemo = useAppStore((s) => s.resetDemo);
  const [confirming, setConfirming] = useState(false);

  const close = () => {
    setConfirming(false);
    onClose();
  };

  return (
    <Sheet open={open} onClose={close} title={confirming ? 'Reset the demo?' : 'Menu'}>
      {confirming ? (
        <div>
          <p className="text-[15px]">This clears your baskets, saved vouchers and read alerts, and starts the demo again.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirming(false)}>Keep my data</Button>
            <Button className="flex-1" onClick={() => { resetDemo(); close(); }}>Reset demo</Button>
          </div>
        </div>
      ) : (
        <nav aria-label="Menu">
          <ul className="divide-y divide-line rounded-card border border-line bg-surface">
            {LINKS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link to={to} onClick={close} className="flex min-h-14 items-center gap-3 px-4 text-[16px] font-semibold active:bg-blue-50">
                  <Icon size={22} strokeWidth={1.75} aria-hidden="true" className="text-blue" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight size={20} aria-hidden="true" className="text-muted" />
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-3 flex min-h-12 w-full items-center gap-3 rounded-card px-4 text-[15px] font-semibold text-muted active:bg-blue-50"
          >
            <RotateCcw size={20} strokeWidth={1.75} aria-hidden="true" /> Reset demo
          </button>
          <p className="mt-2 flex items-center gap-2 px-4 text-[12px] text-muted">
            Demo prices and offers are simulated.
          </p>
        </nav>
      )}
    </Sheet>
  );
}

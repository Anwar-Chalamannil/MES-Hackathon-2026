import { Link, useLocation } from 'react-router';

/** Switch between the voucher list and the expiry tracker. */
export default function WalletTabs() {
  const { pathname } = useLocation();
  const tab = (to: string, label: string) => {
    const on = pathname === to;
    return (
      <Link
        to={to}
        aria-current={on ? 'page' : undefined}
        className={`flex min-h-11 items-center justify-center rounded-[10px] text-[14px] font-bold ${on ? 'bg-brand text-white' : 'text-muted active:bg-brand-soft'}`}
      >
        {label}
      </Link>
    );
  };
  return (
    <nav aria-label="Wallet sections" className="grid grid-cols-2 gap-1 rounded-card border border-line bg-surface p-1">
      {tab('/vouchers', 'Vouchers')}
      {tab('/vouchers/expiry', 'Expiry tracker')}
    </nav>
  );
}

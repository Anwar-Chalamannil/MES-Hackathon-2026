import { Link } from 'react-router';
import { AlertTriangle, BellRing, CheckCheck, Clock, Hourglass } from 'lucide-react';
import { countdown, formatQatar } from '../engine/time';
import Button, { ButtonLink } from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { useNotifications } from '../hooks/useNotifications';
import { useNow } from '../hooks/useNow';
import type { AppNotification, NotificationStage } from '../lib/notifications';

const STAGE_ICON: Record<NotificationStage, { Icon: typeof Clock; cls: string }> = {
  '7d': { Icon: Clock, cls: 'bg-blue-50 text-brand' },
  '3d': { Icon: Hourglass, cls: 'bg-blue-50 text-brand' },
  '24h': { Icon: BellRing, cls: 'bg-pink-50 text-pink-ink' },
  expired: { Icon: AlertTriangle, cls: 'bg-bg text-fail' },
};

function Item({ n, unread, nowMs, onOpen }: { n: AppNotification; unread: boolean; nowMs: number; onOpen: () => void }) {
  const { Icon, cls } = STAGE_ICON[n.stage];
  const { label, expired } = countdown(n.expiryMs, nowMs);
  return (
    <li>
      <Link
        to={`/vouchers/${n.promoId}`}
        onClick={onOpen}
        data-testid="notification"
        data-unread={unread}
        className="flex min-h-16 items-start gap-3 rounded-card border border-line bg-surface p-3 active:bg-blue-50"
      >
        <span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-full ${cls}`}>
          <Icon size={20} strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-[15px] leading-snug ${unread ? 'font-extrabold' : 'font-semibold'}`}>
            {unread && <span className="sr-only">Unread. </span>}
            {n.title}
          </span>
          <span className="block text-[13px] text-muted">{n.message}</span>
          <span className="mt-0.5 block text-[12px] text-muted">
            {expired ? label : `Ends in ${label}`} · {formatQatar(n.expiryMs)}
          </span>
        </span>
        {unread && <span aria-hidden="true" className="mt-2 size-2.5 shrink-0 rounded-full bg-brand" />}
      </Link>
    </li>
  );
}

/** Alerts for saved vouchers that are about to expire (or just did). Only generated while Perq is open. */
export default function Notifications() {
  const { all, unread, read, unreadCount, markRead, markAllRead } = useNotifications();
  const nowMs = useNow();

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight">Alerts</h1>
          <p className="mt-1 text-[15px] text-muted">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up.'}
          </p>
        </div>
        <Button variant="secondary" onClick={markAllRead} disabled={unreadCount === 0} className="shrink-0">
          <CheckCheck size={18} aria-hidden="true" /> Mark all as read
        </Button>
      </div>

      {all.length === 0 ? (
        <EmptyState title="No alerts yet" text="Save a voucher and we will tell you when it is about to expire.">
          <ButtonLink to="/vouchers">Open vouchers</ButtonLink>
        </EmptyState>
      ) : (
        <>
          {unread.length > 0 && (
            <section aria-labelledby="alerts-new">
              <h2 id="alerts-new" className="mb-2 text-[15px] font-extrabold">New</h2>
              <ul className="space-y-2">
                {unread.map((n) => <Item key={n.id} n={n} unread nowMs={nowMs} onOpen={() => markRead(n.id)} />)}
              </ul>
            </section>
          )}
          {read.length > 0 && (
            <section aria-labelledby="alerts-earlier">
              <h2 id="alerts-earlier" className="mb-2 text-[15px] font-extrabold">Earlier</h2>
              <ul className="space-y-2">
                {read.map((n) => <Item key={n.id} n={n} unread={false} nowMs={nowMs} onOpen={() => undefined} />)}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="text-[12px] text-muted">Alerts appear while Perq is open. They are made from the vouchers you have saved.</p>
    </div>
  );
}

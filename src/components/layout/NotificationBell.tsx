import { Bell } from 'lucide-react';
import { Link } from 'react-router';
import { useNotifications } from '../../hooks/useNotifications';
import CountBadge from '../ui/CountBadge';

/** Bell in the header: opens the alerts page and shows how many are unread. */
export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  return (
    <Link
      to="/notifications"
      aria-label={unreadCount > 0 ? `Alerts, ${unreadCount} unread` : 'Alerts'}
      className="relative flex size-11 items-center justify-center rounded-full text-ink active:bg-blue-50"
    >
      <Bell size={24} strokeWidth={1.75} aria-hidden="true" />
      <CountBadge count={unreadCount} className="absolute top-0.5 right-0.5" />
    </Link>
  );
}

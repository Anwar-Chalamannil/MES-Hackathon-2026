import { useEffect, useMemo } from 'react';
import { buildNotifications, type AppNotification } from '../lib/notifications';
import { useAppStore } from '../store/useAppStore';
import { useNow } from './useNow';

export interface NotificationsView {
  all: AppNotification[];
  unread: AppNotification[];
  read: AppNotification[];
  unreadCount: number;
  isRead: (id: string) => boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

/** Alerts for saved vouchers, regenerated every minute while the app is open. */
export function useNotifications(): NotificationsView {
  const wallet = useAppStore((s) => s.wallet);
  const anchorMs = useAppStore((s) => s.demoAnchor);
  const readIds = useAppStore((s) => s.readNotificationIds);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);
  const pruneReadNotifications = useAppStore((s) => s.pruneReadNotifications);
  const nowMs = useNow();

  const all = useMemo(() => buildNotifications(wallet, anchorMs, nowMs), [wallet, anchorMs, nowMs]);

  useEffect(() => {
    pruneReadNotifications(all.map((n) => n.id));
  }, [all, pruneReadNotifications]);

  const unread = useMemo(() => all.filter((n) => !readIds.includes(n.id)), [all, readIds]);
  const read = useMemo(() => all.filter((n) => readIds.includes(n.id)), [all, readIds]);

  return {
    all,
    unread,
    read,
    unreadCount: unread.length,
    isRead: (id) => readIds.includes(id),
    markRead: markNotificationRead,
    markAllRead: () => markAllNotificationsRead(all.map((n) => n.id)),
  };
}

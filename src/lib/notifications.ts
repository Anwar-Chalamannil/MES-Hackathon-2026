import { catalog } from '../data/catalog';
import { expiryBucket, resolveExpiry } from '../engine/time';
import type { Promotion, Wallet } from '../engine/types';
import { promoShortTitle } from './promoDisplay';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export type NotificationStage = '7d' | '3d' | '24h' | 'expired';

export interface AppNotification {
  /** `${promoId}@${stage}`: stable, so a reload never makes a duplicate. */
  id: string;
  promoId: string;
  stage: NotificationStage;
  title: string;
  message: string;
  /** When the alert became true: expiry minus 7d / 3d / 24h, or the expiry itself. */
  triggerMs: number;
  expiryMs: number;
}

/** Expired vouchers only get an alert for a week, so old historical ones do not nag. */
export const EXPIRED_ALERT_WINDOW_MS = 7 * DAY;

const TRIGGER_OFFSET: Record<NotificationStage, number> = { '7d': 7 * DAY, '3d': 3 * DAY, '24h': DAY, expired: 0 };

const STAGE_TEXT: Record<NotificationStage, string> = {
  '7d': 'expires within 7 days',
  '3d': 'expires within 3 days',
  '24h': 'expires within 24 hours',
  expired: 'has expired',
};

const platformName = (id: string) => catalog.platforms.find((p) => p.id === id)?.name ?? id;

/** Only vouchers in the wallet: saved seed codes and bank offers, plus your own. Automatic offers are not alerts. */
export function savedPromotions(wallet: Wallet): Promotion[] {
  const seed = wallet.savedIds
    .map((id) => catalog.promotions.find((p) => p.id === id))
    .filter((p): p is Promotion => !!p && (p.kind === 'code' || p.kind === 'bank'));
  return [...seed, ...wallet.custom];
}

/** One notification per saved voucher, for its current stage. Newest first. */
export function buildNotifications(wallet: Wallet, anchorMs: number, nowMs: number): AppNotification[] {
  const out: AppNotification[] = [];
  const seen = new Set<string>();
  for (const promo of savedPromotions(wallet)) {
    if (seen.has(promo.id)) continue;
    seen.add(promo.id);
    const expiryMs = resolveExpiry(promo.conditions.expiry, anchorMs);
    const bucket = expiryBucket(expiryMs, nowMs);
    if (bucket === 'later') continue;
    if (bucket === 'expired' && nowMs - expiryMs > EXPIRED_ALERT_WINDOW_MS) continue;
    const stage: NotificationStage = bucket;
    // Benefit first: "30% OFF at Rafeeq expires within 3 days"; the code moves to the message line.
    out.push({
      id: `${promo.id}@${stage}`,
      promoId: promo.id,
      stage,
      title: `${promoShortTitle(promo, platformName(promo.platformId))} ${STAGE_TEXT[stage]}`,
      message: `${platformName(promo.platformId)}: ${promo.code ? `code ${promo.code}` : promo.name}`,
      triggerMs: expiryMs - TRIGGER_OFFSET[stage],
      expiryMs,
    });
  }
  return out.sort((a, b) => b.triggerMs - a.triggerMs || (a.id < b.id ? -1 : 1));
}

/** The number on the bell and the Alerts tab: "9+" above nine. */
export const formatBadge = (count: number): string => (count > 9 ? '9+' : String(count));

import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, Check, ChevronDown, Info, X } from 'lucide-react';
import { resolveExpiry } from '../../engine/time';
import type { Promotion } from '../../engine/types';
import { CLASS_HELP, CLASS_LABEL } from '../../lib/promoText';
import type { PromoState, PromoStatus } from '../../lib/promoStatus';
import PlatformChip from '../ui/PlatformChip';
import EligibilityList from './EligibilityList';
import CardOfferNote from './CardOfferNote';
import ExpiryBadge from './ExpiryBadge';
import VoucherBenefit from './VoucherBenefit';

const STATE_STYLE: Record<PromoState, { Icon: typeof Check; cls: string }> = {
  applied: { Icon: Check, cls: 'text-save' },
  eligible: { Icon: Info, cls: 'text-ink' },
  failed: { Icon: X, cls: 'text-fail' },
  none: { Icon: AlertTriangle, cls: 'text-muted' },
  info: { Icon: Info, cls: 'text-muted' },
};

const tag = 'rounded-full px-2 py-0.5 text-[12px] font-bold';

/**
 * A voucher as a ticket: platform and tags, the benefit in large type, expiry, and a plain-language status
 * for the current basket. "Why?" opens the full eligibility checks.
 */
export default function VoucherCard({
  promo, status, nowMs, anchorMs, actions, detailLink = false, defaultOpen = false,
}: {
  promo: Promotion;
  status: PromoStatus;
  nowMs: number;
  anchorMs: number;
  actions?: ReactNode;
  /** Make the title open the voucher page. Off on the voucher page itself. */
  detailLink?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const expiryMs = resolveExpiry(promo.conditions.expiry, anchorMs);
  const expired = expiryMs <= nowMs;
  const { Icon, cls } = STATE_STYLE[status.state];
  const isDemo = promo.code?.startsWith('DEMO-');

  return (
    <article
      data-testid="voucher"
      data-promo={promo.id}
      className={`relative overflow-hidden rounded-card border bg-surface p-4 ${expired ? 'border-fail/40' : 'border-line'}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <PlatformChip platformId={promo.platformId} />
        {promo.origin === 'user' ? (
          <span className={`${tag} bg-brand text-white`}>Your voucher</span>
        ) : (
          <span className={`${tag} ${isDemo ? 'bg-warn/10 text-warn' : 'bg-line text-ink'}`} title={CLASS_HELP[promo.classification]}>
            {CLASS_LABEL[promo.classification]}
          </span>
        )}
        {status.best && <span className={`${tag} bg-save/10 text-save`}>Best for your basket</span>}
      </div>

      <div className="mt-3">
        <VoucherBenefit
          promo={promo}
          size="lg"
          expired={expired}
          subtitle={promo.origin === 'user' ? promo.name : undefined}
          title={detailLink ? (h) => <Link to={`/vouchers/${promo.id}`} className="underline-offset-4 hover:underline">{h}</Link> : undefined}
        />
        <CardOfferNote promo={promo} expired={expired} />
      </div>

      <div className="relative my-3 border-t border-dashed border-line">
        <span aria-hidden="true" className="absolute -top-2.5 -left-[26px] size-5 rounded-full bg-bg" />
        <span aria-hidden="true" className="absolute -top-2.5 -right-[26px] size-5 rounded-full bg-bg" />
      </div>

      <ExpiryBadge expiryMs={expiryMs} nowMs={nowMs} />

      <p className={`mt-2 flex gap-2 text-[14px] leading-snug font-semibold ${cls}`} data-testid="voucher-status">
        <Icon size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{status.headline}</span>
      </p>

      {status.evaluation && status.evaluation.conditions.length > 0 && (
        <>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="mt-2 flex min-h-11 items-center gap-1 text-[14px] font-bold text-brand"
          >
            Why? <ChevronDown size={16} aria-hidden="true" className={open ? 'rotate-180' : ''} />
          </button>
          {open && <EligibilityList evaluation={status.evaluation} />}
        </>
      )}

      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </article>
  );
}

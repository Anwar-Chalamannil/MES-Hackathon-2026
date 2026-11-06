import type { ReactNode } from 'react';
import type { Promotion } from '../../engine/types';
import { platformName } from '../../data/lookup';
import { codeInfo, promoDetails, promoHeadline, promoRequirement } from '../../lib/promoDisplay';
import CopyCodeButton from '../ui/CopyCodeButton';

const HEAD: Record<'lg' | 'md' | 'sm', string> = {
  lg: 'text-[26px] leading-tight',
  md: 'text-[22px] leading-tight',
  sm: 'text-[17px] leading-tight',
};

/**
 * One voucher, benefit first: a bold headline, a smaller details line, the requirement, then the small code with
 * a Copy button. Used on every screen so a voucher always reads the same way.
 *
 * - `title` lets the caller wrap the headline in a link.
 * - `showCopy` is off inside cards that are themselves links (a button inside a link is invalid).
 * - `savingLine` is the actual saving when the voucher is applied ("You save QAR 10.40"); never the cap.
 */
export default function VoucherBenefit({
  promo, size = 'md', expired = false, showCopy = true, showRequirement = true, savingLine, title, subtitle,
}: {
  promo: Promotion;
  /** Shown under the headline, e.g. the name a person gave their own voucher. */
  subtitle?: string;
  size?: 'lg' | 'md' | 'sm';
  expired?: boolean;
  showCopy?: boolean;
  showRequirement?: boolean;
  savingLine?: string;
  title?: (headline: string) => ReactNode;
}) {
  const headline = promoHeadline(promo);
  const details = promoDetails(promo, platformName(promo.platformId));
  const requirement = showRequirement ? promoRequirement(promo) : '';
  const info = codeInfo(promo, expired);
  const isSale = promo.benefit.type === 'sale_price';

  return (
    <div data-testid="voucher-benefit">
      <p className={`${HEAD[size]} font-extrabold text-ink`}>
        {isSale && <span className="mr-2 rounded-full bg-pink px-2.5 py-0.5 align-middle text-[12px] font-extrabold tracking-wide text-ink">SALE</span>}
        {title ? title(headline) : headline}
      </p>
      {(isSale || subtitle) && <p className="mt-0.5 text-[15px] font-semibold">{subtitle ?? promo.name}</p>}
      {details && <p className="mt-0.5 text-[14px] leading-snug text-muted">{details}</p>}
      {requirement && <p className="mt-1 text-[13px] leading-snug font-semibold text-ink">{requirement}</p>}
      {savingLine && <p className="mt-1 text-[14px] font-bold text-save">{savingLine}</p>}

      {info.kind === 'none' ? (
        <p className="mt-1.5 text-[13px] text-muted">{info.text}</p>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code
            className={`rounded bg-brand-soft px-2 py-1 text-[13px] font-bold ${info.kind === 'expired' ? 'text-muted line-through' : 'text-brand'}`}
            aria-label={`Voucher code ${info.code}${info.kind === 'expired' ? ', expired' : ''}`}
          >
            {info.code}
          </code>
          {info.kind === 'copy' && showCopy && <CopyCodeButton code={info.code} demo={info.demo} />}
        </div>
      )}
      {info.kind === 'copy' && info.demo && size !== 'sm' && (
        <p className="mt-1 text-[12px] text-muted">Demo code. It will not work in the real {platformName(promo.platformId)} app.</p>
      )}
    </div>
  );
}

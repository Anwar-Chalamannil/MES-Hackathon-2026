import { APP_NAME, BRAND_ASSETS } from '../../config';

type Asset = { src: string; width: number; height: number };
type Variant = 'mark' | 'wordmark' | 'inline' | 'lockup';

/** Width that keeps the file's real proportions at a given height. The logo is never stretched or recoloured. */
const at = (a: Asset, height: number) => ({ height, width: Math.round((a.width / a.height) * height) });

/**
 * The Perq logo in the four ways it is used:
 * - mark: the basket alone (small spaces)
 * - wordmark: the PeRQ lettering alone
 * - inline: basket and lettering side by side (headers)
 * - lockup: basket above the lettering (About page, large)
 * `height` is the height of the basket (or of the whole lockup).
 */
export default function Logo({ variant = 'inline', height, className = '' }: { variant?: Variant; height?: number; className?: string }) {
  const { mark, wordmark, lockup } = BRAND_ASSETS;
  switch (variant) {
    case 'mark':
      return <img src={mark.src} alt={APP_NAME} {...at(mark, height ?? 40)} className={className} decoding="async" />;
    case 'wordmark':
      return <img src={wordmark.src} alt={APP_NAME} {...at(wordmark, height ?? 28)} className={className} decoding="async" />;
    case 'lockup':
      return <img src={lockup.src} alt={APP_NAME} {...at(lockup, height ?? 200)} className={className} decoding="async" />;
    case 'inline': {
      const h = height ?? 40;
      return (
        <span className={`inline-flex items-center gap-2 ${className}`}>
          <img src={mark.src} alt="" aria-hidden="true" {...at(mark, h)} decoding="async" />
          <img src={wordmark.src} alt={APP_NAME} {...at(wordmark, Math.round(h * 0.7))} decoding="async" />
        </span>
      );
    }
  }
}

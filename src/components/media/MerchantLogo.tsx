import { merchantLogo } from '../../data/images';
import type { Merchant } from '../../engine/types';
import Img from './Img';

/** A restaurant or store logo, or a monogram tile (first letter on soft blue) until the logo is supplied. */
export default function MerchantLogo({ merchant, size = 56, eager = false }: { merchant: Pick<Merchant, 'id' | 'name'>; size?: number; eager?: boolean }) {
  return (
    <span
      data-testid="merchant-logo"
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-line bg-surface"
      style={{ width: size, height: size }}
    >
      <Img
        image={merchantLogo(merchant)}
        width={size - 8}
        height={size - 8}
        fit="contain"
        eager={eager}
        fallback={
          <span
            data-fallback="true"
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-blue-50 font-extrabold text-brand"
            style={{ fontSize: Math.round(size * 0.38) }}
          >
            {merchant.name.charAt(0)}
          </span>
        }
      />
    </span>
  );
}

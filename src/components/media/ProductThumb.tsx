import { Pill, ShoppingBasket, Utensils } from 'lucide-react';
import { productImage } from '../../data/images';
import type { Product } from '../../engine/types';
import Img from './Img';

const ICON = { food: Utensils, grocery: ShoppingBasket, pharmacy: Pill } as const;

/** Square product picture: the real photo, or a tile with the category icon and the brand's first letter. */
export default function ProductThumb({ product, size = 72, eager = false }: { product: Product; size?: number; eager?: boolean }) {
  const Icon = ICON[product.scenario];
  const initial = product.brand?.charAt(0).toUpperCase(); // only packaged goods have a brand; dishes show the icon alone
  const box = { width: size, height: size };
  return (
    <span
      data-testid="product-thumb"
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-pink-50"
      style={box}
    >
      <Img
        image={productImage(product)}
        width={size}
        height={size}
        eager={eager}
        fallback={
          <span data-fallback="true" aria-hidden="true" className="flex size-full flex-col items-center justify-center text-ink/70">
            <Icon size={Math.round(size * (initial ? 0.34 : 0.42))} strokeWidth={1.75} />
            {initial && <span className="mt-0.5 text-[13px] leading-none font-extrabold">{initial}</span>}
          </span>
        }
      />
    </span>
  );
}

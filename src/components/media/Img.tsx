import { useEffect, useState, type ReactNode } from 'react';
import type { ImageSource } from '../../data/images';

/**
 * An image with a fixed size (so nothing jumps when it loads), lazy loading, and a fallback that
 * replaces it if the file is missing or the request fails. Only the first images on a page should be `eager`.
 */
export default function Img({
  image, width, height, sizes, eager = false, fit = 'cover', className = '', fallback,
}: {
  image: ImageSource | undefined;
  width: number;
  height: number;
  sizes?: string;
  eager?: boolean;
  fit?: 'cover' | 'contain';
  className?: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image?.src]);

  if (!image || failed) return <>{fallback}</>;
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.srcSet ? (sizes ?? `${width}px`) : undefined}
      alt={image.alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
      style={{ width, height }}
    />
  );
}

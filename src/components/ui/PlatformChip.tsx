import { platformLogo } from '../../data/images';
import { platformById } from '../../data/lookup';
import Img from '../media/Img';

/** Neutral pill with the platform's logo (when supplied) or its brand colour as a small dot. */
export default function PlatformChip({ platformId, className = '' }: { platformId: string; className?: string }) {
  const p = platformById.get(platformId);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[13px] font-semibold ${className}`}>
      <Img
        image={platformLogo(platformId, p?.name ?? platformId)}
        width={18}
        height={18}
        fit="contain"
        fallback={<span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: p?.color ?? '#999' }} />}
      />
      {p?.name ?? platformId}
    </span>
  );
}

export function PlatformDots({ platformIds }: { platformIds: string[] }) {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {platformIds.map((id) => (
        <span key={id} className="size-2.5 rounded-full" style={{ background: platformById.get(id)?.color ?? '#999' }} />
      ))}
    </span>
  );
}

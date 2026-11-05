import { platformById } from '../../data/lookup';

/** Neutral pill with the platform's brand colour as a small dot. No logos. */
export default function PlatformChip({ platformId, className = '' }: { platformId: string; className?: string }) {
  const p = platformById.get(platformId);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[13px] font-semibold ${className}`}>
      <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: p?.color ?? '#999' }} />
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

import { formatBadge } from '../../lib/notifications';

/** Small count on an icon: "3", or "9+" above nine. Hidden at zero. The parent says what the number means. */
export default function CountBadge({ count, className = '' }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className={`flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[11px] leading-none font-extrabold text-white ${className}`}
    >
      {formatBadge(count)}
    </span>
  );
}

import { Clock } from 'lucide-react';
import { countdown, expiryBucket, formatQatar } from '../../engine/time';

/** Live countdown plus the exact expiry in Qatar time. Colour: red expired, amber within 24 hours. */
export default function ExpiryBadge({ expiryMs, nowMs }: { expiryMs: number; nowMs: number }) {
  const { expired, label } = countdown(expiryMs, nowMs);
  const soon = expiryBucket(expiryMs, nowMs) === '24h';
  const tone = expired ? 'text-fail' : soon ? 'text-warn' : 'text-muted';
  return (
    <p className={`flex flex-wrap items-center gap-x-2 text-[13px] font-semibold ${tone}`} data-testid="expiry">
      <Clock size={14} aria-hidden="true" />
      <span>{expired ? label : `Ends in ${label}`}</span>
      <span className="font-normal text-muted">{formatQatar(expiryMs)}</span>
    </p>
  );
}

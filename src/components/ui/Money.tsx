import { fmt } from '../../engine/money';

export default function Money({ dh, className = '' }: { dh: number; className?: string }) {
  return <span className={`money ${className}`}>{fmt(dh)}</span>;
}

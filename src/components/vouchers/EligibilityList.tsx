import { AlertTriangle, Check, X } from 'lucide-react';
import type { CondStatus, PromoEval } from '../../engine/types';

const ICON: Record<CondStatus, { Icon: typeof Check; cls: string; word: string }> = {
  met: { Icon: Check, cls: 'text-save', word: 'Met' },
  assumed: { Icon: Check, cls: 'text-save', word: 'Met (from your selection)' },
  failed: { Icon: X, cls: 'text-fail', word: 'Not met' },
  failed_profile: { Icon: X, cls: 'text-fail', word: 'Not met (from your selection)' },
  verify: { Icon: AlertTriangle, cls: 'text-warn', word: 'Check in the app' },
};

/**
 * Every condition of a voucher and whether it is met. Conditions come from three places and the icon says which:
 * data (met / not met), your profile selection, or something only the original app can confirm.
 */
export default function EligibilityList({ evaluation }: { evaluation: PromoEval }) {
  if (evaluation.conditions.length === 0) return null;
  return (
    <ul className="space-y-1.5" aria-label="Eligibility checks">
      {evaluation.conditions.map((c) => {
        const { Icon, cls, word } = ICON[c.status];
        return (
          <li key={c.key} className="flex gap-2 text-[13px] leading-snug">
            <Icon size={16} className={`mt-0.5 shrink-0 ${cls}`} aria-hidden="true" />
            <span>
              <span className="sr-only">{word}: </span>
              <strong>{c.label}:</strong> {c.message}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

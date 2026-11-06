import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

/** Copies text. Uses the clipboard API, falls back to a hidden textarea, and reports whether it worked. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the older method */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** A 44px button that copies a voucher code and says so. Demo codes say "demo" on the button. */
export default function CopyCodeButton({ code, demo }: { code: string; demo: boolean }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function onCopy() {
    const ok = await copyText(code);
    setState(ok ? 'copied' : 'failed');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`${demo ? 'Copy demo code' : 'Copy code'} ${code}`}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[14px] font-bold text-brand active:bg-blue-50"
      >
        {state === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        {state === 'copied' ? 'Copied' : demo ? 'Copy demo code' : 'Copy code'}
      </button>
      <span role="status" className="sr-only">
        {state === 'copied' ? `Copied ${code}` : state === 'failed' ? 'Could not copy. Select the code and copy it by hand.' : ''}
      </span>
      {state === 'failed' && <span className="text-[13px] text-fail">Could not copy. Select the code instead.</span>}
    </>
  );
}

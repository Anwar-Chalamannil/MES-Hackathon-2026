interface Option<T extends string> {
  value: T;
  label: string;
}

/** Radio-style segmented control. Works by touch and keyboard. */
export default function SegmentedControl<T extends string>({
  options, value, onChange, ariaLabel,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid auto-cols-fr grid-flow-col gap-1 rounded-card border border-line bg-surface p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`min-h-11 rounded-[10px] px-1 text-[13px] leading-tight font-bold ${on ? 'bg-brand text-white' : 'text-muted active:bg-blue-50'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

import { Search } from 'lucide-react';

export default function SearchInput({
  value, onChange, label, placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-btn border border-line bg-surface pr-3 pl-10 text-[16px] placeholder:text-muted"
      />
    </label>
  );
}

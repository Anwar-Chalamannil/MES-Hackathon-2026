const label = (c: string) => c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ');

/** Horizontally scrolling chips. The row scrolls, never the page. */
export default function CategoryChips({
  categories, selected, onSelect,
}: {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}) {
  const chip = (on: boolean) =>
    `shrink-0 min-h-10 rounded-full border px-4 text-[14px] font-semibold ${
      on ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface text-muted'
    }`;
  return (
    <div role="group" aria-label="Categories" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      <button type="button" aria-pressed={selected === null} className={chip(selected === null)} onClick={() => onSelect(null)}>
        All
      </button>
      {categories.map((c) => (
        <button key={c} type="button" aria-pressed={selected === c} className={chip(selected === c)} onClick={() => onSelect(c)}>
          {label(c)}
        </button>
      ))}
    </div>
  );
}

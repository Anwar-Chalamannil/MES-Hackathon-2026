import { toUiSortMode, type UiSortMode } from '../../lib/sortModes';
import { useAppStore } from '../../store/useAppStore';
import SegmentedControl from '../ui/SegmentedControl';

const OPTIONS: { value: UiSortMode; label: string }[] = [
  { value: 'price', label: 'Best price' },
  { value: 'fastest', label: 'Fastest' },
];

/** Two equal-width segments (the control is a grid with equal columns). */
export default function ModeSwitch() {
  const mode = toUiSortMode(useAppStore((s) => s.sortMode));
  const setSortMode = useAppStore((s) => s.setSortMode);
  return <SegmentedControl ariaLabel="Sort by" options={OPTIONS} value={mode} onChange={setSortMode} />;
}

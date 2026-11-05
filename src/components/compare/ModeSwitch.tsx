import type { SortMode } from '../../engine/types';
import { useAppStore } from '../../store/useAppStore';
import SegmentedControl from '../ui/SegmentedControl';

const OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'price', label: 'Best price' },
  { value: 'fastest', label: 'Fastest' },
  { value: 'discount', label: 'Biggest discount' },
];

export default function ModeSwitch() {
  const mode = useAppStore((s) => s.sortMode);
  const setSortMode = useAppStore((s) => s.setSortMode);
  return <SegmentedControl ariaLabel="Sort by" options={OPTIONS} value={mode} onChange={setSortMode} />;
}

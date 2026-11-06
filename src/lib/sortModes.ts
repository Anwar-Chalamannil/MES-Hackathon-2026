import type { SortMode } from '../engine/types';

/**
 * The app offers two sort modes. The engine still understands 'discount' (it is tested and unchanged),
 * but the UI never shows it. Anything else falls back to Best price.
 */
export type UiSortMode = Exclude<SortMode, 'discount'>;

export const UI_SORT_MODES: readonly UiSortMode[] = ['price', 'fastest'];

export function toUiSortMode(mode: unknown): UiSortMode {
  return mode === 'fastest' ? 'fastest' : 'price';
}

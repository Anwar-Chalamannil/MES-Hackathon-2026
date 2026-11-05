import type { Scenario } from '../../engine/types';
import Sheet from '../ui/Sheet';
import BasketContent from './BasketContent';

export default function BasketSheet({
  scenario, open, onClose, showCompare = true,
}: {
  scenario: Scenario;
  open: boolean;
  onClose: () => void;
  showCompare?: boolean;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Your basket">
      <BasketContent scenario={scenario} onNavigate={onClose} showCompare={showCompare} />
    </Sheet>
  );
}

import Button from '../ui/Button';
import Sheet from '../ui/Sheet';

/** Shown when adding from a different restaurant. A basket belongs to one restaurant at a time. */
export default function ReplaceBasketDialog({
  open, fromName, toName, onConfirm, onCancel,
}: {
  open: boolean;
  fromName: string;
  toName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Sheet open={open} onClose={onCancel} title={`Start a new ${toName} basket?`}>
      <p className="text-[15px]">
        A basket can only hold one restaurant at a time, because each order is placed with a single restaurant.
        Your {fromName} basket will be cleared.
      </p>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Keep {fromName}</Button>
        <Button className="flex-1" onClick={onConfirm}>Start new basket</Button>
      </div>
    </Sheet>
  );
}

import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { catalog } from '../data/catalog';
import type { Promotion } from '../engine/types';
import BestForBasket from '../components/vouchers/BestForBasket';
import VoucherCard from '../components/vouchers/VoucherCard';
import WalletTabs from '../components/vouchers/WalletTabs';
import Button, { ButtonLink } from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import SegmentedControl from '../components/ui/SegmentedControl';
import Sheet from '../components/ui/Sheet';
import { useVoucherStatus } from '../hooks/useVoucherStatus';
import { useAppStore } from '../store/useAppStore';

type Tab = 'saved' | 'auto' | 'discover';

export default function Wallet() {
  const savedIds = useAppStore((s) => s.wallet.savedIds);
  const custom = useAppStore((s) => s.wallet.custom);
  const saveSeed = useAppStore((s) => s.saveSeed);
  const unsaveSeed = useAppStore((s) => s.unsaveSeed);
  const deleteCustom = useAppStore((s) => s.deleteCustom);
  const { statusFor, comparison, basket, nowMs, anchorMs } = useVoucherStatus();
  const [tab, setTab] = useState<Tab>('saved');
  const [toDelete, setToDelete] = useState<Promotion | null>(null);

  const lists = useMemo(() => {
    const codes = catalog.promotions.filter((p) => p.kind === 'code' || p.kind === 'bank');
    return {
      saved: [...custom, ...codes.filter((p) => savedIds.includes(p.id))],
      auto: catalog.promotions.filter((p) => p.kind === 'auto' || p.kind === 'membership' || p.kind === 'sale'),
      discover: codes.filter((p) => !savedIds.includes(p.id)),
    };
  }, [custom, savedIds]);

  const shown = lists[tab];

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-tight">Vouchers</h1>
        <p className="mt-1 text-[15px] text-muted">Save vouchers, see why each one applies or not, and let us pick the best.</p>
      </div>
      <WalletTabs />
      <BestForBasket comparison={comparison} basket={basket} />

      <SegmentedControl<Tab>
        ariaLabel="Voucher list"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'saved', label: `Saved (${lists.saved.length})` },
          { value: 'auto', label: `Automatic (${lists.auto.length})` },
          { value: 'discover', label: `Discover (${lists.discover.length})` },
        ]}
      />

      {tab === 'saved' && (
        <ButtonLink to="/vouchers/new" variant="secondary" className="w-full sm:w-auto">
          <Plus size={18} aria-hidden="true" /> Add your own voucher
        </ButtonLink>
      )}
      {tab === 'auto' && (
        <p className="text-[13px] text-muted">
          These apply by themselves when you qualify. Memberships and first-order offers depend on your selections on the Compare page.
        </p>
      )}
      {tab === 'discover' && (
        <p className="text-[13px] text-muted">Demo vouchers you have not saved yet. Save one and the comparison updates.</p>
      )}

      {shown.length === 0 ? (
        <EmptyState
          title={tab === 'saved' ? 'No saved vouchers' : 'Nothing here'}
          text={tab === 'saved' ? 'Save one from Discover or add your own.' : 'You have saved all the demo vouchers.'}
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.id} className="min-w-0">
              <VoucherCard
                promo={p}
                detailLink
                status={statusFor(p, tab === 'saved' || tab === 'auto')}
                nowMs={nowMs}
                anchorMs={anchorMs}
                actions={
                  tab === 'saved' ? (
                    p.origin === 'user' ? (
                      <>
                        <ButtonLink to={`/vouchers/${p.id}/edit`} variant="secondary"><Pencil size={16} aria-hidden="true" /> Edit</ButtonLink>
                        <Button variant="secondary" onClick={() => setToDelete(p)} aria-label={`Delete ${p.name}`}>
                          <Trash2 size={16} aria-hidden="true" /> Delete
                        </Button>
                      </>
                    ) : (
                      <Button variant="secondary" onClick={() => unsaveSeed(p.id)} aria-label={`Remove ${p.code ?? p.name} from wallet`}>Remove</Button>
                    )
                  ) : tab === 'discover' ? (
                    <Button onClick={() => saveSeed(p.id)} aria-label={`Save ${p.code ?? p.name}`}><Plus size={16} aria-hidden="true" /> Save</Button>
                  ) : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      <p className="text-[12px] text-muted">
        All vouchers here are demonstrations. We never ask for card numbers or passwords, and nothing here is a live offer.
      </p>

      <Sheet open={toDelete !== null} onClose={() => setToDelete(null)} title="Delete this voucher?">
        <p className="text-[15px]">"{toDelete?.name}" will be removed from your wallet. This cannot be undone.</p>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setToDelete(null)}>Keep it</Button>
          <Button className="flex-1" onClick={() => { if (toDelete) deleteCustom(toDelete.id); setToDelete(null); }}>Delete</Button>
        </div>
      </Sheet>
    </div>
  );
}

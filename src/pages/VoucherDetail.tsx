import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ChevronLeft, Pencil, Plus, Scale, Trash2 } from 'lucide-react';
import { findPromo } from '../data/lookup';
import type { Promotion, Scenario } from '../engine/types';
import VoucherCard from '../components/vouchers/VoucherCard';
import Button, { ButtonLink } from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Sheet from '../components/ui/Sheet';
import { useVoucherStatus } from '../hooks/useVoucherStatus';
import { useAppStore } from '../store/useAppStore';

const SCENARIO_NAME: Record<Scenario, string> = { food: 'food', grocery: 'grocery', pharmacy: 'pharmacy' };
const PLATFORM_SCENARIO: Partial<Record<string, Scenario>> = {
  ninja: 'grocery', carrefour: 'grocery', lulu: 'grocery', kulud: 'pharmacy', wellcare: 'pharmacy',
};

/** The basket category a voucher is mostly for: its own scenario list, else by shop, else food. */
function scenarioFor(p: Promotion): Scenario {
  return p.conditions.scenarios?.[0] ?? PLATFORM_SCENARIO[p.platformId] ?? 'food';
}

/** One voucher in full: the ticket, every eligibility check for your current basket, and what you can do with it. */
export default function VoucherDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const custom = useAppStore((s) => s.wallet.custom);
  const savedIds = useAppStore((s) => s.wallet.savedIds);
  const saveSeed = useAppStore((s) => s.saveSeed);
  const unsaveSeed = useAppStore((s) => s.unsaveSeed);
  const deleteCustom = useAppStore((s) => s.deleteCustom);
  const { statusFor, scenario: activeScenario, nowMs, anchorMs } = useVoucherStatus();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const promo = findPromo(id, custom);
  const back = (
    <Link to="/vouchers" className="inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-brand">
      <ChevronLeft size={18} aria-hidden="true" /> Vouchers
    </Link>
  );

  if (!promo) {
    return (
      <div className="mx-auto max-w-[720px] space-y-4">
        {back}
        <h1 className="text-[24px] font-extrabold tracking-tight">Voucher not found</h1>
        <EmptyState title="We couldn't find that voucher" text="It may have been deleted, or the link is old.">
          <ButtonLink to="/vouchers">Back to vouchers</ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const isCodeLike = promo.kind === 'code' || promo.kind === 'bank';
  const isCustom = promo.origin === 'user';
  const saved = isCodeLike ? isCustom || savedIds.includes(promo.id) : true;
  const target = scenarioFor(promo);
  const label = promo.code ?? promo.name;

  return (
    <div className="mx-auto max-w-[720px] space-y-4 pb-8">
      {back}
      <h1 className="text-[24px] font-extrabold tracking-tight">Voucher details</h1>
      <p className="-mt-2 text-[14px] text-muted">
        The checks below use your {SCENARIO_NAME[activeScenario]} basket and your payment profile.
      </p>

      <VoucherCard promo={promo} status={statusFor(promo, saved)} nowMs={nowMs} anchorMs={anchorMs} defaultOpen />

      <div className="flex flex-wrap gap-2">
        {isCodeLike && !isCustom && (
          saved ? (
            <Button variant="secondary" onClick={() => unsaveSeed(promo.id)} aria-label={`Remove ${label} from vouchers`}>Remove</Button>
          ) : (
            <Button onClick={() => saveSeed(promo.id)} aria-label={`Save ${label}`}><Plus size={16} aria-hidden="true" /> Save</Button>
          )
        )}
        {isCustom && (
          <>
            <ButtonLink to={`/vouchers/${promo.id}/edit`} variant="secondary"><Pencil size={16} aria-hidden="true" /> Edit</ButtonLink>
            <Button variant="secondary" onClick={() => setConfirmDelete(true)} aria-label={`Delete ${promo.name}`}>
              <Trash2 size={16} aria-hidden="true" /> Delete
            </Button>
          </>
        )}
        <ButtonLink to={`/compare/${target}`} variant={saved ? 'primary' : 'secondary'}>
          <Scale size={16} aria-hidden="true" /> Compare {SCENARIO_NAME[target]}
        </ButtonLink>
      </div>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this voucher?">
        <p className="text-[15px]">"{promo.name}" will be removed from your vouchers. This cannot be undone.</p>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>Keep it</Button>
          <Button className="flex-1" onClick={() => { deleteCustom(promo.id); navigate('/vouchers'); }}>Delete</Button>
        </div>
      </Sheet>
    </div>
  );
}

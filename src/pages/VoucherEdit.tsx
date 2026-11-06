import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { promoById } from '../data/lookup';
import VoucherForm from '../components/vouchers/VoucherForm';
import EmptyState from '../components/ui/EmptyState';
import { ButtonLink } from '../components/ui/Button';
import { buildPromo, emptyForm, formFromPromo, type VoucherFormValues } from '../lib/voucherForm';
import { useAppStore } from '../store/useAppStore';

function Back() {
  return (
    <Link to="/vouchers" className="inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-brand">
      <ChevronLeft size={18} aria-hidden="true" /> Vouchers
    </Link>
  );
}

export function NewVoucher() {
  const navigate = useNavigate();
  const addCustom = useAppStore((s) => s.addCustom);
  const initial = useMemo(() => emptyForm(Date.now()), []);
  const submit = (v: VoucherFormValues) => {
    addCustom(buildPromo(v, `U-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`));
    navigate('/vouchers');
  };
  return (
    <div className="max-w-xl space-y-4 pb-8">
      <Back />
      <h1 className="text-[24px] font-extrabold tracking-tight">Add your own voucher</h1>
      <VoucherForm initial={initial} submitLabel="Save voucher" onSubmit={submit} onCancel={() => navigate('/vouchers')} />
    </div>
  );
}

export function EditVoucher() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const custom = useAppStore((s) => s.wallet.custom);
  const updateCustom = useAppStore((s) => s.updateCustom);
  const existing = custom.find((p) => p.id === id);

  if (!existing) {
    return (
      <div className="space-y-4">
        <Back />
        <EmptyState
          title={promoById.has(id) ? "Built-in vouchers can't be edited" : 'Voucher not found'}
          text={promoById.has(id) ? 'Demo vouchers are fixed. Add your own voucher to try different values.' : 'It may have been deleted.'}
        >
          <ButtonLink to="/vouchers">Back to vouchers</ButtonLink>
        </EmptyState>
      </div>
    );
  }
  return (
    <div className="max-w-xl space-y-4 pb-8">
      <Back />
      <h1 className="text-[24px] font-extrabold tracking-tight">Edit voucher</h1>
      <VoucherForm
        initial={formFromPromo(existing)}
        submitLabel="Save changes"
        onSubmit={(v) => { updateCustom(buildPromo(v, existing.id)); navigate('/vouchers'); }}
        onCancel={() => navigate('/vouchers')}
      />
    </div>
  );
}

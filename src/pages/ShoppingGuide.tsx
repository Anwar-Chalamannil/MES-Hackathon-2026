import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Clock, ExternalLink, Info } from 'lucide-react';
import ProductThumb from '../components/media/ProductThumb';
import Receipt from '../components/compare/Receipt';
import Money from '../components/ui/Money';
import { buttonClass, ButtonLink } from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PlatformChip from '../components/ui/PlatformChip';
import VoucherBenefit from '../components/vouchers/VoucherBenefit';
import { verifiedProviderLink } from '../data/providerLinks';
import { findPromo, merchantById, platformName, productById } from '../data/lookup';
import { fmt } from '../engine/money';
import type { PricedOffer, Scenario } from '../engine/types';
import { useComparison } from '../hooks/useComparison';
import { promoHeadline } from '../lib/promoDisplay';
import { useAppStore } from '../store/useAppStore';
import NotFound from './NotFound';

const isScenario = (s?: string): s is Scenario => s === 'food' || s === 'grocery' || s === 'pharmacy';

/**
 * Guided Checkout. Perq cannot place an order or move a basket into another app, so this page is a checklist for doing it
 * yourself: what to add, which vouchers to use (with codes to copy), what is applied automatically, the estimated total,
 * and a link to open the app. Everything shown as applied comes from the chosen offer; nothing is made up.
 */
export default function ShoppingGuide() {
  const { scenario, listingId } = useParams();
  if (!isScenario(scenario) || !listingId) return <NotFound />;
  return <Guide scenario={scenario} listingId={listingId} />;
}

function Blocked({ scenario, title, text }: { scenario: Scenario; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-[720px] pb-8">
      <EmptyState title={title} text={text}>
        <ButtonLink to={`/compare/${scenario}`}>Back to Compare</ButtonLink>
      </EmptyState>
    </div>
  );
}

function Guide({ scenario, listingId }: { scenario: Scenario; listingId: string }) {
  const comparison = useComparison(scenario);
  const custom = useAppStore((s) => s.wallet.custom);
  const [ticked, setTicked] = useState<string[]>([]);

  const offer = comparison.ranked.find((o) => o.listingId === listingId);
  if (!offer) {
    const partial = comparison.incomplete.find((o) => o.listingId === listingId);
    if (partial) {
      const missing = partial.missing.map((id) => productById.get(id)?.name ?? id).join(', ');
      return <Blocked scenario={scenario} title="This store can't deliver your whole basket" text={`${platformName(partial.platformId)} is missing: ${missing}.`} />;
    }
    return <Blocked scenario={scenario} title="Nothing to guide yet" text="Your basket is empty or this app is not in the comparison. Go back to Compare and pick one." />;
  }

  return <GuideBody offer={offer} scenario={scenario} cardLabel={comparison.cardFor[listingId]?.label} custom={custom} ticked={ticked} setTicked={setTicked} />;
}

function GuideBody({
  offer, scenario, cardLabel, custom, ticked, setTicked,
}: {
  offer: PricedOffer;
  scenario: Scenario;
  cardLabel?: string;
  custom: ReturnType<typeof useAppStore.getState>['wallet']['custom'];
  ticked: string[];
  setTicked: (t: string[]) => void;
}) {
  const app = platformName(offer.platformId);
  const merchant = merchantById.get(offer.merchantId);
  const link = verifiedProviderLink(offer.platformId);

  const applied = offer.applied.map((a) => ({ a, promo: findPromo(a.promoId, custom) })).filter((x): x is { a: typeof x.a; promo: NonNullable<typeof x.promo> } => !!x.promo);
  const vouchers = applied.filter(({ promo }) => promo.kind === 'code' || promo.kind === 'bank');
  const automatic = applied.filter(({ promo }) => promo.kind === 'auto' || promo.kind === 'membership');
  const saleLines = offer.lines.filter((l) => l.unitDh < l.regularDh);
  const notApplied = offer.evaluations
    .filter((e) => !offer.applied.some((a) => a.promoId === e.promoId) && !e.reason.startsWith('Expired'))
    .map((e) => ({ e, promo: findPromo(e.promoId, custom) }))
    .filter((x): x is { e: typeof x.e; promo: NonNullable<typeof x.promo> } => !!x.promo && (x.promo.kind === 'code' || x.promo.kind === 'bank'));

  const toggle = (id: string) => setTicked(ticked.includes(id) ? ticked.filter((x) => x !== id) : [...ticked, id]);
  const openButton = link ? (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className={buttonClass('primary', 'w-full')} data-testid="open-provider">
      Open {app} <ExternalLink size={16} aria-hidden="true" />
      <span className="sr-only"> ({link.where}, opens in a new tab)</span>
    </a>
  ) : (
    <p className="rounded-btn border border-line bg-surface px-3 py-3 text-center text-[15px] font-bold" data-testid="open-provider-fallback">
      Open the {app} app on your phone
    </p>
  );

  return (
    <div className="mx-auto max-w-[1000px] space-y-4 pb-44 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-8 lg:space-y-0 lg:pb-8">
      <div className="space-y-4 lg:col-start-1">
        <Link to={`/compare/${scenario}`} className="inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-brand">
          <ArrowLeft size={16} aria-hidden="true" /> Back to Compare
        </Link>

        <div className="flex items-start gap-3 rounded-card border border-line bg-surface p-4" data-testid="guide-header">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-[24px] leading-tight font-extrabold tracking-tight">Shopping guide: {app}</h1>
            <div className="flex flex-wrap items-center gap-2 text-[14px] text-muted">
              <PlatformChip platformId={offer.platformId} />
              {merchant && <span className="font-semibold text-ink">{merchant.name}</span>}
              <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden="true" /> {offer.eta[0]}–{offer.eta[1]} min</span>
            </div>
            {cardLabel && <p className="text-[14px] font-bold text-brand">Pay with your {cardLabel} to get its offer.</p>}
          </div>
        </div>

        <p role="note" className="flex gap-2 rounded-btn bg-pink-50 px-3 py-2.5 text-[14px] leading-snug">
          <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            Perq can't place orders or move your basket into {app}. Add these items in {app} yourself.
            Prices, fees and vouchers here are simulated, so check the final amount in {app}.
          </span>
        </p>

        <section aria-labelledby="guide-items" className="space-y-2">
          <h2 id="guide-items" className="text-[18px] font-extrabold">1. Items to add</h2>
          <ul className="space-y-2">
            {offer.lines.map((l) => {
              const p = productById.get(l.productId);
              if (!p) return null;
              const id = `tick-${l.productId}`;
              return (
                <li key={l.productId} className="flex items-center gap-3 rounded-card border border-line bg-surface p-3" data-testid="guide-item">
                  <ProductThumb product={p} size={56} />
                  <label htmlFor={id} className="min-w-0 flex-1">
                    <span className="block text-[15px] leading-snug font-bold">{l.qty} × {p.name}</span>
                    <span className="block text-[13px] text-muted">
                      {[p.brand, p.size, p.variant, `${fmt(l.unitDh)} each`].filter(Boolean).join(' · ')}
                      {l.unitDh < l.regularDh && <span className="ml-1 font-bold text-save">sale price</span>}
                    </span>
                  </label>
                  <input
                    id={id}
                    type="checkbox"
                    checked={ticked.includes(l.productId)}
                    onChange={() => toggle(l.productId)}
                    className="size-6 shrink-0 accent-[#1A5FD6]"
                    aria-label={`Added ${p.name} in ${app}`}
                  />
                </li>
              );
            })}
          </ul>
          <p className="text-[12px] text-muted">The tick boxes only help you keep track while you shop. They are not saved.</p>
        </section>

        <section aria-labelledby="guide-vouchers" className="space-y-2">
          <h2 id="guide-vouchers" className="text-[18px] font-extrabold">2. Vouchers to use</h2>
          {vouchers.length === 0 ? (
            <p className="rounded-card border border-dashed border-line bg-surface p-4 text-[14px] text-muted">No voucher lowers this total, so there is nothing to enter.</p>
          ) : (
            <ul className="space-y-2">
              {vouchers.map(({ a, promo }) => (
                <li key={promo.id} className="rounded-card border border-line bg-surface p-4" data-testid="guide-voucher" data-promo={promo.id}>
                  <VoucherBenefit promo={promo} size="lg" subtitle={promo.origin === 'user' ? promo.name : undefined} savingLine={`You save ${fmt(a.savingDh)} here`} />
                </li>
              ))}
            </ul>
          )}
          <p className="text-[12px] text-muted">
            Demo codes (starting DEMO-) are made up for this demo and will not work in {app}. A real offer in {app} may use a different code.
          </p>
        </section>

        {(automatic.length > 0 || saleLines.length > 0) && (
          <section aria-labelledby="guide-auto" className="space-y-2">
            <h2 id="guide-auto" className="text-[18px] font-extrabold">Applied without a code</h2>
            <ul className="space-y-2">
              {automatic.map(({ a, promo }) => (
                <li key={promo.id} className="rounded-card border border-line bg-surface p-4" data-testid="guide-automatic" data-promo={promo.id}>
                  <VoucherBenefit promo={promo} size="md" showCopy={false} savingLine={`You save ${fmt(a.savingDh)} here`} />
                </li>
              ))}
              {saleLines.map((l) => (
                <li key={`sale-${l.productId}`} className="rounded-card border border-line bg-surface p-4" data-testid="guide-sale">
                  <p className="text-[17px] font-extrabold">
                    <span className="mr-2 rounded-full bg-pink px-2.5 py-0.5 align-middle text-[12px] font-extrabold tracking-wide">SALE</span>
                    {productById.get(l.productId)?.name}
                  </p>
                  <p className="mt-0.5 text-[14px] text-muted">Sale price {fmt(l.unitDh)} each instead of {fmt(l.regularDh)}. Already in the item price, so no code.</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {notApplied.length > 0 && (
          <details className="rounded-card border border-line bg-surface p-3">
            <summary className="min-h-11 cursor-pointer py-2 text-[14px] font-bold">Saved vouchers that do not apply here ({notApplied.length})</summary>
            <ul className="space-y-2 pt-1">
              {notApplied.map(({ e, promo }) => (
                <li key={promo.id} className="text-[13px] leading-snug">
                  <strong>{promoHeadline(promo)}</strong>{promo.code ? ` (${promo.code})` : ''}: {e.reason}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <aside aria-label="Estimate and open the app" className="space-y-3 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:self-start">
        <section aria-labelledby="guide-total" className="space-y-3 rounded-card border border-line bg-surface p-4">
          <h2 id="guide-total" className="text-[16px] font-extrabold">Estimated total (simulated prices)</h2>
          <Receipt offer={offer} />
          <div className="flex items-baseline justify-between border-t border-line pt-2">
            <span className="text-[13px] text-muted">You pay about</span>
            <Money dh={offer.totalDh} className="text-[26px] leading-none" />
          </div>
        </section>
        <div className="hidden space-y-2 lg:block">
          {openButton}
          <p className="text-center text-[12px] text-muted">Your Perq basket stays saved.</p>
        </div>
      </aside>

      <div className="fixed inset-x-0 z-20 px-4 lg:hidden" style={{ bottom: 'calc(64px + env(safe-area-inset-bottom) + 8px)' }} data-testid="guide-bar">
        <div className="mx-auto max-w-[600px] space-y-1 rounded-card border border-line bg-surface p-2 shadow-lg">
          {openButton}
          <p className="text-center text-[12px] text-muted">Estimated {fmt(offer.totalDh)} · Your Perq basket stays saved.</p>
        </div>
      </div>
    </div>
  );
}

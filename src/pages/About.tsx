import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { sources } from '../data/sources';
import { CLASS_HELP, CLASS_LABEL } from '../lib/promoText';
import { APP_NAME } from '../config';
import Button from '../components/ui/Button';
import { useAppStore } from '../store/useAppStore';

const EVIDENCE: Record<string, string> = {
  read_directly: 'Page read directly',
  search_snippet: 'Seen in a search result only',
  third_party: 'Third-party source',
};

export default function About() {
  const resetDemo = useAppStore((s) => s.resetDemo);
  const [done, setDone] = useState(false);

  return (
    <div className="max-w-2xl space-y-6 pb-8">
      <h1 className="text-[24px] font-extrabold tracking-tight">About this prototype</h1>

      <section className="space-y-2">
        <p className="text-[17px]">
          {APP_NAME} was built for the MES Youth Hackathon 2026 (Smarter Qatar). It shows what you would actually pay for the same basket on
          different apps, after delivery fees, service fees and vouchers.
        </p>
        <p className="rounded-card bg-brand-soft px-4 py-3 text-[15px] font-semibold text-brand">
          Every price, fee, delivery time, availability and voucher here is simulated. Nothing is a live offer from Talabat, Snoonu,
          Rafeeq, Keeta, Ninja, Carrefour, Lulu, Kulud or Wellcare. We use their names only to make the demo realistic, and no logos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-[17px] font-extrabold">How we label vouchers</h2>
        <ul className="space-y-2">
          {(Object.keys(CLASS_LABEL) as (keyof typeof CLASS_LABEL)[]).map((k) => (
            <li key={k} className="text-[15px]"><strong>{CLASS_LABEL[k]}:</strong> {CLASS_HELP[k]}</li>
          ))}
          <li className="text-[15px]"><strong>Your voucher:</strong> one you added yourself.</li>
        </ul>
        <p className="text-[14px] text-muted">
          Conditions marked "check in the app" cannot be verified here, such as per-customer usage limits. Every demo code starts with DEMO-.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-[17px] font-extrabold">What we looked at</h2>
        <p className="text-[14px] text-muted">
          These pages shaped the kinds of offers we modelled. They do not mean any offer is currently available. Only the Jollibee menu prices
          were read from an official page; delivery and service fees are our own assumptions.
        </p>
        <ul className="space-y-2">
          {sources.map((s) => (
            <li key={s.id} className="text-[14px]">
              <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 font-bold text-brand underline">
                {s.title} <ExternalLink size={13} aria-hidden="true" />
              </a>
              <span className="block text-muted">{EVIDENCE[s.evidence]} · {s.accessed}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-[17px] font-extrabold">Not simulated yet</h2>
        <ul className="list-disc space-y-1 pl-5 text-[15px]">
          <li>Loyalty points (talabat, Wellcare), late-delivery compensation and buy-one-get-one offers.</li>
          <li>Per-customer usage counts and live prices (this would need real platform data).</li>
          <li>Non-food product-delivery shops. The data model supports them, so they are a next step.</li>
          <li>Prescription medicines: not included on purpose.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-[17px] font-extrabold">Start fresh</h2>
        <p className="text-[14px] text-muted">Clears your baskets, saved vouchers and choices on this device.</p>
        <Button variant="secondary" onClick={() => { resetDemo(); setDone(true); }}>Reset demo</Button>
        {done && <p role="status" className="text-[14px] font-semibold text-save">Demo reset. Your baskets and vouchers were cleared.</p>}
      </section>
    </div>
  );
}

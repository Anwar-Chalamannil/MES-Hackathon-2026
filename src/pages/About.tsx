import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { DISH_ALT, DISH_CREDITS } from '../data/images';
import { sources } from '../data/sources';
import { CLASS_HELP, CLASS_LABEL } from '../lib/promoText';
import { APP_NAME } from '../config';
import Logo from '../components/brand/Logo';
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
      <Logo variant="lockup" height={170} />
      <h1 className="text-[24px] font-extrabold tracking-tight">About {APP_NAME}</h1>

      <section className="space-y-2">
        <p className="text-[17px]">
          {APP_NAME} was built for the MES Youth Hackathon 2026 (Smarter Qatar). It shows what you would actually pay for the same basket on
          different apps, after delivery fees, service fees and vouchers.
        </p>
        <p className="rounded-card bg-pink-50 px-4 py-3 text-[15px] font-semibold text-ink">
          Every price, fee, delivery time, availability and voucher here is simulated. Nothing is a live offer from Talabat, Snoonu,
          Rafeeq, Keeta, Ninja, Carrefour, Lulu, Kulud or Wellcare. We use their names to make the demo realistic.
          {' '}{APP_NAME} is not affiliated with any of these brands.
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
              <span className="block text-muted">{EVIDENCE[s.evidence]}, {s.accessed}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2" aria-labelledby="credits-title">
        <h2 id="credits-title" className="text-[17px] font-extrabold">Images and credits</h2>
        <p className="text-[15px]">
          Logos and brand names belong to their owners and are shown only to identify the places in this demo. {APP_NAME} is not affiliated with the brands shown.
          Food photos are illustrative stock images, not the exact item. Product photos were taken by the team.
        </p>
        {Object.keys(DISH_CREDITS).length > 0 && (
          <ul className="space-y-1 text-[14px]">
            {Object.entries(DISH_CREDITS).map(([key, c]) => (
              <li key={key}>
                {DISH_ALT[key] ?? key}: photo by{' '}
                <a href={c.url} target="_blank" rel="noreferrer" className="font-bold text-brand underline">{c.author}</a> on {c.source}
              </li>
            ))}
          </ul>
        )}
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

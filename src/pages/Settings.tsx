import { Link } from 'react-router';
import { CreditCard } from 'lucide-react';
import ChooseCards from '../components/cards/ChooseCards';

/** Settings. For now one subsection, "My cards"; the page is built to take more later. */
export default function Settings() {
  return (
    <div className="mx-auto max-w-[720px] space-y-5 pb-8">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-[15px] text-muted">Your choices stay on this device.</p>
      </div>

      <section aria-labelledby="my-cards-title" className="space-y-3 rounded-card border border-line bg-surface p-4">
        <h2 id="my-cards-title" className="flex items-center gap-2 text-[18px] font-extrabold">
          <CreditCard size={20} className="text-brand" aria-hidden="true" /> My cards
        </h2>
        <p className="text-[14px] text-muted">
          Pick the cards you use. Perq checks each one against card-only offers; general vouchers stay visible to everyone.
          Offers are matched on bank, network and card tier in our demo data, so always check the terms in the app.
        </p>
        <ChooseCards mode="settings" />
      </section>

      <p className="text-[13px] text-muted">
        Want to see how a card changes the result? <Link to="/compare" className="font-bold text-brand underline underline-offset-4">Open Compare</Link>.
      </p>
    </div>
  );
}

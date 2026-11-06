import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Play, Scale } from 'lucide-react';
import { heroBasket, loadDemoBasket, wouldReplaceFood } from '../../lib/demoBasket';
import { compareTarget } from '../../lib/compareTarget';
import { merchantById } from '../../data/lookup';
import { useAppStore } from '../../store/useAppStore';
import ReplaceBasketDialog from '../basket/ReplaceBasketDialog';
import Button, { ButtonLink } from '../ui/Button';
import SkylineArt from './SkylineArt';

/** The first thing a judge sees: what Perq does, and two ways to try it. */
export default function HeroBanner() {
  const navigate = useNavigate();
  const baskets = useAppStore((s) => s.baskets);
  const active = useAppStore((s) => s.activeScenario);
  const [confirm, setConfirm] = useState(false);

  const tryDemo = () => {
    if (wouldReplaceFood(heroBasket())) setConfirm(true);
    else navigate(`/compare/${loadDemoBasket()}`);
  };
  const current = baskets.food.merchantId ? merchantById.get(baskets.food.merchantId)?.name : undefined;

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden rounded-[24px] bg-pink-50 px-5 pt-6 pb-0 shadow-card lg:px-10 lg:pt-10">
      <div className="relative z-10 max-w-[28rem] lg:max-w-none">
        <h1 id="hero-title" className="text-[36px] leading-[1.02] font-extrabold tracking-[-0.02em] lg:text-[52px]">
          Compare smarter.
          <br />
          <em className="text-blue italic">Save more.</em>
        </h1>
        <p className="mt-3 max-w-[34ch] text-[16px] leading-snug text-muted lg:text-[17px]">
          The menu price is not what you pay. Perq shows the final total on each app, after fees and vouchers.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <ButtonLink to={compareTarget(baskets, active)} className="min-h-12 rounded-full px-6 text-[16px]">
            <Scale size={18} aria-hidden="true" /> Compare now
          </ButtonLink>
          <Button variant="secondary" onClick={tryDemo} className="min-h-12 rounded-full px-6 text-[16px]">
            <Play size={16} aria-hidden="true" /> Try a demo basket
          </Button>
        </div>
      </div>
      <SkylineArt className="-mx-5 mt-4 block h-auto w-[calc(100%+2.5rem)] lg:mx-0 lg:mt-0 lg:h-[130px] lg:w-full" />

      <ReplaceBasketDialog
        open={confirm}
        fromName={current ?? 'current'}
        toName="Jollibee"
        onConfirm={() => { setConfirm(false); navigate(`/compare/${loadDemoBasket()}`); }}
        onCancel={() => setConfirm(false)}
      />
    </section>
  );
}

import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import LiveComparison from '../components/home/LiveComparison';
import { ButtonLink } from '../components/ui/Button';

const CATEGORIES = [
  { to: '/food', title: 'Food delivery', text: 'Restaurants on Talabat, Snoonu, Rafeeq and Keeta' },
  { to: '/grocery', title: 'Groceries', text: 'Carrefour, Lulu, Ninja and the delivery apps' },
  { to: '/pharmacy', title: 'Pharmacy and care', text: 'Skincare and personal care, no medicines' },
] as const;

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-6 lg:grid lg:grid-cols-[1fr_1fr] lg:grid-rows-[auto_auto_1fr] lg:gap-x-14 lg:gap-y-6 lg:space-y-0">
        <div className="lg:col-start-1 lg:row-start-1">
          <h1 className="text-[42px] leading-[0.98] font-extrabold tracking-[-0.03em] lg:text-[72px]">
            Same meal.
            <br />
            Four totals.
          </h1>
          <p className="mt-3 max-w-[36ch] text-[17px] leading-snug text-muted lg:mt-4 lg:text-[18px]">
            Fees, vouchers and your card decide what you pay, not the menu price.
          </p>
        </div>

        <div className="lg:col-start-2 lg:row-span-3 lg:row-start-1">
          <LiveComparison />
        </div>

        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <ButtonLink to="/food" className="min-h-12 w-full px-6 text-[16px] sm:w-auto">
            Compare your own basket
          </ButtonLink>
        </div>
      </section>

      <nav aria-label="Categories">
        <ul className="border-t border-line">
          {CATEGORIES.map((c) => (
            <li key={c.to} className="border-b border-line">
              <Link to={c.to} className="flex min-h-16 items-center gap-4 py-3 active:bg-brand-soft">
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[22px] leading-tight font-bold">{c.title}</span>
                  <span className="block text-[15px] text-muted">{c.text}</span>
                </span>
                <ChevronRight size={22} aria-hidden="true" className="shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

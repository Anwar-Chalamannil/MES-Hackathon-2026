import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Scale, Search } from 'lucide-react';
import CategoryTiles from '../components/home/CategoryTiles';
import FeaturedSavings from '../components/home/FeaturedSavings';
import HeroBanner from '../components/home/HeroBanner';
import LiveComparison from '../components/home/LiveComparison';
import VoucherHighlights from '../components/home/VoucherHighlights';
import { ButtonLink } from '../components/ui/Button';
import { compareTarget } from '../lib/compareTarget';
import { useAppStore } from '../store/useAppStore';

/**
 * Phones: search, hero, categories, live comparison, featured savings, vouchers ending soon.
 * Desktop: the live comparison moves to a right rail beside the same content (one component, placed by the grid).
 */
export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const baskets = useAppStore((s) => s.baskets);
  const active = useAppStore((s) => s.activeScenario);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <div className="space-y-6 pb-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-x-8 lg:gap-y-8 lg:space-y-0">
      <form role="search" onSubmit={submit} className="relative lg:hidden">
        <label className="block">
          <span className="sr-only">Search restaurants, products and apps</span>
          <Search size={20} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search restaurants, products or apps"
            className="min-h-12 w-full rounded-full border border-control bg-surface pr-4 pl-12 text-[16px] placeholder:text-muted"
          />
        </label>
      </form>

      <div className="lg:col-start-1"><HeroBanner /></div>
      <div className="lg:col-start-1"><CategoryTiles /></div>

      <section
        aria-labelledby="live-title"
        className="rounded-[20px] border border-line bg-surface p-4 shadow-card lg:sticky lg:top-24 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start lg:p-5"
      >
        <h2 id="live-title" className="mb-3 text-[20px] font-extrabold">
          <span className="lg:hidden">Watch the winner change</span>
          <span className="hidden lg:inline">Compare prices</span>
        </h2>
        <LiveComparison />
        <ButtonLink to={compareTarget(baskets, active)} className="mt-4 hidden w-full rounded-full lg:inline-flex">
          <Scale size={18} aria-hidden="true" /> Compare your basket
        </ButtonLink>
      </section>

      <div className="min-w-0 lg:col-start-1"><FeaturedSavings /></div>
      <div className="lg:col-start-1"><VoucherHighlights /></div>
    </div>
  );
}

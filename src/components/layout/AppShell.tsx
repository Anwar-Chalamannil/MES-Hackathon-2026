import { Outlet } from 'react-router';
import BottomNav from './BottomNav';
import SimulatedBanner from './SimulatedBanner';
import TopNav from './TopNav';

export default function AppShell() {
  return (
    <div className="min-h-dvh">
      <TopNav />
      <SimulatedBanner />
      <main className="mx-auto max-w-[1120px] px-4 pt-6 pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-12">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

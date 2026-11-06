import { Navigate, Route, Routes, useParams } from 'react-router';
import AppShell from './components/layout/AppShell';
import About from './pages/About';
import Compare from './pages/Compare';
import CompareHub from './pages/CompareHub';
import Expiry from './pages/Expiry';
import Food from './pages/Food';
import FoodMenu from './pages/FoodMenu';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import ScenarioShop from './pages/ScenarioShop';
import Search from './pages/Search';
import { EditVoucher, NewVoucher } from './pages/VoucherEdit';
import VoucherDetail from './pages/VoucherDetail';
import Wallet from './pages/Wallet';

/** Old links keep working: /wallet/:id used to be the edit page. */
function LegacyEdit() {
  const { id } = useParams();
  return <Navigate to={`/vouchers/${id}/edit`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="food" element={<Food />} />
        <Route path="food/:merchantId" element={<FoodMenu />} />
        <Route path="grocery" element={<ScenarioShop scenario="grocery" />} />
        <Route path="pharmacy" element={<ScenarioShop scenario="pharmacy" />} />
        <Route path="compare" element={<CompareHub />} />
        <Route path="compare/:scenario" element={<Compare />} />
        <Route path="vouchers" element={<Wallet />} />
        <Route path="vouchers/new" element={<NewVoucher />} />
        <Route path="vouchers/expiry" element={<Expiry />} />
        <Route path="vouchers/:id" element={<VoucherDetail />} />
        <Route path="vouchers/:id/edit" element={<EditVoucher />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="wallet" element={<Navigate to="/vouchers" replace />} />
        <Route path="wallet/new" element={<Navigate to="/vouchers/new" replace />} />
        <Route path="wallet/:id" element={<LegacyEdit />} />
        <Route path="expiry" element={<Navigate to="/vouchers/expiry" replace />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

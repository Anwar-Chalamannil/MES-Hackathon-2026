import { Route, Routes } from 'react-router';
import AppShell from './components/layout/AppShell';
import About from './pages/About';
import Compare from './pages/Compare';
import Food from './pages/Food';
import FoodMenu from './pages/FoodMenu';
import Home from './pages/Home';
import Expiry from './pages/Expiry';
import NotFound from './pages/NotFound';
import ScenarioShop from './pages/ScenarioShop';
import { EditVoucher, NewVoucher } from './pages/VoucherEdit';
import Wallet from './pages/Wallet';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="food" element={<Food />} />
        <Route path="food/:merchantId" element={<FoodMenu />} />
        <Route path="grocery" element={<ScenarioShop scenario="grocery" />} />
        <Route path="pharmacy" element={<ScenarioShop scenario="pharmacy" />} />
        <Route path="compare/:scenario" element={<Compare />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="wallet/new" element={<NewVoucher />} />
        <Route path="wallet/:id" element={<EditVoucher />} />
        <Route path="expiry" element={<Expiry />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

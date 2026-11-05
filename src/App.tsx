import { Route, Routes } from 'react-router';
import AppShell from './components/layout/AppShell';
import About from './pages/About';
import Compare from './pages/Compare';
import Food from './pages/Food';
import FoodMenu from './pages/FoodMenu';
import Home from './pages/Home';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="food" element={<Food />} />
        <Route path="food/:merchantId" element={<FoodMenu />} />
        <Route path="grocery" element={<Placeholder title="Groceries" phase="P7" />} />
        <Route path="pharmacy" element={<Placeholder title="Pharmacy & care" phase="P7" />} />
        <Route path="compare/:scenario" element={<Compare />} />
        <Route path="wallet" element={<Placeholder title="Voucher wallet" phase="P6" />} />
        <Route path="wallet/new" element={<Placeholder title="New voucher" phase="P6" />} />
        <Route path="wallet/:id" element={<Placeholder title="Edit voucher" phase="P6" />} />
        <Route path="expiry" element={<Placeholder title="Voucher expiry" phase="P6" />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Route>
    </Routes>
  );
}

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const posLinks = [
  { to: '/pos/sales', label: 'Sales POS', icon: '💰' },
  { to: '/pos/receipts', label: 'Receipts', icon: '🧾' },
];

export default function POSLayout() {
  return (
    <div className="layout">
      <Sidebar links={posLinks} title="Sales POS" />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const adminLinks = [
  { to: '/admin/home', label: 'Home', icon: '🏠' },
  { to: '/admin/menu', label: 'Menu', icon: '🍽️' },
  { to: '/admin/stocks', label: 'Stocks & Bills', icon: '📦' },
  { to: '/admin/receipts', label: 'Receipts', icon: '🧾' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📊' },
  { to: '/admin/accounts', label: 'Accounts', icon: '👥' },
];

export default function AdminLayout() {
  return (
    <div className="layout">
      <Sidebar links={adminLinks} title="Admin Dashboard" />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

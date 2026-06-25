import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import POSLayout from './layouts/POSLayout';
import Login from './pages/Login';
import AdminHome from './pages/admin/AdminHome';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminStocks from './pages/admin/AdminStocks';
import AdminReceipts from './pages/admin/AdminReceipts';
import AdminAccounts from './pages/admin/AdminAccounts';
import AdminMenu from './pages/admin/AdminMenu';
import POSSales from './pages/pos/POSSales';
import POSReceipts from './pages/pos/POSReceipts';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<AdminHome />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="stocks" element={<AdminStocks />} />
              <Route path="receipts" element={<AdminReceipts />} />
              <Route path="accounts" element={<AdminAccounts />} />
              <Route path="menu" element={<AdminMenu />} />
            </Route>
            <Route
              path="/pos"
              element={
                <ProtectedRoute role="salesperson">
                  <POSLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="sales" replace />} />
              <Route path="sales" element={<POSSales />} />
              <Route path="receipts" element={<POSReceipts />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

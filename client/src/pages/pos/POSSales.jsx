import { useEffect, useState } from 'react';
import { getMenuItems } from '../../api/menu';
import { createReceipt } from '../../api/receipts';
import { verifyCoupon } from '../../api/coupons';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { formatCurrency } from '../../utils/helpers';

export default function POSSales() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [manualDiscount, setManualDiscount] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [verifiedCoupon, setVerifiedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMenuItems()
      .then((data) => setMenu(data.filter((i) => i.isAvailable !== false)))
      .catch(() => setError('Failed to load menu.'))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem === item._id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem === item._id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { menuItem: item._id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const updateQty = (menuItemId, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.menuItem === menuItemId ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const discountPct = verifiedCoupon
    ? verifiedCoupon.discountPercent
    : manualDiscount
      ? Math.min(100, Math.max(0, Number(manualDiscount)))
      : 0;
  const discountAmount = (subtotal * discountPct) / 100;
  const total = Math.max(0, subtotal - discountAmount);

  const handleVerifyCoupon = async () => {
    setCouponError('');
    try {
      const result = await verifyCoupon(couponCode);
      setVerifiedCoupon(result);
      setManualDiscount('');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon.');
      setVerifiedCoupon(null);
    }
  };

  const handleSubmit = async () => {
    if (!customer.name.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (cart.length === 0) {
      setError('Add at least one item.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const receipt = await createReceipt({
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        items: cart,
        discountPercent: verifiedCoupon ? undefined : manualDiscount || undefined,
        couponCode: verifiedCoupon?.code,
      });
      setToast(`Receipt ${receipt.receiptNumber} created!`);
      setCart([]);
      setCustomer({ name: '', phone: '', email: '' });
      setManualDiscount('');
      setCouponCode('');
      setVerifiedCoupon(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create receipt.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page pos-page">
      <h1>Sales POS</h1>
      {error && <p className="error-msg">{error}</p>}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="pos-grid">
        <section className="pos-column card">
          <h2>Menu</h2>
          <div className="menu-grid compact">
            {menu.map((item) => (
              <button key={item._id} className="menu-item-btn" onClick={() => addToCart(item)}>
                <span>{item.emoji}</span>
                <span>{item.name}</span>
                <span>{formatCurrency(item.price)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="pos-column card">
          <h2>Customer & Order</h2>
          <div className="form-group">
            <label>Name *</label>
            <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Discount % (manual)</label>
            <input type="number" min="0" max="100" value={manualDiscount}
              disabled={!!verifiedCoupon}
              onChange={(e) => setManualDiscount(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Coupon Code</label>
            <div className="coupon-row">
              <input value={couponCode} disabled={!!verifiedCoupon}
                onChange={(e) => setCouponCode(e.target.value)} />
              {!verifiedCoupon && (
                <button className="btn btn-primary" onClick={handleVerifyCoupon}>Verify</button>
              )}
            </div>
            {couponError && <p className="error-msg">{couponError}</p>}
            {verifiedCoupon && (
              <span className="badge success">{verifiedCoupon.code} — {verifiedCoupon.discountPercent}% off</span>
            )}
          </div>
        </section>

        <section className="pos-column card">
          <h2>Checkout</h2>
          <ul className="cart-list">
            {cart.map((item) => (
              <li key={item.menuItem} className="cart-item">
                <span>{item.name}</span>
                <div className="qty-controls">
                  <button onClick={() => updateQty(item.menuItem, -1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.menuItem, 1)}>+</button>
                </div>
                <span>{formatCurrency(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="checkout-totals">
            <p>Subtotal: {formatCurrency(subtotal)}</p>
            {discountAmount > 0 && <p>Discount: -{formatCurrency(discountAmount)}</p>}
            <p className="total-line"><strong>Total: {formatCurrency(total)}</strong></p>
          </div>
          <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Processing...' : 'Generate Receipt'}
          </button>
        </section>
      </div>
    </div>
  );
}

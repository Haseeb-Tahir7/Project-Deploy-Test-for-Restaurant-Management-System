import { useEffect, useState } from 'react';
import { getStock, getStockHistory, createStock } from '../../api/stock';
import { getBills, getBillHistory, createBill } from '../../api/bills';
import EmojiPicker from '../../components/EmojiPicker';
import LoadingSpinner from '../../components/LoadingSpinner';
import { groupByDate, formatCurrency, getFileUrl } from '../../utils/helpers';

export default function AdminStocks() {
  const [stocks, setStocks] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showBillForm, setShowBillForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [billHistory, setBillHistory] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({ search: '', startDate: '', endDate: '' });
  const [form, setForm] = useState({
    emoji: '📦', name: '', price: '', quantity: '', unit: 'kg', description: '',
  });
  const [billForm, setBillForm] = useState({ name: '', amount: '', file: null });
  const [submittingBill, setSubmittingBill] = useState(false);

  const fetchData = async () => {
    try {
      const [stockData, billData] = await Promise.all([getStock(), getBills()]);
      setStocks(stockData);
      setBills(billData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.quantity || !form.unit) {
      setError('Name, price, quantity, and unit are required.');
      return;
    }
    await createStock(form);
    setForm({ emoji: '📦', name: '', price: '', quantity: '', unit: 'kg', description: '' });
    setShowForm(false);
    fetchData();
  };

  const handleBillSubmit = async (e) => {
    e.preventDefault();
    if (!billForm.name || !billForm.amount || !billForm.file) {
      setError('Bill name, amount, and image file are required.');
      return;
    }
    setSubmittingBill(true);
    try {
      const data = new FormData();
      data.append('name', billForm.name);
      data.append('amount', billForm.amount);
      data.append('file', billForm.file);
      await createBill(data);
      setBillForm({ name: '', amount: '', file: null });
      setShowBillForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bill.');
    } finally {
      setSubmittingBill(false);
    }
  };

  const searchHistory = async () => {
    const [stockResults, billResults] = await Promise.all([
      getStockHistory(historyFilters),
      getBillHistory(historyFilters),
    ]);
    setHistory(stockResults);
    setBillHistory(billResults);
  };

  const groupedStocks = groupByDate(stocks, 'date');
  const groupedBills = groupByDate(bills, 'date');
  const allDates = [...new Set([...Object.keys(groupedStocks), ...Object.keys(groupedBills)])];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="section-header">
        <h1>Stocks & Billings</h1>
        <div className="btn-group">
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setShowBillForm(false); }}>
            Add Stock
          </button>
          <button className="btn btn-primary" onClick={() => { setShowBillForm(!showBillForm); setShowForm(false); }}>
            Add Billing
          </button>
          <button className="btn" onClick={() => setShowHistory(!showHistory)}>History</button>
        </div>
      </div>
      {error && <p className="error-msg">{error}</p>}

      {showForm && (
        <form className="card inline-form" onSubmit={handleSubmit}>
          <h3>Add Stock</h3>
          <EmojiPicker value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e })} />
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input type="number" min="0" step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="0" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary">Save Stock</button>
        </form>
      )}

      {showBillForm && (
        <form className="card inline-form" onSubmit={handleBillSubmit}>
          <h3>Add Billing</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Bill Name</label>
              <input value={billForm.name} onChange={(e) => setBillForm({ ...billForm, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Amount (Rs)</label>
              <input type="number" min="0" step="0.01" value={billForm.amount}
                onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Bill Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBillForm({ ...billForm, file: e.target.files?.[0] || null })}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submittingBill}>
            {submittingBill ? 'Saving...' : 'Save Billing'}
          </button>
        </form>
      )}

      {showHistory && (
        <div className="modal-overlay">
          <div className="modal card">
            <h3>History</h3>
            <div className="form-row">
              <input placeholder="Search by name" value={historyFilters.search}
                onChange={(e) => setHistoryFilters({ ...historyFilters, search: e.target.value })} />
              <input type="date" value={historyFilters.startDate}
                onChange={(e) => setHistoryFilters({ ...historyFilters, startDate: e.target.value })} />
              <input type="date" value={historyFilters.endDate}
                onChange={(e) => setHistoryFilters({ ...historyFilters, endDate: e.target.value })} />
              <button className="btn btn-primary" onClick={searchHistory}>Search</button>
            </div>
            <div className="history-list">
              {history.map((s) => (
                <div key={s._id} className="stock-card card">
                  <span>{s.emoji}</span> Stock: {s.name} — {s.quantity} {s.unit} — {formatCurrency(s.price)}
                </div>
              ))}
              {billHistory.map((b) => (
                <div key={b._id} className="stock-card card">
                  🧾 Bill: {b.name} — {formatCurrency(b.amount)}
                </div>
              ))}
            </div>
            <button className="btn" onClick={() => setShowHistory(false)}>Close</button>
          </div>
        </div>
      )}

      {allDates.map((date) => (
        <section key={date} className="section">
          <h2 className="date-header">{date}</h2>
          {(groupedStocks[date] || []).length > 0 && (
            <>
              <h3 className="subsection-title">Stocks</h3>
              <div className="stock-grid">
                {(groupedStocks[date] || []).map((s) => (
                  <div key={s._id} className="card stock-card">
                    <span className="menu-emoji">{s.emoji}</span>
                    <h3>{s.name}</h3>
                    <p>{formatCurrency(s.price)} · {s.quantity} {s.unit}</p>
                    {s.description && <p className="text-muted">{s.description}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
          {(groupedBills[date] || []).length > 0 && (
            <>
              <h3 className="subsection-title">Billings</h3>
              <div className="stock-grid">
                {(groupedBills[date] || []).map((b) => (
                  <div key={b._id} className="card bill-card">
                    <h3>{b.name}</h3>
                    <p>{formatCurrency(b.amount)}</p>
                    <a href={getFileUrl(b.filePath)} target="_blank" rel="noreferrer" className="bill-link">
                      View Bill Image
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      ))}
    </div>
  );
}

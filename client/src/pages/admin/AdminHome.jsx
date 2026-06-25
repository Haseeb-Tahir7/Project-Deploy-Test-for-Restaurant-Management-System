import { useEffect, useState } from 'react';
import { getReceiptStats } from '../../api/receipts';
import { getNotes, createNote, updateNote, deleteNote } from '../../api/notes';
import { getCoupons, createCoupon, deactivateCoupon } from '../../api/coupons';
import { setTodayExpenditure } from '../../api/expenditure';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [couponMode, setCouponMode] = useState('auto');
  const [generatedCode, setGeneratedCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [expenditureInput, setExpenditureInput] = useState('');
  const [savingExpenditure, setSavingExpenditure] = useState(false);
  const [expenditureLocked, setExpenditureLocked] = useState(false);
  const [editingExpenditure, setEditingExpenditure] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, notesData, couponsData] = await Promise.all([
        getReceiptStats(),
        getNotes(),
        getCoupons(),
      ]);
      setStats(statsData);
      setExpenditureInput(String(statsData.todayExpenditure ?? 0));
      setExpenditureLocked(statsData.expenditureLocked ?? false);
      setEditingExpenditure(false);
      setNotes(notesData);
      setCoupons(couponsData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveExpenditure = async () => {
    const amount = Number(expenditureInput);
    if (Number.isNaN(amount) || amount < 0) {
      setError('Expenditure must be a non-negative number.');
      return;
    }
    setSavingExpenditure(true);
    try {
      await setTodayExpenditure(amount);
      setEditingExpenditure(false);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expenditure.');
    } finally {
      setSavingExpenditure(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await createNote(newNote);
    setNewNote('');
    setShowAddNote(false);
    fetchData();
  };

  const handleUpdateNote = async (id) => {
    if (!editContent.trim()) return;
    await updateNote(id, editContent);
    setEditId(null);
    fetchData();
  };

  const handleDeleteNote = async (id) => {
    if (!confirm('Delete this note?')) return;
    await deleteNote(id);
    fetchData();
  };

  const handleCreateCoupon = async () => {
    const pct = Number(discountPercent);
    if (!pct || pct < 1 || pct > 100) {
      setError('Discount must be between 1 and 100.');
      return;
    }
    if (couponMode === 'custom' && !customCode.trim()) {
      setError('Enter a custom coupon code.');
      return;
    }
    setCouponLoading(true);
    try {
      const coupon = await createCoupon(
        pct,
        couponMode === 'custom' ? customCode.trim() : undefined
      );
      setGeneratedCode(coupon.code);
      setDiscountPercent('');
      setCustomCode('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const handleDeactivate = async (id) => {
    await deactivateCoupon(id);
    fetchData();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <h1>Dashboard</h1>
      {error && <p className="error-msg">{error}</p>}

      <div className="stats-grid">
        <StatCard title="Total Sales" value={stats?.totalSales ?? 0} icon="📊" />
        <StatCard title="Revenue Today" value={formatCurrency(stats?.revenueToday ?? 0)} icon="💵" />
        <StatCard title="Monthly Revenue" value={formatCurrency(stats?.monthlyRevenue ?? 0)} icon="📈" />
        <StatCard title="Today's Profit" value={formatCurrency(stats?.todayProfit ?? 0)} icon="✅" />
        <StatCard title="Today's Loss" value={formatCurrency(stats?.todayLoss ?? 0)} icon="⚠️" />
      </div>

      <section className="section dashboard-section">
        <h2>Today&apos;s Expenditure</h2>
        <div className="inline-form card expenditure-form">
          <p className="text-muted">
            Net profit = today&apos;s revenue − (operating costs + today&apos;s bills). Net loss when costs exceed revenue.
          </p>
          {expenditureLocked && !editingExpenditure ? (
            <div className="expenditure-locked">
              <div className="expenditure-locked-amount">
                <span className="text-muted">Saved for today</span>
                <strong>{formatCurrency(stats?.todayExpenditure ?? 0)}</strong>
                <span className="badge success">Locked</span>
              </div>
              <button className="btn" onClick={() => setEditingExpenditure(true)}>Edit</button>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>Amount (Rs)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={expenditureInput}
                  onChange={(e) => setExpenditureInput(e.target.value)}
                />
              </div>
              <div className="btn-group">
                <button className="btn btn-primary" onClick={handleSaveExpenditure} disabled={savingExpenditure}>
                  {savingExpenditure ? 'Saving...' : expenditureLocked ? 'Update' : 'Save Expenditure'}
                </button>
                {expenditureLocked && (
                  <button
                    className="btn"
                    onClick={() => {
                      setEditingExpenditure(false);
                      setExpenditureInput(String(stats?.todayExpenditure ?? 0));
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section dashboard-section">
        <div className="section-header">
          <h2>Notes</h2>
          <button className="btn btn-primary" onClick={() => setShowAddNote(!showAddNote)}>
            Add Note
          </button>
        </div>
        {showAddNote && (
          <div className="inline-form card">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a note (expires in 24 hours)..."
              rows={3}
            />
            <button className="btn btn-primary" onClick={handleAddNote}>Save</button>
          </div>
        )}
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note._id} className="card note-card">
              {editId === note._id ? (
                <>
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} />
                  <div className="btn-group">
                    <button className="btn btn-primary" onClick={() => handleUpdateNote(note._id)}>Save</button>
                    <button className="btn" onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <p>{note.content}</p>
                  <p className="text-muted">{formatDateTime(note.createdAt)}</p>
                  <div className="btn-group">
                    <button className="btn" onClick={() => { setEditId(note._id); setEditContent(note.content); }}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDeleteNote(note._id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="section dashboard-section">
        <h2>Coupons</h2>
        <div className="coupon-mode-tabs">
          <button
            className={`btn ${couponMode === 'auto' ? 'btn-primary' : ''}`}
            onClick={() => setCouponMode('auto')}
          >
            Auto Generate
          </button>
          <button
            className={`btn ${couponMode === 'custom' ? 'btn-primary' : ''}`}
            onClick={() => setCouponMode('custom')}
          >
            Custom Code
          </button>
        </div>
        <div className="inline-form card">
          <div className="form-row">
            <div className="form-group">
              <label>Discount % (1–100)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
              />
            </div>
            {couponMode === 'custom' && (
              <div className="form-group">
                <label>Custom Code (4–12 chars)</label>
                <input
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="SUMMER25"
                  maxLength={12}
                />
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleCreateCoupon} disabled={couponLoading}>
            {couponLoading ? 'Creating...' : couponMode === 'custom' ? 'Create Custom Coupon' : 'Generate Coupon'}
          </button>
          <p className="text-muted coupon-note">Each coupon can only be used once.</p>
        </div>
        {generatedCode && (
          <div className="generated-code card">
            <span>{generatedCode}</span>
            <button className="btn" onClick={copyCode}>Copy</button>
          </div>
        )}
        <table className="data-table">
          <thead>
            <tr><th>Code</th><th>Discount %</th><th>Type</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td>{c.code}</td>
                <td>{c.discountPercent}%</td>
                <td>{c.isCustom ? 'Custom' : 'Auto'}</td>
                <td>
                  {c.isUsed ? (
                    <span className="badge used">Used</span>
                  ) : c.isActive ? (
                    <span className="badge success">Available</span>
                  ) : (
                    <span className="badge">Inactive</span>
                  )}
                </td>
                <td>
                  {c.isActive && !c.isUsed && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(c._id)}>
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

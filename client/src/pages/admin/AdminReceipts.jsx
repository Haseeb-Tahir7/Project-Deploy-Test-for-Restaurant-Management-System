import { useEffect, useState } from 'react';
import { getReceipts, searchReceipts, getDailyReceipts } from '../../api/receipts';
import { getBills } from '../../api/bills';
import ReceiptCard from '../../components/ReceiptCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { groupByDate, formatCurrency, getLocalDateString, getFileUrl } from '../../utils/helpers';
import { exportReceiptsPDF, exportReceiptsExcel } from '../../utils/exportReceipts';

export default function AdminReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [highlightId, setHighlightId] = useState('');
  const [exportDate, setExportDate] = useState(getLocalDateString());

  const fetchReceipts = async () => {
    try {
      const [receiptData, billData] = await Promise.all([getReceipts(), getBills()]);
      setReceipts(receiptData);
      setBills(billData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load receipts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReceipts(); }, []);

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchReceipts();
      setHighlightId('');
      return;
    }
    const data = await searchReceipts(search);
    setReceipts(data);
    if (data.length === 1) setHighlightId(data[0]._id);
  };

  const handleExportPDF = async () => {
    try {
      const data = await getDailyReceipts(exportDate);
      if (data.length === 0) {
        setError(`No receipts found for ${exportDate}.`);
        return;
      }
      setError('');
      exportReceiptsPDF(data, exportDate);
    } catch (err) {
      setError(err.response?.data?.message || 'Export failed.');
    }
  };

  const handleExportExcel = async () => {
    try {
      const data = await getDailyReceipts(exportDate);
      if (data.length === 0) {
        setError(`No receipts found for ${exportDate}.`);
        return;
      }
      setError('');
      exportReceiptsExcel(data, exportDate);
    } catch (err) {
      setError(err.response?.data?.message || 'Export failed.');
    }
  };

  const groupedReceipts = groupByDate(receipts);
  const groupedBills = groupByDate(bills, 'date');
  const allDates = [...new Set([...Object.keys(groupedReceipts), ...Object.keys(groupedBills)])];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <h1>Sale Receipts</h1>
      {error && <p className="error-msg">{error}</p>}

      <div className="toolbar card">
        <div className="search-bar">
          <input
            placeholder="Search by receipt number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>
        <div className="export-bar">
          <input type="date" value={exportDate} onChange={(e) => setExportDate(e.target.value)} />
          <button className="btn" onClick={handleExportPDF}>Export PDF</button>
          <button className="btn" onClick={handleExportExcel}>Export Excel</button>
        </div>
      </div>

      {allDates.map((date) => (
        <section key={date} className="section">
          <h2 className="date-header">{date}</h2>
          {(groupedReceipts[date] || []).map((r) => (
            <ReceiptCard key={r._id} receipt={r} highlighted={r._id === highlightId} />
          ))}
          {(groupedBills[date] || []).length > 0 && (
            <>
              <h3 className="subsection-title">Daily Billings</h3>
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

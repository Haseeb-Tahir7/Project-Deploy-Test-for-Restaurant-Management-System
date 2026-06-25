import { useEffect, useState } from 'react';
import { getReceipts, searchReceipts } from '../../api/receipts';
import ReceiptCard from '../../components/ReceiptCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { groupByDate } from '../../utils/helpers';

export default function POSReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [highlightId, setHighlightId] = useState('');

  const fetchReceipts = async () => {
    try {
      const data = await getReceipts();
      setReceipts(data);
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

  const grouped = groupByDate(receipts);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <h1>My Receipts</h1>
      {error && <p className="error-msg">{error}</p>}

      <div className="toolbar card search-bar">
        <input
          placeholder="Search by receipt number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
      </div>

      {Object.entries(grouped).map(([date, items]) => (
        <section key={date} className="section">
          <h2 className="date-header">{date}</h2>
          {items.map((r) => (
            <ReceiptCard key={r._id} receipt={r} highlighted={r._id === highlightId} />
          ))}
        </section>
      ))}
    </div>
  );
}

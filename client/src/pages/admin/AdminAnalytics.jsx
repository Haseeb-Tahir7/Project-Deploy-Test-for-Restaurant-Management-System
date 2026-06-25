import { useEffect, useState } from 'react';
import { getAnalytics } from '../../api/analytics';
import PeakHoursChart from '../../components/PeakHoursChart';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';

function getCurrentMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function AdminAnalytics() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getAnalytics(month)
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page analytics-page">
      <div className="section-header">
        <div>
          <h1>Analytics</h1>
          <p className="text-muted">{data?.monthName || 'Monthly overview'}</p>
        </div>
        <input
          type="month"
          className="month-picker"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="stats-grid analytics-stats">
        <StatCard title="Monthly Sales" value={data?.monthlySales ?? 0} icon="🛒" />
        <StatCard title="Total Revenue" value={formatCurrency(data?.monthlyRevenue ?? 0)} icon="💰" />
        <StatCard title="Total Expenses" value={formatCurrency(data?.totalOperatingCosts ?? 0)} icon="💸" />
        <StatCard title="Net Profit" value={formatCurrency(data?.monthlyProfit ?? 0)} icon="📈" />
        <StatCard title="Net Loss" value={formatCurrency(data?.monthlyLoss ?? 0)} icon="📉" />
        <StatCard title="Monthly Bills" value={formatCurrency(data?.monthlyBills ?? 0)} icon="🧾" />
        <StatCard title="Stock Purchases" value={formatCurrency(data?.monthlyStockPurchases ?? 0)} icon="📦" />
      </div>

      <section className="section">
        <div className="card analytics-chart-card">
          <PeakHoursChart peakHours={data?.peakHours ?? []} peakHour={data?.peakHour} />
        </div>
      </section>

      <section className="section">
        <h2>Monthly Breakdown</h2>
        <div className="breakdown-grid">
          <div className="card breakdown-item">
            <span className="text-muted">Total Revenue</span>
            <strong>{formatCurrency(data?.monthlyRevenue ?? 0)}</strong>
          </div>
          <div className="card breakdown-item">
            <span className="text-muted">Operating Costs</span>
            <strong>− {formatCurrency(data?.monthlyExpenditure ?? 0)}</strong>
          </div>
          <div className="card breakdown-item">
            <span className="text-muted">Monthly Bills</span>
            <strong>− {formatCurrency(data?.monthlyBills ?? 0)}</strong>
          </div>
          <div className="card breakdown-item">
            <span className="text-muted">Total Expenses</span>
            <strong>− {formatCurrency(data?.totalOperatingCosts ?? 0)}</strong>
          </div>
          <div className="card breakdown-item">
            <span className="text-muted">Stock Purchases</span>
            <strong>{formatCurrency(data?.monthlyStockPurchases ?? 0)}</strong>
          </div>
          <div className="card breakdown-item profit">
            <span className="text-muted">Net Profit</span>
            <strong>{formatCurrency(data?.monthlyProfit ?? 0)}</strong>
          </div>
          <div className="card breakdown-item loss">
            <span className="text-muted">Net Loss</span>
            <strong>{formatCurrency(data?.monthlyLoss ?? 0)}</strong>
          </div>
        </div>
        <p className="text-muted analytics-note">
          Net Profit = Total Revenue − Operating Costs − Monthly Bills. Stock purchases are tracked separately and are not deducted from profit.
        </p>
      </section>
    </div>
  );
}

import { formatCurrency } from '../utils/helpers';

export default function PeakHoursChart({ peakHours, peakHour }) {
  const maxRevenue = Math.max(...peakHours.map((h) => h.revenue), 1);

  return (
    <div className="peak-chart">
      <div className="peak-chart-header">
        <div>
          <h3>Peak Sales Hours</h3>
          <p className="text-muted">Revenue by hour for the selected month</p>
        </div>
        {peakHour && peakHour.revenue > 0 && (
          <div className="peak-badge card">
            <span className="peak-badge-label">Busiest Hour</span>
            <strong>{peakHour.label}</strong>
            <span>{formatCurrency(peakHour.revenue)} · {peakHour.salesCount} sales</span>
          </div>
        )}
      </div>

      <div className="chart-bars">
        {peakHours.map((h) => {
          const height = (h.revenue / maxRevenue) * 100;
          const isPeak = peakHour && h.hour === peakHour.hour && h.revenue > 0;
          return (
            <div key={h.hour} className="chart-bar-col" title={`${h.label}: ${formatCurrency(h.revenue)}`}>
              <div className="chart-bar-wrap">
                <div
                  className={`chart-bar ${isPeak ? 'peak' : ''}`}
                  style={{ height: `${Math.max(height, h.revenue > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="chart-bar-label">{h.hour % 3 === 0 ? h.label : ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

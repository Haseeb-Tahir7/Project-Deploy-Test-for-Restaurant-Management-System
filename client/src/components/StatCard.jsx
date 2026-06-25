export default function StatCard({ title, value, icon }) {
  return (
    <div className="card stat-card">
      <span className="stat-icon">{icon}</span>
      <div>
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

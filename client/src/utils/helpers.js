export function groupByDate(items, dateKey = 'createdAt') {
  const groups = {};
  items.forEach((item) => {
    const date = new Date(item[dateKey]).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  });
  return groups;
}

export function formatCurrency(amount) {
  const formatted = Number(amount).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `Rs ${formatted}`;
}

export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString();
}

export function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getFileUrl(filePath) {
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}${filePath}`;
}

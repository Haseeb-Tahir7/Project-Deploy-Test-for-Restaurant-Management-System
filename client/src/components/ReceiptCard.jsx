import { useState } from 'react';
import { formatCurrency, formatDateTime } from '../utils/helpers';

export default function ReceiptCard({ receipt, highlighted }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`card receipt-card ${highlighted ? 'highlighted' : ''}`}>
      <div className="receipt-header" onClick={() => setExpanded(!expanded)}>
        <div>
          <strong>{receipt.receiptNumber}</strong>
          <span className="text-muted"> — {receipt.customerName}</span>
        </div>
        <div className="receipt-summary">
          <span>{formatCurrency(receipt.total)}</span>
          <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div className="receipt-details">
          {receipt.customerPhone && <p>Phone: {receipt.customerPhone}</p>}
          {receipt.customerEmail && <p>Email: {receipt.customerEmail}</p>}
          <ul className="receipt-items">
            {receipt.items.map((item, i) => (
              <li key={i}>
                {item.name} × {item.qty} — {formatCurrency(item.price * item.qty)}
              </li>
            ))}
          </ul>
          <div className="receipt-totals">
            <p>Subtotal: {formatCurrency(receipt.subtotal)}</p>
            {receipt.discountAmount > 0 && (
              <p>Discount: -{formatCurrency(receipt.discountAmount)}</p>
            )}
            <p><strong>Total: {formatCurrency(receipt.total)}</strong></p>
          </div>
          <p className="text-muted">
            By: {receipt.createdBy?.name || 'Unknown'} · {formatDateTime(receipt.createdAt)}
          </p>
        </div>
      )}
    </div>
  );
}

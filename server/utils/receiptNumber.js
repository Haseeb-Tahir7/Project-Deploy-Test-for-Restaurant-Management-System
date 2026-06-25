import ReceiptCounter from '../models/ReceiptCounter.js';

export async function generateReceiptNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

  const counter = await ReceiptCounter.findOneAndUpdate(
    { date: dateStr },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );

  const seq = String(counter.count).padStart(4, '0');
  return `REC-${dateStr}-${seq}`;
}

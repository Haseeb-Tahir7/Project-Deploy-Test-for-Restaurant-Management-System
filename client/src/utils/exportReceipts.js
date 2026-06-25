import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { formatCurrency } from './helpers';

export function exportReceiptsPDF(receipts, date) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Daily Receipts — ${date}`, 14, 20);
  doc.setFontSize(10);

  let y = 30;
  receipts.forEach((r) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${r.receiptNumber} | ${r.customerName} | ${formatCurrency(r.total)}`, 14, y);
    y += 7;
    r.items.forEach((item) => {
      doc.text(`  ${item.name} x${item.qty} — ${formatCurrency(item.price * item.qty)}`, 18, y);
      y += 6;
    });
    y += 4;
  });

  doc.save(`receipts-${date}.pdf`);
}

export function exportReceiptsExcel(receipts, date) {
  const rows = receipts.flatMap((r) =>
    r.items.map((item) => ({
      'Receipt #': r.receiptNumber,
      Customer: r.customerName,
      Phone: r.customerPhone || '',
      Item: item.name,
      Qty: item.qty,
      Price: item.price,
      LineTotal: item.price * item.qty,
      Subtotal: r.subtotal,
      Discount: r.discountAmount,
      Total: r.total,
      Salesperson: r.createdBy?.name || '',
      Date: new Date(r.createdAt).toLocaleString(),
    }))
  );

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Receipts');
  XLSX.writeFile(wb, `receipts-${date}.xlsx`);
}

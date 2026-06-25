import Receipt from '../models/Receipt.js';
import Stock from '../models/Stock.js';
import Bill from '../models/Bill.js';
import Expenditure from '../models/Expenditure.js';
import { getMonthRange } from '../utils/dateUtils.js';
import { calcNetProfitLoss } from '../utils/finance.js';

const HOUR_LABELS = [
  '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM',
  '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM',
  '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM',
];

function parseMonthParam(monthParam) {
  const now = new Date();
  if (!monthParam) {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const [year, month] = monthParam.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) {
    return null;
  }
  return { year, month };
}

export const getAnalytics = async (req, res) => {
  try {
    const parsed = parseMonthParam(req.query.month);
    if (!parsed) {
      return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM.' });
    }

    const { year, month } = parsed;
    const { start, end } = getMonthRange(year, month);
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

    const [receipts, stocks, bills, expenditures] = await Promise.all([
      Receipt.find({ createdAt: { $gte: start, $lte: end } }),
      Stock.find({ date: { $gte: start, $lte: end } }),
      Bill.find({ date: { $gte: start, $lte: end } }),
      Expenditure.find({ date: { $regex: `^${monthPrefix}` } }),
    ]);

    const monthlySales = receipts.length;
    const monthlyRevenue = receipts.reduce((sum, r) => sum + r.total, 0);
    const monthlyStockPurchases = stocks.reduce((sum, s) => sum + s.price * s.quantity, 0);
    const monthlyBills = bills.reduce((sum, b) => sum + b.amount, 0);
    const monthlyExpenditure = expenditures.reduce((sum, e) => sum + e.amount, 0);
    const totalOperatingCosts = monthlyExpenditure + monthlyBills;
    const { profit: monthlyProfit, loss: monthlyLoss, netResult } =
      calcNetProfitLoss(monthlyRevenue, totalOperatingCosts);

    const hourMap = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      label: HOUR_LABELS[hour],
      salesCount: 0,
      revenue: 0,
    }));

    receipts.forEach((r) => {
      const h = new Date(r.createdAt).getHours();
      hourMap[h].salesCount += 1;
      hourMap[h].revenue += r.total;
    });

    const peakHour = hourMap.reduce(
      (best, current) => (current.revenue > best.revenue ? current : best),
      hourMap[0]
    );

    const monthName = start.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    res.json({
      month: monthPrefix,
      monthName,
      monthlySales,
      monthlyRevenue,
      monthlyStockPurchases,
      monthlyBills,
      monthlyExpenditure,
      totalOperatingCosts,
      monthlyProfit,
      monthlyLoss,
      netResult,
      peakHour,
      peakHours: hourMap,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

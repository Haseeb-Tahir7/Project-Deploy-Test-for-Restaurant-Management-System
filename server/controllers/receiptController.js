import Receipt from '../models/Receipt.js';
import Coupon from '../models/Coupon.js';
import Expenditure from '../models/Expenditure.js';
import Bill from '../models/Bill.js';
import { generateReceiptNumber } from '../utils/receiptNumber.js';
import { getTodayDateStr, parseLocalDateRange, getLocalStartOfDay } from '../utils/dateUtils.js';
import { calcNetProfitLoss } from '../utils/finance.js';
import { escapeRegex } from '../utils/sanitize.js';

export const getReceipts = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user.id };
    const receipts = await Receipt.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReceiptStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = getLocalStartOfDay(now);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = getTodayDateStr();
    const todayRange = parseLocalDateRange(dateStr);

    const [totalSales, todayReceipts, monthlyReceipts, expenditureRecord, todayBills] = await Promise.all([
      Receipt.countDocuments(),
      Receipt.find({ createdAt: { $gte: startOfDay } }),
      Receipt.find({ createdAt: { $gte: thirtyDaysAgo } }),
      Expenditure.findOne({ date: dateStr }),
      todayRange
        ? Bill.find({ date: { $gte: todayRange.start, $lte: todayRange.end } })
        : [],
    ]);

    const revenueToday = todayReceipts.reduce((sum, r) => sum + r.total, 0);
    const monthlyRevenue = monthlyReceipts.reduce((sum, r) => sum + r.total, 0);
    const todayExpenditure = expenditureRecord?.amount ?? 0;
    const todayBillsTotal = todayBills.reduce((sum, b) => sum + b.amount, 0);
    const { profit: todayProfit, loss: todayLoss, totalOperatingCosts: todayOperatingCosts } =
      calcNetProfitLoss(revenueToday, todayExpenditure + todayBillsTotal);

    res.json({
      totalSales,
      revenueToday,
      monthlyRevenue,
      todayExpenditure,
      todayBillsTotal,
      todayOperatingCosts,
      todayProfit,
      todayLoss,
      expenditureLocked: expenditureRecord?.isLocked ?? false,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const searchReceipt = async (req, res) => {
  try {
    const { receiptNumber } = req.query;
    if (!receiptNumber) {
      return res.status(400).json({ message: 'Receipt number is required.' });
    }

    const filter = { receiptNumber: { $regex: escapeRegex(receiptNumber), $options: 'i' } };
    if (req.user.role !== 'admin') filter.createdBy = req.user.id;

    const receipts = await Receipt.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDailyReceipts = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }

    const range = parseLocalDateRange(date);
    if (!range) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const receipts = await Receipt.find({
      createdAt: { $gte: range.start, $lte: range.end },
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createReceipt = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      discountPercent,
      couponCode,
    } = req.body;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ message: 'Customer name and items are required.' });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    let discount = 0;
    let appliedCoupon = '';

    if (couponCode) {
      const coupon = await Coupon.findOneAndUpdate(
        {
          code: couponCode.toUpperCase(),
          isActive: true,
          isUsed: false,
        },
        { isUsed: true, isActive: false, usageCount: 1 },
        { new: true }
      );
      if (!coupon) {
        return res.status(400).json({ message: 'Invalid, used, or inactive coupon.' });
      }
      discount = (subtotal * coupon.discountPercent) / 100;
      appliedCoupon = coupon.code;
    } else if (discountPercent) {
      const pct = Math.min(100, Math.max(0, Number(discountPercent)));
      discount = (subtotal * pct) / 100;
    }

    const total = Math.max(0, subtotal - discount);
    const receiptNumber = await generateReceiptNumber();

    const receipt = await Receipt.create({
      receiptNumber,
      customerName,
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      items,
      subtotal,
      discountAmount: discount,
      couponCode: appliedCoupon,
      total,
      createdBy: req.user.id,
    });

    const populated = await Receipt.findById(receipt._id).populate('createdBy', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

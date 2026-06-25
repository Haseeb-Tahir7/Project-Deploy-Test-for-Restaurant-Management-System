import Bill from '../models/Bill.js';
import { parseLocalDateRange } from '../utils/dateUtils.js';
import { escapeRegex } from '../utils/sanitize.js';

export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ date: -1, createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBillHistory = async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: escapeRegex(search), $options: 'i' };
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const range = parseLocalDateRange(startDate);
        if (range) filter.date.$gte = range.start;
      }
      if (endDate) {
        const range = parseLocalDateRange(endDate);
        if (range) filter.date.$lte = range.end;
      }
    }

    const bills = await Bill.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createBill = async (req, res) => {
  try {
    const { name, amount } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Bill name is required.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Bill image file is required.' });
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ message: 'Amount must be a non-negative number.' });
    }

    const bill = await Bill.create({
      name: name.trim(),
      amount: parsedAmount,
      fileName: req.file.originalname,
      filePath: `/uploads/bills/${req.file.filename}`,
      mimeType: req.file.mimetype,
      date: new Date(),
      createdBy: req.user.id,
    });

    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

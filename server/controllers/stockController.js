import Stock from '../models/Stock.js';
import { parseLocalDateRange } from '../utils/dateUtils.js';
import { escapeRegex } from '../utils/sanitize.js';

export const getStock = async (req, res) => {
  try {
    const items = await Stock.find().sort({ date: -1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStockHistory = async (req, res) => {
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

    const items = await Stock.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createStock = async (req, res) => {
  try {
    const { emoji, name, description, price, quantity, unit } = req.body;
    if (!name || price === undefined || quantity === undefined || !unit) {
      return res.status(400).json({ message: 'Name, price, quantity, and unit are required.' });
    }

    const stock = await Stock.create({
      emoji: emoji || '📦',
      name,
      description: description || '',
      price: Number(price),
      quantity: Number(quantity),
      unit,
      date: new Date(),
      createdBy: req.user.id,
    });
    res.status(201).json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import Expenditure from '../models/Expenditure.js';
import { getTodayDateStr } from '../utils/dateUtils.js';

export const getTodayExpenditure = async (req, res) => {
  try {
    const date = getTodayDateStr();
    const record = await Expenditure.findOne({ date });
    res.json({
      date,
      amount: record?.amount ?? 0,
      isLocked: record?.isLocked ?? false,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const setTodayExpenditure = async (req, res) => {
  try {
    const { amount } = req.body;
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed < 0) {
      return res.status(400).json({ message: 'Amount must be a non-negative number.' });
    }

    const date = getTodayDateStr();
    const record = await Expenditure.findOneAndUpdate(
      { date },
      {
        amount: parsed,
        isLocked: true,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getTodayDateStr };

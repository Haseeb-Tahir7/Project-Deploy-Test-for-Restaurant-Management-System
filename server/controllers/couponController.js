import Coupon from '../models/Coupon.js';
import { generateUniqueCouponCode } from '../utils/couponCode.js';

function normalizeCode(code) {
  return String(code).trim().toUpperCase();
}

function isValidCode(code) {
  return /^[A-Z0-9]{4,12}$/.test(code);
}

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { discountPercent, code } = req.body;
    const pct = Number(discountPercent);
    if (!pct || pct < 1 || pct > 100) {
      return res.status(400).json({ message: 'Discount must be between 1 and 100.' });
    }

    let finalCode;
    let isCustom = false;

    if (code && String(code).trim()) {
      finalCode = normalizeCode(code);
      if (!isValidCode(finalCode)) {
        return res.status(400).json({ message: 'Custom code must be 4–12 alphanumeric characters.' });
      }
      const exists = await Coupon.findOne({ code: finalCode });
      if (exists) {
        return res.status(400).json({ message: 'Coupon code already exists.' });
      }
      isCustom = true;
    } else {
      finalCode = await generateUniqueCouponCode();
    }

    const coupon = await Coupon.create({
      code: finalCode,
      discountPercent: pct,
      isCustom,
    });
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deactivateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }

    const coupon = await Coupon.findOne({
      code: normalizeCode(code),
      isActive: true,
      isUsed: false,
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid, used, or inactive coupon.' });
    }

    res.json({ valid: true, discountPercent: coupon.discountPercent, code: coupon.code });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

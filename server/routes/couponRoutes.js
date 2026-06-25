import { Router } from 'express';
import {
  getCoupons,
  createCoupon,
  deactivateCoupon,
  verifyCoupon,
} from '../controllers/couponController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

router.post('/verify', verifyCoupon);
router.get('/', requireAdmin, getCoupons);
router.post('/', requireAdmin, createCoupon);
router.delete('/:id', requireAdmin, deactivateCoupon);

export default router;

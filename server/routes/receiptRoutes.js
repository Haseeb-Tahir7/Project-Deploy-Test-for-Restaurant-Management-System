import { Router } from 'express';
import {
  getReceipts,
  getReceiptStats,
  searchReceipt,
  getDailyReceipts,
  createReceipt,
} from '../controllers/receiptController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

router.get('/stats', requireAdmin, getReceiptStats);
router.get('/search', searchReceipt);
router.get('/daily', getDailyReceipts);
router.get('/', getReceipts);
router.post('/', createReceipt);

export default router;

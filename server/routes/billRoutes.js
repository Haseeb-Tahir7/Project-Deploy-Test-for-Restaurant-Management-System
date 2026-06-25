import { Router } from 'express';
import { getBills, getBillHistory, createBill } from '../controllers/billController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { uploadBillImage } from '../middleware/upload.js';

const router = Router();

router.use(verifyToken, requireAdmin);

router.get('/', getBills);
router.get('/history', getBillHistory);
router.post('/', uploadBillImage, createBill);

export default router;

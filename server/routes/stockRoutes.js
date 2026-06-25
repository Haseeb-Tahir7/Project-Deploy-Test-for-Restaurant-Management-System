import { Router } from 'express';
import { getStock, getStockHistory, createStock } from '../controllers/stockController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken, requireAdmin);

router.get('/', getStock);
router.get('/history', getStockHistory);
router.post('/', createStock);

export default router;

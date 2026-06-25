import { Router } from 'express';
import { getTodayExpenditure, setTodayExpenditure } from '../controllers/expenditureController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken, requireAdmin);

router.get('/today', getTodayExpenditure);
router.put('/today', setTodayExpenditure);

export default router;

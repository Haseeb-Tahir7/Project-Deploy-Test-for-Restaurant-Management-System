import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken, requireAdmin);

router.get('/', getAnalytics);

export default router;

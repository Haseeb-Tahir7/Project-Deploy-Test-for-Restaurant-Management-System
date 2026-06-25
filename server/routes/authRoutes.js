import { Router } from 'express';
import { login, register, seedAdmin } from '../controllers/authController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/seed', seedAdmin);
router.post('/register', verifyToken, requireAdmin, register);

export default router;

import { Router } from 'express';
import {
  getMenuItems,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

router.get('/', (req, res, next) => {
  if (req.user.role === 'admin') return getAllMenuItems(req, res, next);
  return getMenuItems(req, res, next);
});

router.post('/', requireAdmin, createMenuItem);
router.put('/:id', requireAdmin, updateMenuItem);
router.delete('/:id', requireAdmin, deleteMenuItem);

export default router;

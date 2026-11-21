import { Router } from 'express';
import {
  createMenuItem,
  deleteMenuItem,
  getMenusByPlan,
  getMenusSummary,
  updateMenuItem,
} from '../controllers/menuController.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(asyncHandler(authenticate), requireAdmin);

router.get('/', asyncHandler(getMenusSummary));
router.get('/:plan', asyncHandler(getMenusByPlan));
router.post('/', asyncHandler(createMenuItem));
router.put('/:id', asyncHandler(updateMenuItem));
router.delete('/:id', asyncHandler(deleteMenuItem));

export default router;

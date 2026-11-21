import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  toggleUserStatus,
  updateUser,
} from '../controllers/userController.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(asyncHandler(authenticate), requireAdmin);

router.get('/', asyncHandler(listUsers));
router.post('/', asyncHandler(createUser));
router.get('/:id', asyncHandler(getUserById));
router.put('/:id', asyncHandler(updateUser));
router.patch('/:id/status', asyncHandler(toggleUserStatus));
router.delete('/:id', asyncHandler(deleteUser));

export default router;

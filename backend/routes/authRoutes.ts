import { Router } from 'express';
import {
  getAuthStatus,
  getMe,
  login,
  logout,
  setupAdmin,
} from '../controllers/authController.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';
import { authenticate } from '../middleware/authMiddleware.ts';

const router = Router();

router.get('/status', asyncHandler(getAuthStatus));
router.post('/setup-admin', asyncHandler(setupAdmin));
router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(authenticate), logout);
router.get('/me', asyncHandler(authenticate), getMe);

export default router;

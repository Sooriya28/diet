import { Router } from 'express';
import {
  getMemberDietCard,
  getMemberMenu,
  getMemberProfile,
} from '../controllers/memberController.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';
import { authenticate, requireUser } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(asyncHandler(authenticate), requireUser);

router.get('/profile', getMemberProfile);
router.get('/diet-card', getMemberDietCard);
router.get('/menu', asyncHandler(getMemberMenu));

export default router;

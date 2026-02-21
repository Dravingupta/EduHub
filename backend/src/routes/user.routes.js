import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getMe, updateProfile } from '../controllers/user.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/me', getMe);
router.patch('/profile', updateProfile);

export default router;

import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { conceptChat, lessonChat } from '../controllers/chat.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/concept', conceptChat);
router.post('/lesson', lessonChat);

export default router;

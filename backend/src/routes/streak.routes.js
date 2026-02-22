import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { recordActivity, getStreakAnalytics, getActivityHeatmap } from '../controllers/streak.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/activity', recordActivity);
router.get('/', getStreakAnalytics);
router.get('/heatmap', getActivityHeatmap);

export default router;

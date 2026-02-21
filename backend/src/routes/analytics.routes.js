import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
    getSubjectProgress,
    getTopicMasteryBreakdown,
    getUserOverallAnalytics,
    getWeakTopics,
} from '../controllers/analytics.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/subject/:subjectId', getSubjectProgress);
router.get('/topics/:subjectId', getTopicMasteryBreakdown);
router.get('/user', getUserOverallAnalytics);
router.get('/weak-topics', getWeakTopics);

export default router;

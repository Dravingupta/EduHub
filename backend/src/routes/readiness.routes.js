import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
    getSubjectReadiness,
    getOverallReadiness,
    getReadinessTrend,
} from '../controllers/readiness.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/subject/:subjectId', getSubjectReadiness);
router.get('/overall', getOverallReadiness);
router.get('/trend', getReadinessTrend);

export default router;

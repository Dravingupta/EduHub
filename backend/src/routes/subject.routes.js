import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
    createSubject,
    getSubjects,
    updateMastery,
    updateDensity,
} from '../controllers/subject.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createSubject);
router.get('/', getSubjects);
router.patch('/:id/mastery', updateMastery);
router.patch('/:id/density', updateDensity);

export default router;

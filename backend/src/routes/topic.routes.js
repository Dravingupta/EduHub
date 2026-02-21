import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
    createSyllabus,
    getTopics,
    completeTopic,
    deleteTopics,
    generateLesson,
} from '../controllers/topic.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/syllabus', createSyllabus);
router.get('/:subjectId', getTopics);
router.patch('/:topicId/complete', completeTopic);
router.delete('/:subjectId', deleteTopics);
router.post('/:topicId/lesson', generateLesson);

export default router;

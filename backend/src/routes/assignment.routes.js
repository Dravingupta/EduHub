import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { submitAssignment } from '../controllers/assignment.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/submit', submitAssignment);

export default router;

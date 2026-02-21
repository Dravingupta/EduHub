import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
    getNotifications,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    generateNotifications,
} from '../controllers/notification.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.get('/unread', getUnreadNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.post('/generate', generateNotifications);

export default router;

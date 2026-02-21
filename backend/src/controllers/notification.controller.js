import mongoose from 'mongoose';
import * as notificationRepository from '../repositories/notification.repository.js';
import * as notificationService from '../services/notification.service.js';
import * as userService from '../services/user.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getNotifications = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const user = await userService.getOrCreateUser(uid);
        const notifications = await notificationRepository.findUserNotifications(user._id);

        return successResponse(res, { notifications }, 'Notifications fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const getUnreadNotifications = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const user = await userService.getOrCreateUser(uid);
        const notifications = await notificationRepository.findUnreadNotifications(user._id);

        return successResponse(res, { notifications }, 'Unread notifications fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 'Invalid notification ID', 400);
        }

        const notification = await notificationRepository.markAsRead(id);

        if (!notification) {
            return errorResponse(res, 'Notification not found', 404);
        }

        return successResponse(res, { notification }, 'Notification marked as read');
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const user = await userService.getOrCreateUser(uid);
        await notificationRepository.markAllAsRead(user._id);

        return successResponse(res, null, 'All notifications marked as read');
    } catch (error) {
        next(error);
    }
};

export const generateNotifications = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const user = await userService.getOrCreateUser(uid);
        const generated = await notificationService.generateDailyNotifications(user._id);

        return successResponse(
            res,
            { notifications: generated, count: generated.length },
            'Daily notifications generated'
        );
    } catch (error) {
        next(error);
    }
};

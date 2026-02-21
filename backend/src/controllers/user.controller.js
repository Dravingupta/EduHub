import * as userService from '../services/user.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getMe = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const user = await userService.getOrCreateUser(uid);

        return successResponse(res, { user }, 'User fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const payload = req.body;

        if (!payload || Object.keys(payload).length === 0) {
            return errorResponse(res, 'Request body cannot be empty', 400);
        }

        const user = await userService.updateGlobalBehavior(uid, payload);

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        return successResponse(res, { user }, 'Profile updated successfully');
    } catch (error) {
        next(error);
    }
};

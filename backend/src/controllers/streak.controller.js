import * as streakService from '../services/streak.service.js';
import * as userService from '../services/user.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const recordActivity = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { studyTime, assignments, topics } = req.body;

        const user = await userService.getOrCreateUser(uid);
        const activity = await streakService.recordDailyActivity(user._id, {
            studyTime,
            assignments,
            topics,
        });

        return successResponse(res, { activity }, 'Activity recorded successfully');
    } catch (error) {
        next(error);
    }
};

export const getStreakAnalytics = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const user = await userService.getOrCreateUser(uid);
        const analytics = await streakService.getStreakAnalytics(user._id);

        return successResponse(res, { analytics }, 'Streak analytics fetched successfully');
    } catch (error) {
        next(error);
    }
};

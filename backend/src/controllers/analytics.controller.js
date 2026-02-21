import mongoose from 'mongoose';
import * as analyticsService from '../services/analytics.service.js';
import * as userService from '../services/user.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getSubjectProgress = async (req, res, next) => {
    try {
        const { subjectId } = req.params;

        if (!isValidObjectId(subjectId)) {
            return errorResponse(res, 'Invalid subjectId', 400);
        }

        const progress = await analyticsService.getSubjectProgress(subjectId);

        return successResponse(res, progress, 'Subject progress fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const getTopicMasteryBreakdown = async (req, res, next) => {
    try {
        const { subjectId } = req.params;

        if (!isValidObjectId(subjectId)) {
            return errorResponse(res, 'Invalid subjectId', 400);
        }

        const breakdown = await analyticsService.getTopicMasteryBreakdown(subjectId);

        return successResponse(res, { breakdown }, 'Topic mastery breakdown fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const getUserOverallAnalytics = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const user = await userService.getOrCreateUser(uid);
        const analytics = await analyticsService.getUserOverallAnalytics(user._id);

        return successResponse(res, { analytics }, 'User analytics fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const getWeakTopics = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const user = await userService.getOrCreateUser(uid);
        const weakTopics = await analyticsService.getWeakTopicsAcrossSubjects(user._id);

        return successResponse(res, { weak_topics: weakTopics }, 'Weak topics fetched successfully');
    } catch (error) {
        next(error);
    }
};

import mongoose from 'mongoose';
import * as readinessService from '../services/readiness.service.js';
import * as userService from '../services/user.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getSubjectReadiness = async (req, res, next) => {
    try {
        const { subjectId } = req.params;
        const { uid } = req.user;

        if (!isValidObjectId(subjectId)) {
            return errorResponse(res, 'Invalid subjectId', 400);
        }

        const user = await userService.getOrCreateUser(uid);
        const readiness = await readinessService.calculateSubjectReadiness(subjectId, user._id);

        return successResponse(res, readiness, 'Subject readiness calculated successfully');
    } catch (error) {
        next(error);
    }
};

export const getOverallReadiness = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const user = await userService.getOrCreateUser(uid);
        const readiness = await readinessService.calculateOverallReadiness(user._id);

        return successResponse(res, readiness, 'Overall readiness calculated successfully');
    } catch (error) {
        next(error);
    }
};

export const getReadinessTrend = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const user = await userService.getOrCreateUser(uid);
        const trend = await readinessService.readinessTrend(user._id);

        return successResponse(res, { trend }, 'Readiness trend fetched successfully');
    } catch (error) {
        next(error);
    }
};

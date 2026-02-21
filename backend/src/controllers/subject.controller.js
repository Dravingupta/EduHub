import * as subjectService from '../services/subject.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import * as userService from '../services/user.service.js';

export const createSubject = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { subject_name, type } = req.body;

        if (!subject_name) {
            return errorResponse(res, 'subject_name is required', 400);
        }

        const user = await userService.getOrCreateUser(uid);
        const subject = await subjectService.createSubjectForUser(user._id, subject_name, type);

        return successResponse(res, { subject }, 'Subject created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const getSubjects = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const user = await userService.getOrCreateUser(uid);
        const subjects = await subjectService.getUserSubjects(user._id);

        return successResponse(res, { subjects }, 'Subjects fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const updateMastery = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { topic, masteryScore } = req.body;

        if (!topic || masteryScore === undefined) {
            return errorResponse(res, 'topic and masteryScore are required', 400);
        }

        if (typeof masteryScore !== 'number') {
            return errorResponse(res, 'masteryScore must be a number', 400);
        }

        const subject = await subjectService.updateTopicMastery(id, topic, masteryScore);

        return successResponse(res, { subject }, 'Topic mastery updated successfully');
    } catch (error) {
        next(error);
    }
};

export const updateDensity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { density } = req.body;

        if (density === undefined) {
            return errorResponse(res, 'density is required', 400);
        }

        if (typeof density !== 'number') {
            return errorResponse(res, 'density must be a number', 400);
        }

        const subject = await subjectService.updateDensityPreference(id, density);

        return successResponse(res, { subject }, 'Density preference updated successfully');
    } catch (error) {
        next(error);
    }
};

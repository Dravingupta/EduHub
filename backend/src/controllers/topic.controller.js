import mongoose from 'mongoose';
import fs from 'fs';
import * as topicService from '../services/topic.service.js';
import * as userService from '../services/user.service.js';
import { generateVisualLesson } from '../services/lesson.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createSyllabus = async (req, res, next) => {
    try {
        const { subjectId, syllabus } = req.body;

        if (!subjectId) {
            return errorResponse(res, 'subjectId is required', 400);
        }

        if (!isValidObjectId(subjectId)) {
            return errorResponse(res, 'Invalid subjectId', 400);
        }

        if (!syllabus || typeof syllabus !== 'object') {
            return errorResponse(res, 'syllabus is required and must be an object', 400);
        }

        await topicService.deleteAllTopicsOfSubject(subjectId);
        const topics = await topicService.createTopicsFromSyllabus(subjectId, syllabus);

        return successResponse(res, { topics }, 'Syllabus topics created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const getTopics = async (req, res, next) => {
    try {
        const { subjectId } = req.params;

        if (!isValidObjectId(subjectId)) {
            return errorResponse(res, 'Invalid subjectId', 400);
        }

        const topics = await topicService.getSubjectTopics(subjectId);

        return successResponse(res, { topics }, 'Topics fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const completeTopic = async (req, res, next) => {
    try {
        const { topicId } = req.params;

        if (!isValidObjectId(topicId)) {
            return errorResponse(res, 'Invalid topicId', 400);
        }

        const topic = await topicService.markTopicCompleted(topicId);

        return successResponse(res, { topic }, 'Topic marked as completed');
    } catch (error) {
        next(error);
    }
};

export const deleteTopics = async (req, res, next) => {
    try {
        const { subjectId } = req.params;

        if (!isValidObjectId(subjectId)) {
            return errorResponse(res, 'Invalid subjectId', 400);
        }

        await topicService.deleteAllTopicsOfSubject(subjectId);

        return successResponse(res, null, 'All topics deleted successfully');
    } catch (error) {
        next(error);
    }
};

export const generateLesson = async (req, res, next) => {
    try {
        const { topicId } = req.params;
        const { forceRegenerate } = req.body || {};
        const { uid } = req.user;

        if (!isValidObjectId(topicId)) {
            return errorResponse(res, 'Invalid topicId', 400);
        }

        const user = await userService.getOrCreateUser(uid);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        const lessonData = await generateVisualLesson(user._id, topicId, forceRegenerate);

        return successResponse(res, { lesson: lessonData }, 'Lesson generated successfully');
    } catch (error) {
        console.error("[CRITICAL] Lesson Generation Error:", error);
        fs.writeFileSync('/tmp/eduhub2_error.log', error.stack || error.message);
        next(error);
    }
};

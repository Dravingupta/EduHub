import mongoose from 'mongoose';
import * as topicService from '../services/topic.service.js';
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

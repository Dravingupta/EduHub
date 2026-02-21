import mongoose from 'mongoose';
import * as assignmentService from '../services/assignment.service.js';
import * as userService from '../services/user.service.js';
import * as topicRepository from '../repositories/topic.repository.js';
import * as subjectRepository from '../repositories/subject.repository.js';
import { successResponse, errorResponse } from '../utils/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const startAssignment = async (req, res, next) => {
    try {
        const { topicId } = req.body;
        const { uid } = req.user;

        if (!topicId || !isValidObjectId(topicId)) {
            return errorResponse(res, 'Invalid topicId', 400);
        }

        const user = await userService.getOrCreateUser(uid);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        const topic = await topicRepository.findById(topicId);
        if (!topic) {
            return errorResponse(res, 'Topic not found', 404);
        }

        const subject = await subjectRepository.findById(topic.subject_id);
        if (!subject) {
            return errorResponse(res, 'Subject not found', 404);
        }

        const assignment = await assignmentService.createAssignment({
            userId: user._id,
            subjectName: subject.subject_name,
            subjectId: subject._id,
            topicName: topic.topic_name,
            topicId: topic._id,
        });

        return successResponse(res, assignment, 'Assignment generated successfully');
    } catch (error) {
        next(error);
    }
};

export const submitAssignment = async (req, res, next) => {
    try {
        const { assignmentId, answers, time_taken } = req.body;

        if (!assignmentId) {
            return errorResponse(res, 'assignmentId is required', 400);
        }

        if (!isValidObjectId(assignmentId)) {
            return errorResponse(res, 'Invalid assignmentId', 400);
        }

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return errorResponse(res, 'answers must be a non-empty array', 400);
        }

        if (time_taken === undefined || typeof time_taken !== 'number') {
            return errorResponse(res, 'time_taken is required and must be a number', 400);
        }

        const evaluation = await assignmentService.submitAssignment(
            assignmentId,
            answers,
            time_taken
        );

        return successResponse(res, evaluation, 'Assignment evaluated');
    } catch (error) {
        next(error);
    }
};

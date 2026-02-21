import mongoose from 'mongoose';
import * as assignmentService from '../services/assignment.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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

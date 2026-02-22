import { askConceptQuestion } from '../services/chat.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const conceptChat = async (req, res, next) => {
    try {
        const { question, explanation, correctAnswer, userAnswer, userMessage, chatHistory } = req.body;

        if (!question || !userMessage) {
            return errorResponse(res, 'question and userMessage are required', 400);
        }

        const reply = await askConceptQuestion({
            question,
            explanation: explanation || '',
            correctAnswer: correctAnswer || '',
            userAnswer: userAnswer || '',
            userMessage,
            chatHistory: chatHistory || []
        });

        return successResponse(res, { reply }, 'Chat response generated');
    } catch (error) {
        next(error);
    }
};

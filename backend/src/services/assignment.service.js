import * as assignmentRepository from '../repositories/assignment.repository.js';
import { evaluateAssignment } from './evaluation.service.js';
import * as subjectService from './subject.service.js';
import * as topicService from './topic.service.js';
import * as userService from './user.service.js';

export const submitAssignment = async (assignmentId, userAnswers, timeTaken) => {
    const assignment = await assignmentRepository.findById(assignmentId);

    if (!assignment) {
        throw new Error('Assignment not found');
    }

    assignment.user_answers = userAnswers;

    const evaluation = evaluateAssignment(assignment);

    await assignmentRepository.updateAssignment(assignmentId, {
        user_answers: userAnswers,
        score: evaluation.score,
        mastery_score: evaluation.mastery_score,
        time_taken: timeTaken,
    });

    await subjectService.updateTopicMastery(
        assignment.subject_id,
        assignment.topic_id.toString(),
        evaluation.mastery_score
    );

    if (evaluation.mastery_score >= 60) {
        await topicService.markTopicCompleted(assignment.topic_id);
    } else {
        const user = await assignmentRepository.findById(assignmentId);
        if (user) {
            await userService.incrementRetry(assignment.user_id);
        }
    }

    return evaluation;
};

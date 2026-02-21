import * as assignmentRepository from '../repositories/assignment.repository.js';
import * as testBankRepository from '../repositories/testBank.repository.js';
import { evaluateAssignment } from './evaluation.service.js';
import * as subjectService from './subject.service.js';
import * as topicService from './topic.service.js';
import * as userService from './user.service.js';
import * as streakService from './streak.service.js';

/**
 * Creates an assignment for a user using pre-generated test banks.
 * 
 * Logic flow:
 * 1. Fetch all available 5 test sets for the topic.
 * 2. Fetch user's previous assignments for this topic.
 * 3. Find unused test sets. If none, allow random reuse from the 5.
 * 4. Create an assignment record keeping track of the correct answers privately.
 * 5. Return a sanitized question list to the frontend.
 */
export const createAssignment = async ({
    userId,
    subjectName,
    subjectId,
    topicName,
    topicId,
    lessonId
}) => {
    // Step 1: Fetch all test sets for the topic
    const availableTestSets = await testBankRepository.getTestSetsByTopic(subjectName, topicName);

    if (!availableTestSets || availableTestSets.length === 0) {
        throw new Error(`[AssignmentService] No test sets found in TestBank for Topic: ${topicName} inside Subject: ${subjectName}. Please run the TestBank generator script first.`);
    }

    // Step 2: Fetch User's previous assignments to find used ones
    const previousAssignments = await assignmentRepository.findByUserAndTopic(userId, topicId);
    const usedTestSetIds = previousAssignments.map(a => a.test_set_id);

    // Step 3: Select Test Set
    const unusedTestSets = availableTestSets.filter(
        set => !usedTestSetIds.includes(set.test_set_id)
    );

    let selectedTestSet;
    if (unusedTestSets.length > 0) {
        // Pick a random one from the unused ones
        const randomIndex = Math.floor(Math.random() * unusedTestSets.length);
        selectedTestSet = unusedTestSets[randomIndex];
    } else {
        // Fallback: The user has exhausted all tests. Allow reuse by picking randomly from all available.
        const randomIndex = Math.floor(Math.random() * availableTestSets.length);
        selectedTestSet = availableTestSets[randomIndex];
    }

    // Step 4: Create internal question list for validation
    // Generate a secure question_id for tracking since questions are subdocs
    const mappedSchemaQuestions = selectedTestSet.questions.map((q, index) => ({
        question_id: `q_${index}`,
        difficulty: q.difficulty,
        correct_answer: q.correct_answer
    }));

    const newAssignmentData = {
        user_id: userId,
        subject_id: subjectId,
        topic_id: topicId,
        // The assignment schema doesn't explicitly store lessonId, but we can pass it
        // and keep track of it if needed. For now the schema handles relations via subject/topic.
        test_set_id: selectedTestSet.test_set_id,
        questions: mappedSchemaQuestions,
        user_answers: [],
        score: 0,
        mastery_score: 0,
        time_taken: 0
    };

    const assignmentRecord = await assignmentRepository.createAssignment(newAssignmentData);

    // Step 5: Format and sanitize questions for the frontend
    // HIDE `correct_answer` and `concept_tag` from the user
    const sanitizedQuestions = selectedTestSet.questions.map((q, index) => ({
        question_id: `q_${index}`,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty
    }));

    return {
        assignment_id: assignmentRecord._id,
        test_set_id: selectedTestSet.test_set_id,
        questions: sanitizedQuestions
    };
};

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
        await streakService.recordDailyActivity(assignment.user_id, {
            studyTime: timeTaken,
            assignments: 1,
            topics: 1,
        });
    } else {
        await userService.incrementRetry(assignment.user_id);
        await streakService.recordDailyActivity(assignment.user_id, {
            studyTime: timeTaken,
            assignments: 1,
            topics: 0,
        });
    }

    return evaluation;
};

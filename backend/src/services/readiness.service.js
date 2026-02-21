import * as subjectRepository from '../repositories/subject.repository.js';
import * as topicRepository from '../repositories/topic.repository.js';
import * as assignmentRepository from '../repositories/assignment.repository.js';
import * as streakService from './streak.service.js';
import { EXPECTED_TIME_PER_QUESTION } from '../config/constants.js';


const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const calculateSubjectReadiness = async (subjectId, userId) => {
    const subject = await subjectRepository.findById(subjectId);

    if (!subject) {
        throw new Error('Subject not found');
    }

    const mastery = subject.avg_subject_mastery || 0;

    const topics = await topicRepository.getOrderedTopics(subjectId);
    const totalTopics = topics.length;
    const completedTopics = topics.filter((t) => t.is_completed).length;
    const completionPercentage =
        totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    let consistencyScore = 50;
    try {
        consistencyScore = await streakService.calculateConsistencyScore(userId);
    } catch (_) {
        // default to 50 if unavailable
    }

    let speedFactor = 50;
    const topicIds = topics.map((t) => t._id);
    let totalTime = 0;
    let totalQuestions = 0;

    for (const topicId of topicIds) {
        const assignments = await assignmentRepository.findByUserAndTopic(userId, topicId);
        for (const assignment of assignments) {
            totalTime += assignment.time_taken || 0;
            totalQuestions += assignment.questions ? assignment.questions.length : 0;
        }
    }

    if (totalQuestions > 0) {
        const avgTimePerQuestion = totalTime / totalQuestions;

        if (avgTimePerQuestion <= EXPECTED_TIME_PER_QUESTION) {
            speedFactor = 100;
        } else {
            speedFactor = clamp(
                (EXPECTED_TIME_PER_QUESTION / avgTimePerQuestion) * 100,
                0,
                100
            );
        }
    }

    const weakTopicPenalty =
        totalTopics > 0 ? (subject.weak_topics.length / totalTopics) * 100 : 0;

    const readinessScore = clamp(
        Math.round(
            mastery * 0.35 +
            completionPercentage * 0.25 +
            consistencyScore * 0.15 +
            speedFactor * 0.15 +
            (100 - weakTopicPenalty) * 0.10
        ),
        0,
        100
    );

    return {
        subject_readiness: readinessScore,
        breakdown: {
            mastery: Math.round(mastery * 100) / 100,
            completion: Math.round(completionPercentage * 100) / 100,
            consistency: consistencyScore,
            speed: Math.round(speedFactor * 100) / 100,
            weak_topic_penalty: Math.round(weakTopicPenalty * 100) / 100,
        },
    };
};

export const calculateOverallReadiness = async (userId) => {
    const subjects = await subjectRepository.findByUser(userId);

    if (subjects.length === 0) {
        return {
            overall_readiness: 0,
            subjects: [],
        };
    }

    const subjectResults = [];
    let totalReadiness = 0;

    for (const subject of subjects) {
        const result = await calculateSubjectReadiness(subject._id, userId);
        subjectResults.push({
            subject_name: subject.subject_name,
            readiness_score: result.subject_readiness,
        });
        totalReadiness += result.subject_readiness;
    }

    const overallReadiness = Math.round(totalReadiness / subjects.length);

    return {
        overall_readiness: clamp(overallReadiness, 0, 100),
        subjects: subjectResults,
    };
};

export const readinessTrend = async (userId) => {
    const subjects = await subjectRepository.findByUser(userId);
    const allAssignments = [];

    for (const subject of subjects) {
        const topics = await topicRepository.getOrderedTopics(subject._id);
        for (const topic of topics) {
            const assignments = await assignmentRepository.findByUserAndTopic(userId, topic._id);
            allAssignments.push(...assignments);
        }
    }

    if (allAssignments.length === 0) {
        return [];
    }

    allAssignments.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const weeklyMap = new Map();

    for (const assignment of allAssignments) {
        const date = new Date(assignment.createdAt);
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const daysSinceStart = Math.floor(
            (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
        );
        const weekNumber = Math.ceil((daysSinceStart + 1) / 7);
        const weekKey = `${date.getFullYear()}-W${weekNumber}`;

        if (!weeklyMap.has(weekKey)) {
            weeklyMap.set(weekKey, []);
        }
        weeklyMap.get(weekKey).push(assignment.mastery_score || 0);
    }

    const trend = [];

    for (const [week, scores] of weeklyMap.entries()) {
        const avgMastery =
            scores.length > 0
                ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 100) / 100
                : 0;
        trend.push({ week, avg_mastery: avgMastery });
    }

    return trend;
};

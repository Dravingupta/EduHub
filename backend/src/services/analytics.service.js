import * as subjectRepository from '../repositories/subject.repository.js';
import * as topicRepository from '../repositories/topic.repository.js';

export const getSubjectProgress = async (subjectId) => {
    const subject = await subjectRepository.findById(subjectId);

    if (!subject) {
        throw new Error('Subject not found');
    }

    const topics = await topicRepository.getOrderedTopics(subjectId);
    const totalTopics = topics.length;
    const completedTopics = topics.filter((t) => t.is_completed).length;
    const completionPercentage =
        totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
        subject_progress: {
            total_topics: totalTopics,
            completed_topics: completedTopics,
            completion_percentage: completionPercentage,
            avg_mastery: subject.avg_subject_mastery,
            weak_topics_count: subject.weak_topics.length,
            strong_topics_count: subject.strong_topics.length,
            swap_count: subject.swap_count,
        },
    };
};

export const getTopicMasteryBreakdown = async (subjectId) => {
    const subject = await subjectRepository.findById(subjectId);

    if (!subject) {
        throw new Error('Subject not found');
    }

    const breakdown = [];

    for (const [topicName, masteryScore] of subject.topic_mastery_map.entries()) {
        let status = 'average';

        if (masteryScore < 60) {
            status = 'weak';
        } else if (masteryScore > 80) {
            status = 'strong';
        }

        breakdown.push({
            topic_name: topicName,
            mastery_score: masteryScore,
            status,
        });
    }

    return breakdown;
};

export const getUserOverallAnalytics = async (userId) => {
    const subjects = await subjectRepository.findByUser(userId);
    const totalSubjects = subjects.length;

    let totalMastery = 0;
    let totalCompletedTopics = 0;
    let totalTopics = 0;
    let totalSwapUsage = 0;

    for (const subject of subjects) {
        totalMastery += subject.avg_subject_mastery;
        totalSwapUsage += subject.swap_count;

        const topics = await topicRepository.getOrderedTopics(subject._id);
        totalTopics += topics.length;
        totalCompletedTopics += topics.filter((t) => t.is_completed).length;
    }

    const overallAvgMastery =
        totalSubjects > 0 ? Math.round((totalMastery / totalSubjects) * 100) / 100 : 0;
    const overallCompletionPercentage =
        totalTopics > 0 ? Math.round((totalCompletedTopics / totalTopics) * 100) : 0;

    return {
        total_subjects: totalSubjects,
        overall_avg_mastery: overallAvgMastery,
        total_completed_topics: totalCompletedTopics,
        total_topics: totalTopics,
        overall_completion_percentage: overallCompletionPercentage,
        total_swap_usage: totalSwapUsage,
    };
};

export const getWeakTopicsAcrossSubjects = async (userId) => {
    const subjects = await subjectRepository.findByUser(userId);
    const weakTopics = [];

    for (const subject of subjects) {
        for (const [topicName, masteryScore] of subject.topic_mastery_map.entries()) {
            if (masteryScore < 60) {
                weakTopics.push({
                    subject_name: subject.subject_name,
                    topic_name: topicName,
                    mastery_score: masteryScore,
                });
            }
        }
    }

    weakTopics.sort((a, b) => a.mastery_score - b.mastery_score);

    return weakTopics;
};

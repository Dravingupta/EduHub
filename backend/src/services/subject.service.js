import * as subjectRepository from '../repositories/subject.repository.js';

export const createSubjectForUser = async (userId, subjectName, type = 'custom') => {
    const existing = await subjectRepository.findByUserAndName(userId, subjectName);

    if (existing) {
        throw new Error('Subject already exists for this user');
    }

    return await subjectRepository.createSubject({
        user_id: userId,
        subject_name: subjectName,
        type,
    });
};

export const getUserSubjects = async (userId) => {
    return await subjectRepository.findByUser(userId);
};

export const updateTopicMastery = async (subjectId, topic, masteryScore) => {
    const subject = await subjectRepository.updateTopicMastery(subjectId, topic, masteryScore);

    if (!subject) {
        throw new Error('Subject not found');
    }

    const weakTopics = new Set(subject.weak_topics);
    const strongTopics = new Set(subject.strong_topics);

    if (masteryScore < 60) {
        weakTopics.add(topic);
        strongTopics.delete(topic);
    } else if (masteryScore > 80) {
        strongTopics.add(topic);
        weakTopics.delete(topic);
    } else {
        weakTopics.delete(topic);
        strongTopics.delete(topic);
    }

    const masteryValues = [...subject.topic_mastery_map.values()];
    const avgMastery =
        masteryValues.length > 0
            ? masteryValues.reduce((sum, val) => sum + val, 0) / masteryValues.length
            : 0;

    return await subjectRepository.updateSubject(subjectId, {
        weak_topics: [...weakTopics],
        strong_topics: [...strongTopics],
        avg_subject_mastery: Math.round(avgMastery * 100) / 100,
    });
};

export const incrementSubjectSwap = async (subjectId) => {
    const subject = await subjectRepository.incrementSwap(subjectId);

    if (!subject) {
        throw new Error('Subject not found');
    }

    return subject;
};

export const updateDensityPreference = async (subjectId, density) => {
    const clampedDensity = Math.max(0, Math.min(100, density));

    const subject = await subjectRepository.updateSubject(subjectId, {
        explanation_density_preference: clampedDensity,
    });

    if (!subject) {
        throw new Error('Subject not found');
    }

    return subject;
};

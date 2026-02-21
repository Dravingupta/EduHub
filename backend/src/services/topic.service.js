import * as topicRepository from '../repositories/topic.repository.js';

export const createTopicsFromSyllabus = async (subjectId, syllabus) => {
    if (!syllabus || typeof syllabus !== 'object' || Object.keys(syllabus).length === 0) {
        throw new Error('Syllabus must be a non-empty object');
    }

    const topicDocuments = [];
    let orderIndex = 0;

    for (const [sectionName, topics] of Object.entries(syllabus)) {
        if (!Array.isArray(topics)) {
            throw new Error(`Topics for section "${sectionName}" must be an array`);
        }

        for (const topicName of topics) {
            topicDocuments.push({
                subject_id: subjectId,
                topic_name: topicName,
                section_name: sectionName,
                order_index: orderIndex,
            });
            orderIndex += 1;
        }
    }

    return await topicRepository.bulkCreateTopics(topicDocuments);
};

export const getSubjectTopics = async (subjectId) => {
    return await topicRepository.getOrderedTopics(subjectId);
};

export const markTopicCompleted = async (topicId) => {
    const topic = await topicRepository.markTopicComplete(topicId);

    if (!topic) {
        throw new Error('Topic not found');
    }

    return topic;
};

export const deleteAllTopicsOfSubject = async (subjectId) => {
    return await topicRepository.deleteBySubject(subjectId);
};

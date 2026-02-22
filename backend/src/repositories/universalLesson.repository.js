import UniversalLesson from '../models/universalLesson.model.js';

export const findBySubjectAndTopic = async (subjectName, topicName) => {
    return await UniversalLesson.findOne({ subject_name: subjectName, topic_name: topicName });
};

export const createOrUpdateUniversalLesson = async (subjectName, topicName, lessonData) => {
    return await UniversalLesson.findOneAndUpdate(
        { subject_name: subjectName, topic_name: topicName },
        { lesson_data: lessonData },
        { new: true, upsert: true } // upsert = insert if it doesn't exist
    );
};

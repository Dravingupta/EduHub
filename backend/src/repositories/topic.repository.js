import Topic from '../models/topic.model.js';

export const createTopic = async (data) => {
    const topic = new Topic(data);
    return await topic.save();
};

export const bulkCreateTopics = async (topicArray) => {
    return await Topic.insertMany(topicArray);
};

export const findBySubject = async (subjectId) => {
    return await Topic.find({ subject_id: subjectId });
};

export const findById = async (topicId) => {
    return await Topic.findById(topicId);
};

export const updateTopic = async (topicId, updateData) => {
    return await Topic.findByIdAndUpdate(
        topicId,
        { $set: updateData },
        { new: true, runValidators: true }
    );
};

export const deleteTopic = async (topicId) => {
    return await Topic.findByIdAndDelete(topicId);
};

export const markTopicComplete = async (topicId) => {
    return await Topic.findByIdAndUpdate(
        topicId,
        { $set: { is_completed: true } },
        { new: true }
    );
};

export const getOrderedTopics = async (subjectId) => {
    return await Topic.find({ subject_id: subjectId }).sort({ order_index: 1 });
};

export const deleteBySubject = async (subjectId) => {
    return await Topic.deleteMany({ subject_id: subjectId });
};

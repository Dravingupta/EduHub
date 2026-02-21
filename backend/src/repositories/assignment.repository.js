import Assignment from '../models/assignment.model.js';

export const createAssignment = async (data) => {
    const assignment = new Assignment(data);
    return await assignment.save();
};

export const findById = async (assignmentId) => {
    return await Assignment.findById(assignmentId);
};

export const updateAssignment = async (assignmentId, updateObject) => {
    return await Assignment.findByIdAndUpdate(
        assignmentId,
        { $set: updateObject },
        { new: true, runValidators: true }
    );
};

export const findByUserAndTopic = async (userId, topicId) => {
    return await Assignment.find({ user_id: userId, topic_id: topicId });
};

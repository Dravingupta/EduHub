import Subject from '../models/subject.model.js';

export const createSubject = async (data) => {
    const subject = new Subject(data);
    return await subject.save();
};

export const findByUser = async (userId) => {
    return await Subject.find({ user_id: userId });
};

export const findById = async (subjectId) => {
    return await Subject.findById(subjectId);
};

export const findByUserAndName = async (userId, subjectName) => {
    return await Subject.findOne({ user_id: userId, subject_name: subjectName });
};

export const updateSubject = async (subjectId, updateObject) => {
    return await Subject.findByIdAndUpdate(
        subjectId,
        { $set: updateObject },
        { new: true, runValidators: true }
    );
};

export const deleteSubject = async (subjectId) => {
    return await Subject.findByIdAndDelete(subjectId);
};

export const updateTopicMastery = async (subjectId, topic, masteryScore) => {
    return await Subject.findByIdAndUpdate(
        subjectId,
        { $set: { [`topic_mastery_map.${topic}`]: masteryScore } },
        { new: true }
    );
};

export const incrementSwap = async (subjectId) => {
    return await Subject.findByIdAndUpdate(
        subjectId,
        { $inc: { swap_count: 1 } },
        { new: true }
    );
};

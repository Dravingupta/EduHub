import Activity from '../models/activity.model.js';

export const findByUserAndDate = async (userId, date) => {
    return await Activity.findOne({ user_id: userId, date });
};

export const createActivity = async (data) => {
    const activity = new Activity(data);
    return await activity.save();
};

export const updateActivity = async (activityId, updateObject) => {
    return await Activity.findByIdAndUpdate(
        activityId,
        updateObject,
        { new: true, runValidators: true }
    );
};

export const getUserActivities = async (userId) => {
    return await Activity.find({ user_id: userId }).sort({ date: -1 });
};

export const getRecentActivities = async (userId, limit) => {
    return await Activity.find({ user_id: userId })
        .sort({ date: -1 })
        .limit(limit);
};

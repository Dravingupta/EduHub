import User from '../models/user.model.js';

export const findByFirebaseUID = async (firebaseUID) => {
    return await User.findOne({ firebase_uid: firebaseUID });
};

export const createUser = async (firebaseUID) => {
    const user = new User({ firebase_uid: firebaseUID });
    return await user.save();
};

export const updateGlobalProfile = async (firebaseUID, updateObject) => {
    const updateFields = {};

    for (const [key, value] of Object.entries(updateObject)) {
        updateFields[`global_behavior_profile.${key}`] = value;
    }

    return await User.findOneAndUpdate(
        { firebase_uid: firebaseUID },
        { $set: updateFields },
        { new: true, runValidators: true }
    );
};

export const incrementSwapUsage = async (firebaseUID) => {
    return await User.findOneAndUpdate(
        { firebase_uid: firebaseUID },
        { $inc: { 'global_behavior_profile.swap_usage': 1 } },
        { new: true }
    );
};

export const incrementRetryCount = async (firebaseUID) => {
    return await User.findOneAndUpdate(
        { firebase_uid: firebaseUID },
        { $inc: { 'global_behavior_profile.retry_count': 1 } },
        { new: true }
    );
};

import * as userRepository from '../repositories/user.repository.js';
import * as subjectRepository from '../repositories/subject.repository.js';

export const getOrCreateUser = async (firebaseUID) => {
    let user = await userRepository.findByFirebaseUID(firebaseUID);

    if (!user) {
        user = await userRepository.createUser(firebaseUID);
    }

    return user;
};

export const updateGlobalBehavior = async (firebaseUID, payload) => {
    const allowedFields = [
        'avg_time_per_question',
        'swap_usage',
        'preferred_density',
        'retry_count',
    ];

    const sanitizedPayload = {};

    for (const key of Object.keys(payload)) {
        if (allowedFields.includes(key)) {
            sanitizedPayload[key] = payload[key];
        }
    }

    if (Object.keys(sanitizedPayload).length === 0) {
        throw new Error('No valid fields provided for update');
    }

    return await userRepository.updateGlobalProfile(firebaseUID, sanitizedPayload);
};

export const incrementSwap = async (firebaseUID) => {
    return await userRepository.incrementSwapUsage(firebaseUID);
};

export const incrementRetry = async (firebaseUID) => {
    return await userRepository.incrementRetryCount(firebaseUID);
};

export const recalculateGlobalDensity = async (userId, firebaseUID) => {
    const subjects = await subjectRepository.findByUser(userId);

    if (!subjects || subjects.length === 0) return;

    // Use only subjects that have explicitly drifted from the default 50
    // or just average all of them. Averaging all provides a smoother curve.
    const totalDensity = subjects.reduce((sum, subj) => sum + (subj.explanation_density_preference || 50), 0);
    const avgDensity = Math.round(totalDensity / subjects.length);

    await userRepository.updateGlobalProfile(firebaseUID, {
        preferred_density: avgDensity
    });
};

import * as userRepository from '../repositories/user.repository.js';

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

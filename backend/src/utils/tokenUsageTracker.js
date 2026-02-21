/**
 * Token Usage Tracker Utility.
 * Tracks LLM token consumption per user and per endpoint.
 *
 * TODO: Persist to database for production usage
 * TODO: Add daily/monthly reset logic
 * TODO: Add budget limits per user
 */

const usageStore = {
    total_tokens: 0,
    per_user: {},
    per_endpoint: {},
};

export const trackTokenUsage = ({ userId, endpoint, tokensUsed }) => {
    usageStore.total_tokens += tokensUsed;

    if (!usageStore.per_user[userId]) {
        usageStore.per_user[userId] = 0;
    }
    usageStore.per_user[userId] += tokensUsed;

    if (!usageStore.per_endpoint[endpoint]) {
        usageStore.per_endpoint[endpoint] = 0;
    }
    usageStore.per_endpoint[endpoint] += tokensUsed;
};

export const getUsageStats = () => {
    return { ...usageStore };
};

export const getUserUsage = (userId) => {
    return usageStore.per_user[userId] || 0;
};

export const resetUsage = () => {
    usageStore.total_tokens = 0;
    usageStore.per_user = {};
    usageStore.per_endpoint = {};
};

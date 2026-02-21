/**
 * Simple in-memory cache utility.
 * Uses Map with TTL-based expiry.
 *
 * Future:
 * - Replace with Redis for multi-instance deployments
 * - Add cache statistics and monitoring
 */

import { CACHE_TTL_DEFAULT } from '../config/constants.js';

const cacheStore = new Map();

export const setCache = (key, value, ttl = CACHE_TTL_DEFAULT) => {
    const expiresAt = Date.now() + ttl * 1000;
    cacheStore.set(key, { value, expiresAt });
};

export const getCache = (key) => {
    const entry = cacheStore.get(key);

    if (!entry) {
        return null;
    }

    if (Date.now() > entry.expiresAt) {
        cacheStore.delete(key);
        return null;
    }

    return entry.value;
};

export const deleteCache = (key) => {
    cacheStore.delete(key);
};

export const invalidatePattern = (pattern) => {
    for (const key of cacheStore.keys()) {
        if (key.includes(pattern)) {
            cacheStore.delete(key);
        }
    }
};

export const clearAllCache = () => {
    cacheStore.clear();
};

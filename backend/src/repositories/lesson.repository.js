/**
 * Lesson Repository
 *
 * Pure data-access layer — no business logic, no LLM calls.
 * Every function interacts only with MongoDB via Mongoose.
 * Returns lean() objects for read operations (plain JS objects, faster).
 */

import Lesson from "../models/lesson.model.js";

// ─── Create ─────────────────────────────────────────────────────────────────

/**
 * Insert a new lesson document.
 * @param {object} data - Fields matching the Lesson schema.
 * @returns {Promise<object>} The created lesson document.
 */
export async function createLesson(data) {
    try {
        const lesson = await Lesson.create(data);
        return lesson.toObject();
    } catch (error) {
        console.error("[LessonRepo:createLesson] Error:", error.message);
        throw new Error(`[LessonRepo] Failed to create lesson: ${error.message}`);
    }
}

// ─── Read ───────────────────────────────────────────────────────────────────

/**
 * Get all lessons for a user + topic combination (all versions).
 * Sorted newest-first by version.
 * @param {string} userId
 * @param {string} topicId
 * @returns {Promise<object[]>}
 */
export async function getLessonByTopic(userId, topicId) {
    try {
        return await Lesson.find({ user_id: userId, topic_id: topicId })
            .sort({ version: -1 })
            .lean();
    } catch (error) {
        console.error("[LessonRepo:getLessonByTopic] Error:", error.message);
        throw new Error(`[LessonRepo] Failed to fetch lessons: ${error.message}`);
    }
}

/**
 * Get the single currently-active lesson for a user + topic.
 * @param {string} userId
 * @param {string} topicId
 * @returns {Promise<object|null>}
 */
export async function getActiveLesson(userId, topicId) {
    try {
        return await Lesson.findOne({
            user_id: userId,
            topic_id: topicId,
            is_active: true,
        }).lean();
    } catch (error) {
        console.error("[LessonRepo:getActiveLesson] Error:", error.message);
        throw new Error(`[LessonRepo] Failed to fetch active lesson: ${error.message}`);
    }
}

// ─── Update ─────────────────────────────────────────────────────────────────

/**
 * Update a lesson with new data (e.g. new blocks, bumped version).
 * @param {string} lessonId
 * @param {object} newData - Partial update fields.
 * @returns {Promise<object|null>} The updated lesson document.
 */
export async function updateLessonVersion(lessonId, newData) {
    try {
        return await Lesson.findByIdAndUpdate(
            lessonId,
            { $set: newData },
            { new: true, runValidators: true }
        ).lean();
    } catch (error) {
        console.error("[LessonRepo:updateLessonVersion] Error:", error.message);
        throw new Error(`[LessonRepo] Failed to update lesson: ${error.message}`);
    }
}

/**
 * Atomically increment the swap_count by 1.
 * @param {string} lessonId
 * @returns {Promise<object|null>} The updated lesson document.
 */
export async function incrementSwapCount(lessonId) {
    try {
        return await Lesson.findByIdAndUpdate(
            lessonId,
            { $inc: { swap_count: 1 } },
            { new: true }
        ).lean();
    } catch (error) {
        console.error("[LessonRepo:incrementSwapCount] Error:", error.message);
        throw new Error(`[LessonRepo] Failed to increment swap count: ${error.message}`);
    }
}

/**
 * Mark all existing lessons for a user + topic as inactive.
 * Called before inserting a new version so only one stays active.
 * @param {string} userId
 * @param {string} topicId
 * @returns {Promise<object>} Mongoose updateMany result.
 */
export async function deactivatePreviousLessons(userId, topicId) {
    try {
        return await Lesson.updateMany(
            { user_id: userId, topic_id: topicId, is_active: true },
            { $set: { is_active: false } }
        );
    } catch (error) {
        console.error("[LessonRepo:deactivatePreviousLessons] Error:", error.message);
        throw new Error(`[LessonRepo] Failed to deactivate lessons: ${error.message}`);
    }
}

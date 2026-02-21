/**
 * TestBank Repository
 *
 * Data-access layer for predefined Test Sets (JSON/DB static data).
 * Follows clean architecture: pure database operations, no LLM / Business logic.
 */

import TestBank from "../models/testBank.model.js";

/**
 * Creates a new Test Set.
 * @param {object} data - Data matching the TestBank schema.
 * @returns {Promise<object>}
 */
export async function createTestSet(data) {
    try {
        const testSet = await TestBank.create(data);
        return testSet.toObject();
    } catch (error) {
        console.error("[TestBankRepo:createTestSet] Error:", error.message);
        throw new Error(`[TestBankRepo] Failed to create test set: ${error.message}`);
    }
}

/**
 * Fetches all test sets available for a specific topic in a subject.
 * @param {string} subjectName 
 * @param {string} topicName 
 * @returns {Promise<object[]>} Array of Test Sets
 */
export async function getTestSetsByTopic(subjectName, topicName) {
    try {
        return await TestBank.find({ subject_name: subjectName, topic_name: topicName }).lean();
    } catch (error) {
        console.error("[TestBankRepo:getTestSetsByTopic] Error:", error.message);
        throw new Error(`[TestBankRepo] Failed to fetch test sets by topic: ${error.message}`);
    }
}

/**
 * Fetches a single random test set for a given subject & topic.
 * Uses MongoDB aggregation `$sample` pipeline.
 * @param {string} subjectName 
 * @param {string} topicName 
 * @returns {Promise<object|null>} The random test set data, or null
 */
export async function getRandomTestSet(subjectName, topicName) {
    try {
        const randomSets = await TestBank.aggregate([
            { $match: { subject_name: subjectName, topic_name: topicName } },
            { $sample: { size: 1 } }
        ]);
        return randomSets.length > 0 ? randomSets[0] : null;
    } catch (error) {
        console.error("[TestBankRepo:getRandomTestSet] Error:", error.message);
        throw new Error(`[TestBankRepo] Failed to fetch random test set: ${error.message}`);
    }
}

/**
 * Fetches a specific test set by its unique ID.
 * @param {string} testSetId 
 * @returns {Promise<object|null>}
 */
export async function getTestSetById(testSetId) {
    try {
        return await TestBank.findOne({ test_set_id: testSetId }).lean();
    } catch (error) {
        console.error("[TestBankRepo:getTestSetById] Error:", error.message);
        throw new Error(`[TestBankRepo] Failed to fetch test set by ID: ${error.message}`);
    }
}

/**
 * Counts the number of test sets available for a topic.
 * @param {string} subjectName 
 * @param {string} topicName 
 * @returns {Promise<number>}
 */
export async function countTestSetsByTopic(subjectName, topicName) {
    try {
        return await TestBank.countDocuments({ subject_name: subjectName, topic_name: topicName });
    } catch (error) {
        console.error("[TestBankRepo:countTestSetsByTopic] Error:", error.message);
        throw new Error(`[TestBankRepo] Failed to count test sets: ${error.message}`);
    }
}

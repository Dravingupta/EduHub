/**
 * Subject Repository
 *
 * Data-access layer for Subject contexts.
 */

import Subject from "../models/subject.model.js";

/**
 * Get a subject by ID.
 * @param {string} subjectId
 * @returns {Promise<object|null>}
 */
export async function getSubjectById(subjectId) {
    try {
        return await Subject.findById(subjectId).lean();
    } catch (error) {
        console.error("[SubjectRepo:getSubjectById] Error:", error.message);
        throw new Error(`[SubjectRepo] Failed to fetch subject: ${error.message}`);
    }
}

/**
 * Update explanation density for a subject.
 * @param {string} subjectId 
 * @param {number} newDensity 
 * @returns {Promise<object|null>}
 */
export async function updateExplanationDensity(subjectId, newDensity) {
    try {
        return await Subject.findByIdAndUpdate(
            subjectId,
            {
                $set: { explanation_density_preference: newDensity },
                $inc: { swap_count: 1 }
            },
            { new: true, runValidators: true }
        ).lean();
    } catch (error) {
        console.error("[SubjectRepo:updateExplanationDensity] Error:", error.message);
        throw new Error(`[SubjectRepo] Failed to update density: ${error.message}`);
    }
}

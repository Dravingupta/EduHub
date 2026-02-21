/**
 * Lesson Swap Service
 *
 * Handles the logic for regenerating a lesson based on user feedback 
 * (over-explained or under-explained). Updates the subject's explanation 
 * density preference and generates a completely new lesson version dynamically.
 */

import * as LessonRepository from "../repositories/lesson.repository.js";
import * as SubjectRepository from "../repositories/subject.repository.js";
import geminiService from "./llm/gemini.service.js";

/**
 * Regenerate an entire lesson based on swap feedback.
 * 
 * Flow:
 * 1. Fetch active lesson & check swap limit (max 3).
 * 2. Fetch subject context.
 * 3. Update subject explanation_density_preference.
 * 4. Build prompt & call Gemini to generate the new lesson.
 * 5. Deactivate old lesson versions.
 * 6. Save and return new lesson version.
 * 
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.subjectId
 * @param {string} params.topicId
 * @param {string} params.topicName
 * @param {string} params.feedbackType - "over" | "under"
 * @param {number} params.sliderValue - Number between 0 and 100
 * @returns {Promise<object>} The newly created Lesson document
 */
export async function swapLesson({
    userId,
    subjectId,
    topicId,
    topicName,
    feedbackType,
    sliderValue
}) {
    // Validate inputs
    if (!["over", "under"].includes(feedbackType)) {
        throw new Error("[LessonSwapService] Invalid feedbackType. Must be 'over' or 'under'.");
    }
    if (typeof sliderValue !== "number" || sliderValue < 0 || sliderValue > 100) {
        throw new Error("[LessonSwapService] Invalid sliderValue. Must be a number between 0 and 100.");
    }

    console.log(`[LessonSwapService] Starting swap for User: ${userId}, Topic: ${topicId}`);

    // Step 1: Fetch active lesson
    const activeLesson = await LessonRepository.getActiveLesson(userId, topicId);
    if (!activeLesson) {
        throw new Error(`[LessonSwapService] No active lesson found to swap for topic ${topicId}.`);
    }

    // Step 2: Check swap limit
    if (activeLesson.swap_count >= 3) {
        throw new Error("Maximum swaps reached. Please complete assignment.");
    }

    // Step 3: Fetch subject context
    const subject = await SubjectRepository.getSubjectById(subjectId);
    if (!subject) {
        throw new Error(`[LessonSwapService] Subject context not found for ID ${subjectId}.`);
    }

    // Step 4: Update density preference
    const oldDensity = subject.explanation_density_preference ?? 50;

    // Under-explained means user wants MORE density (+ magnitude)
    // Over-explained means user wants LESS density (- magnitude)
    let newDensity = oldDensity + (feedbackType === "under" ? +sliderValue : -sliderValue);

    // Clamp between 0 and 100
    newDensity = Math.max(0, Math.min(100, newDensity));

    console.log(`[LessonSwapService] Updating density from ${oldDensity} to ${newDensity} (Feedback: ${feedbackType}, Slider: ${sliderValue})`);

    // Persist updated preference
    await SubjectRepository.updateExplanationDensity(subjectId, newDensity);

    // Step 5: Regenerate Lesson using Gemini
    const masteryScore = subject.topic_mastery_map?.[topicId] ?? "Unknown";

    const prompt = `
Generate a fully structured educational lesson about the topic: "${topicName}".
Adapt the explanation based on the following learner context:
- Difficulty Preference: ${subject.difficulty_preference}
- Explanation Density (0=terse/bullet-points, 100=highly detailed/story-like): ${newDensity}
- Current Topic Mastery Score (0-100): ${masteryScore}

The previous lesson was deemed "${feedbackType}-explained" by the user. Adjust accordingly.

Return an array of JSON objects representing lesson blocks.
Each block object must strictly contain:
- "type": (one of: "concept", "analogy", "example", "mistakes", "summary", "diagram")
- "title": (string)
- "content": (string, object, or array depending on what best represents the block)
- "metadata": (optional object for extra contextual data)

Output ONLY the JSON array.
`;

    console.log("[LessonSwapService] Calling Gemini to generate new lesson blocks...");
    const generatedBlocks = await geminiService.generateLesson(prompt);

    if (!Array.isArray(generatedBlocks) || generatedBlocks.length === 0) {
        throw new Error("[LessonSwapService] LLM did not return a valid array of blocks.");
    }

    // Step 6: Deactivate old lesson
    console.log("[LessonSwapService] Deactivating old lesson versions...");
    await LessonRepository.deactivatePreviousLessons(userId, topicId);

    // Step 7: Create new lesson with incremented version and swap_count
    const newLessonData = {
        user_id: userId,
        subject_id: subjectId,
        topic_id: topicId,
        blocks: generatedBlocks,
        difficulty_level: subject.difficulty_preference || "medium",
        version: activeLesson.version + 1,
        swap_count: activeLesson.swap_count + 1,
        is_active: true
    };

    console.log(`[LessonSwapService] Creating new lesson (v${newLessonData.version}, swap ${newLessonData.swap_count})...`);
    const newLesson = await LessonRepository.createLesson(newLessonData);

    // Step 8: Return
    console.log("[LessonSwapService] Swap successful ✓");
    return newLesson;
}

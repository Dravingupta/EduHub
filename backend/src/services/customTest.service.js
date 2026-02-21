/**
 * Custom Test Generator Service
 *
 * Handles dynamic test generation for Custom Subjects:
 * Checks if a test already exists in the TestBank for the custom subject's topic.
 * If yes, reuses it to save tokens.
 * If no, calls the Gemini LLM strictly to generate a deterministic 10-MCQ test format,
 * validates it, stores it in the TestBank, and returns it.
 */

import crypto from "crypto";
import * as testBankRepository from "../repositories/testBank.repository.js";
import geminiService from "./llm/gemini.service.js";

/**
 * Validates the JSON format returned by the LLM.
 * @param {object} parsedJson 
 * @returns {boolean}
 */
function validateTestSetFormat(parsedJson) {
    if (!parsedJson || !Array.isArray(parsedJson.questions)) return false;
    if (parsedJson.questions.length !== 10) return false;

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    for (const q of parsedJson.questions) {
        if (!q.question || !q.options || !q.correct_answer || !q.difficulty || !q.concept_tag) {
            return false;
        }
        if (!Array.isArray(q.options) || q.options.length < 4) return false;
        if (!q.options.includes(q.correct_answer)) return false;

        if (q.difficulty === "easy") easyCount++;
        else if (q.difficulty === "medium") mediumCount++;
        else if (q.difficulty === "hard") hardCount++;
        else return false;
    }

    if (easyCount !== 4 || mediumCount !== 4 || hardCount !== 2) return false;

    return true;
}

/**
 * Checks if a test exists for a custom topic. 
 * If not, generates one via Gemini, strictly validates it, stores it,
 * and returns the test.
 *
 * @param {object} params
 * @param {string} params.subjectName
 * @param {string} params.topicName
 * @returns {Promise<object>} The stored TestBank document
 */
export const generateCustomTestIfNotExists = async ({ subjectName, topicName }) => {
    if (!subjectName || !topicName) {
        throw new Error("[CustomTestService] subjectName and topicName are required.");
    }

    // Step 1: Check existing test in the TestBank
    const existingSets = await testBankRepository.getTestSetsByTopic(subjectName, topicName);

    // Custom tests only need 1 set to exist (unlike universal's 5)
    if (existingSets && existingSets.length > 0) {
        console.log(`[CustomTestService] Existing test found for custom topic '${topicName}'. Reusing.`);
        return existingSets[0];
    }

    console.log(`[CustomTestService] No existing test found for custom topic '${topicName}'. Generating via Gemini...`);

    // Step 2: Generate via Gemini
    const prompt = `
Generate 10 MCQs for topic: "${topicName}"

Rules:
Strict JSON only
No explanations
Return an object containing an array named "questions"

Each question must contain:
- "question" (string)
- "options" (array of 4 strings)
- "correct_answer" (string, must exactly match one of the options)
- "difficulty" ("easy" | "medium" | "hard")
- "concept_tag" (string, short sub-topic)

Exactly:
4 easy
4 medium
2 hard

Return format:
{
  "questions": [
    {
      "question": "",
      "options": [],
      "correct_answer": "",
      "difficulty": "",
      "concept_tag": ""
    }
  ]
}

No extra text.
No markdown code blocks if possible.
JSON only.`;

    let validTestSet = null;
    const RETRIES = 1;

    // Step 3: Validate JSON (with 1 retry)
    for (let attempt = 1; attempt <= RETRIES + 1; attempt++) {
        try {
            // geminiService handles raw JSON extraction & parsing
            const result = await geminiService.generateTest(prompt);

            if (validateTestSetFormat(result)) {
                validTestSet = result;
                break; // Success
            } else {
                console.warn(`[CustomTestService] Attempt ${attempt} failed validation constraints. Retrying...`);
            }
        } catch (error) {
            console.error(`[CustomTestService] Attempt ${attempt} LLM error: ${error.message}`);
        }
    }

    if (!validTestSet) {
        throw new Error(`[CustomTestService] Failed to generate a valid custom test set after ${RETRIES + 1} attempts.`);
    }

    // Step 4: Store Test
    console.log(`[CustomTestService] JSON validated. Storing custom test set...`);

    // Clean names to be URL/ID safe
    const safeSubName = subjectName.replace(/\s+/g, "");
    const safeTopName = topicName.replace(/\s+/g, "");
    const uniqueId = `custom_${safeSubName}_${safeTopName}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const storedTest = await testBankRepository.createTestSet({
        subject_name: subjectName,
        topic_name: topicName,
        test_set_id: uniqueId,
        questions: validTestSet.questions,
        total_questions: 10
    });

    // Step 5: Return Stored Test
    return storedTest;
};

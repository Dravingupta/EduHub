import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";

import connectDB from "../config/db.js";
import geminiService from "../services/llm/gemini.service.js";
import { countTestSetsByTopic, createTestSet } from "../repositories/testBank.repository.js";

// Load environment variables for standalone execution
import * as url from 'url';
import path from 'path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Define universal subjects and their topics
const universalSubjects = {
    "Physics_JEE": [
        "Kinematics",
        "Laws of Motion",
        "Magnetism"
    ],
    "Chemistry_JEE": [
        "Atomic Structure",
        "Thermodynamics"
    ],
    "Mathematics_JEE": [
        "Calculus",
        "Algebra",
        "Coordinate Geometry"
    ],
    "Biology_NEET": [
        "Human Physiology",
        "Genetics",
        "Cell Structure"
    ]
};

const REQUIRED_SETS_PER_TOPIC = 5;

/**
 * Validates the pure JSON format returned by the LLM.
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
 * Calls Gemini to generate exactly 10 questions for a topic.
 * @param {string} topicName 
 * @returns {Promise<object>}
 */
async function generateQuestionsWithRetry(topicName, retries = 1) {
    const prompt = `
Generate 10 MCQs for topic: "${topicName}"

Rules:
Strict JSON only
Return an object containing an array named "questions"

Each question must contain:
- "question" (string)
- "options" (array of 4 strings)
- "correct_answer" (string, must exactly match one of the options)
- "explanation" (string, 1-2 concise sentences explaining the correct answer)
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
      "explanation": "",
      "difficulty": "",
      "concept_tag": ""
    }
  ]
}

No extra text.
No markdown code blocks if possible.
JSON only.`;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            console.log(`    [Attempt ${attempt}/${retries + 1}] Generating...`);
            // Since geminiService parses JSON already, we'll get an object back!
            const result = await geminiService.generateTest(prompt);

            if (validateTestSetFormat(result)) {
                return result;
            } else {
                console.warn(`    [Attempt ${attempt}/${retries + 1}] Passed JSON parsing but failed strict logic validation (e.g., question count, difficulty distribution).`);
            }
        } catch (error) {
            console.error(`    [Attempt ${attempt}/${retries + 1}] Failed:`, error.message);
        }
    }

    throw new Error("Failed to generate a valid test set after max retries.");
}

async function runGenerator() {
    console.log("=========================================");
    console.log(" Universal Test Bank Generator Script");
    console.log("=========================================\n");

    // Step 1: Connect to DB
    await connectDB();

    // Step 2 & 3: Loop through topics
    for (const [subjectName, topics] of Object.entries(universalSubjects)) {
        console.log(`\n📚 Processing Subject: ${subjectName}`);

        for (const topicName of topics) {
            console.log(`  -> Topic: ${topicName}`);

            try {
                const existingCount = await countTestSetsByTopic(subjectName, topicName);
                console.log(`     Existing Test Sets: ${existingCount} / ${REQUIRED_SETS_PER_TOPIC}`);

                if (existingCount >= REQUIRED_SETS_PER_TOPIC) {
                    console.log(`     ✓ Sufficient test sets exist. Skipping.`);
                    continue;
                }

                const setsToGenerate = REQUIRED_SETS_PER_TOPIC - existingCount;

                for (let i = 0; i < setsToGenerate; i++) {
                    console.log(`\n     Generating Set ${existingCount + i + 1}/${REQUIRED_SETS_PER_TOPIC}...`);

                    const testDataJson = await generateQuestionsWithRetry(topicName);

                    // Step 4: Generate unique ID
                    const shortEnv = process.env.NODE_ENV === "production" ? "prod" : "dev";
                    const uniqueId = `${subjectName}_${topicName.replace(/\s+/g, "")}_${crypto.randomUUID()}_${Date.now()}`;

                    // Step 6: Save using repository
                    await createTestSet({
                        subject_name: subjectName,
                        topic_name: topicName,
                        test_set_id: uniqueId,
                        questions: testDataJson.questions,
                        total_questions: 10
                    });

                    console.log(`     ✓ Saved Test Set: ${uniqueId}`);
                }
            } catch (error) {
                console.error(`     ❌ Error processing topic "${topicName}":`, error.message);
                // We continue to the next topic so one failure doesn't halt the whole script
            }
        }
    }

    console.log("\n=========================================");
    console.log(" Finished generating Test Bank!");
    console.log("=========================================\n");

    // Step 7: Graceful Exit (close Mongoose socket so process ends naturally)
    await mongoose.disconnect();
    process.exit(0);
}

runGenerator().catch((error) => {
    console.error("FATAL ERROR in Test Bank Generator:", error);
    process.exit(1);
});

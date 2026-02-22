import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import geminiService from "../services/llm/gemini.service.js";
import { UNIVERSAL_SUBJECTS } from "../config/constants.js";
import { findBySubjectAndTopic, createOrUpdateUniversalLesson } from "../repositories/universalLesson.repository.js";

// Load environment variables for standalone execution
import * as url from 'url';
import path from 'path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Validates the pure JSON format returned by the LLM.
 */
function validateLessonFormat(parsedJson) {
    if (!parsedJson || !Array.isArray(parsedJson.blocks)) return false;
    if (parsedJson.blocks.length < 3) return false;

    let hasDiagram = false;
    for (const block of parsedJson.blocks) {
        if (!block.type || !block.title || !block.content) return false;
        const validTypes = ['concept', 'example', 'diagram', 'mistakes', 'summary'];
        if (!validTypes.includes(block.type)) return false;
        if (block.type === 'diagram') hasDiagram = true;
    }

    return hasDiagram;
}

/**
 * Calls Gemini to generate a standard lesson for a topic.
 */
async function generateLessonWithRetry(subjectName, topicName, retries = 2) {
    const prompt = `
You are an expert tutor creating a progressive digital lesson.
Subject: ${subjectName}
Topic: ${topicName}

ADAPTIVE PREFERENCES:
- Difficulty Level: medium
- Explanation Style: Provide balanced, standard length explanations.

OUTPUT FORMAT REQUIREMENT:
You must return your lesson exactly as a JSON object containing a "blocks" array.
Each block must be a component with a specific "type", "title", and "content".
Follow this strict schema:
{
  "blocks": [
    {
      "type": "Enum('concept', 'example', 'diagram', 'mistakes', 'summary')",
      "title": "Short descriptive title",
      "content": "The actual payload for this block"
    }
  ]
}

BLOCK TYPE RULES:
- "concept": Standard explanation cards. Use proper Markdown and LaTeX ($ inline $, $$ block $$) for math formulas or matrices. Do NOT use Mermaid here.
- "example": Concrete analogies, code snippets, or mathematical step-by-step applications. Use LaTeX for math.
- "diagram": Visual diagram block. The 'content' field MUST contain ONLY valid Mermaid.js syntax code (e.g. flowchart TD, mindmap). Do NOT wrap in markdown code fences. Use simple node labels and NO mathematical brackets or special characters inside the mermaid graph.
- "mistakes": Common pitfalls or student misconceptions.
- "summary": The final wrap-up before an assignment.

Ensure the "blocks" array logically flows progressively. Keep it engaging. You MUST include exactly 2 "diagram" blocks somewhere in the lesson to visualize relationships, and leave complex math to the text blocks using LaTeX. Output ONLY VALID JSON.`;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            console.log(`    [Attempt ${attempt}/${retries + 1}] Generating lesson...`);
            const result = await geminiService.generateLesson(prompt);

            if (validateLessonFormat(result)) {
                return result;
            } else {
                console.warn(`    [Attempt ${attempt}/${retries + 1}] Passed JSON parsing but failed validation (e.g., missing diagrams or required fields).`);
            }
        } catch (error) {
            console.error(`    [Attempt ${attempt}/${retries + 1}] Failed:`, error.message);
        }
    }

    throw new Error("Failed to generate a valid lesson after max retries.");
}

async function runLessonGenerator() {
    console.log("=========================================");
    console.log(" Universal Lesson Generator Script");
    console.log("=========================================\n");

    // Connect to DB
    await connectDB();

    for (const [subjectName, topics] of Object.entries(UNIVERSAL_SUBJECTS)) {
        console.log(`\n📚 Processing Subject: ${subjectName}`);

        for (const topicName of topics) {
            console.log(`  -> Topic: ${topicName}`);

            try {
                const existing = await findBySubjectAndTopic(subjectName, topicName);
                if (existing) {
                    console.log(`     ✓ Lesson exists in cache. Skipping.`);
                    continue;
                }

                console.log(`     Generating new lesson for ${topicName}...`);
                const lessonData = await generateLessonWithRetry(subjectName, topicName);

                await createOrUpdateUniversalLesson(subjectName, topicName, lessonData);
                console.log(`     ✓ Saved Lesson to UniversalLesson cache.`);
            } catch (error) {
                console.error(`     ❌ Error processing topic "${topicName}":`, error.message);
            }
        }
    }

    console.log("\n=========================================");
    console.log(" Finished generating Universal Lessons!");
    console.log("=========================================\n");

    await mongoose.disconnect();
    process.exit(0);
}

runLessonGenerator().catch((error) => {
    console.error("FATAL ERROR in Universal Lesson Generator:", error);
    process.exit(1);
});

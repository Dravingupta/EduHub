import geminiService from './llm/gemini.service.js';
import * as topicRepository from '../repositories/topic.repository.js';
import * as subjectRepository from '../repositories/subject.repository.js';
import * as universalLessonRepository from '../repositories/universalLesson.repository.js';
import youtubeService from './youtube.service.js';

/**
 * Generates a structured progressive lesson via Gemini.
 * Uses the requested topic, and adapts to the user's specific context 
 * (explanation density and difficulty) stored in the Subject document.
 */
export const generateVisualLesson = async (userId, topicId, forceRegenerate = false) => {
    // 1. Fetch Topic Context
    let topic;
    try {
        topic = await topicRepository.findById(topicId);
        if (!topic) throw new Error("Topic not found");
    } catch (e) {
        throw new Error("Invalid topic ID or repository error. " + e.message);
    }

    // Return cached lesson if it exists and we aren't forcing a regeneration
    if (topic.lesson_data && !forceRegenerate) {
        console.log(`[LessonService] Loading cached lesson for Topic: ${topic.topic_name}`);
        return topic.lesson_data;
    }

    // 2. Fetch Subject Context (for adaptive preferences)
    let subject;
    try {
        subject = await subjectRepository.findById(topic.subject_id);
    } catch (e) {
        throw new Error("Failed to find linked subject. " + e.message);
    }

    if (!subject) throw new Error("Subject not found");

    // Verify authorized user
    if (subject.user_id.toString() !== userId.toString()) {
        throw new Error("Unauthorized access to this subject context");
    }

    // 2.5. Check UniversalLesson Cache
    if (subject.type === 'universal' && !forceRegenerate) {
        const universalCache = await universalLessonRepository.findBySubjectAndTopic(subject.subject_name, topic.topic_name);
        if (universalCache && universalCache.lesson_data) {
            console.log(`[LessonService] Loading Universal cached lesson for Topic: ${topic.topic_name}`);
            topic.lesson_data = universalCache.lesson_data;
            await topic.save();
            return universalCache.lesson_data;
        }
    }

    // 3. Extract Context Variables
    const density = subject.explanation_density_preference || 50; // 0-100
    const difficulty = subject.difficulty_preference || "medium";

    // Convert numeric density into an instructional prompt
    let densityInstruction = "Provide balanced, standard length explanations.";
    if (density < 30) densityInstruction = "Be extremely concise and direct. Use bullet points heavily. Minimize fluff.";
    if (density > 70) densityInstruction = "Provide very detailed, elaborate explanations. Use analogies. Break concepts down slowly into granular steps.";

    // 3.5 Check for existing YouTube Block to preserve during Swaps
    let existingYoutubeBlock = null;
    if (forceRegenerate && topic.lesson_data && topic.lesson_data.blocks) {
        existingYoutubeBlock = topic.lesson_data.blocks.find(b => b.type === 'youtube');
    }

    // 4. Construct the Adaptive LLM Prompt
    // Modify prompt slightly if we are injecting the existing youtube block
    const prompt = `
You are an expert tutor creating a progressive digital lesson.
Subject: ${subject.subject_name}
Topic: ${topic.topic_name} (Belongs to section: ${topic.section_name})

ADAPTIVE PREFERENCES:
- Difficulty Level: ${difficulty}
- Explanation Style: ${densityInstruction}

OUTPUT FORMAT REQUIREMENT:
You must return your lesson exactly as a JSON object containing a "blocks" array.
Each block must be a component with a specific "type", "title", and "content".
Follow this strict schema:
{
  "blocks": [
    {
      "type": "Enum('concept', 'example', 'diagram', 'youtube', 'mistakes', 'summary')",
      "title": "Short descriptive title",
      "content": "The actual payload for this block"
    }
  ]
}

CRITICAL JSON ESCAPING: Because your output is a JSON string, you MUST double-escape all LaTeX backslashes. For example, write \\\\frac instead of \\frac, and \\\\bar instead of \\bar.

BLOCK TYPE RULES:
- "concept": Standard explanation cards. Use proper Markdown and LaTeX ($ inline $, $$ block $$) for math formulas or matrices. Do NOT use Mermaid here.
- "example": Concrete analogies, code snippets, or mathematical step-by-step applications. Use LaTeX for math.
- "diagram": Visual diagram block. The 'content' field MUST contain ONLY valid Mermaid.js syntax. STRICT RULES for diagrams:
  * Use ONLY "graph TD" or "graph LR" as the diagram type (do NOT use "flowchart").
  * Use simple single-word node IDs (A, B, C, etc.) with labels in square brackets: A["Label text"]
  * Do NOT use parentheses () for node shapes — only square brackets [].
  * Do NOT use special characters like |, &, <, >, or semicolons in labels.
  * Do NOT wrap in markdown code fences.
  * Keep labels short (2-5 words max).
  * Example: graph TD\n  A["Newton Laws"] --> B["First Law"]\n  A --> C["Second Law"]\n  A --> D["Third Law"]
${existingYoutubeBlock ? '' : '- "youtube": A video recommendation block. The \'content\' MUST be a highly specific Google/YouTube search query designed to find the best educational animation or crash course for this topic (e.g. "Simple Harmonic Motion animation physics"). '}
- "mistakes": Common pitfalls or student misconceptions.
- "summary": The final wrap-up before an assignment.

STRICT STRUCTURAL ORDER:
${existingYoutubeBlock ? '1. The VERY FIRST block in the array (index 0) MUST be a "concept" block with the exact title "Topic Notes".\n2. The rest of the blocks can follow any logical sequence, but you MUST still include exactly 2 "diagram" blocks somewhere in the lesson.' : '1. The VERY FIRST block in the array (index 0) MUST be a "youtube" block.\n2. The VERY SECOND block in the array (index 1) MUST be a "concept" block with the exact title "Topic Notes".\n3. The rest of the blocks can follow any logical sequence, but you MUST still include exactly 2 "diagram" blocks somewhere in the lesson.'}

Ensure the "blocks" array logically flows progressively. Keep it engaging. Output ONLY VALID JSON.`;

    // 5. Call LLM
    console.log(`[LessonService] Generating new lesson for Topic: ${topic.topic_name} | Density: ${density} | Difficulty: ${difficulty}`);

    if (forceRegenerate) {
        console.log(`[LessonService] Tracking Adaptive Swap metric for Subject: ${subject._id}`);
        await subjectRepository.incrementSwap(subject._id);
    }

    const generatedLessonData = await geminiService.generateLesson(prompt);

    // Validate the response roughly
    if (!generatedLessonData || !Array.isArray(generatedLessonData.blocks)) {
        throw new Error("LLM did not return a valid blocks array.");
    }

    // 5.5 Re-inject existing YouTube block OR resolve new one
    if (existingYoutubeBlock) {
        console.log(`[LessonService] Preserving existing YouTube block for swapped lesson.`);
        generatedLessonData.blocks.unshift(existingYoutubeBlock);
    } else {
        // Resolve YouTube Queries for newly generated lessons
        for (let i = 0; i < generatedLessonData.blocks.length; i++) {
            const block = generatedLessonData.blocks[i];
            if (block.type === 'youtube') {
                const videoId = await youtubeService.searchVideo(block.content);
                if (videoId) {
                    block.content = videoId;
                } else {
                    // Feature degradation fallback
                    block.type = 'concept';
                    block.content = `We couldn't fetch a video right now, but we highly recommend searching YouTube for: **${block.content}**`;
                }
            }
        }
    }

    // 6. Cache the generated lesson back to the MongoDB topic document
    topic.lesson_data = generatedLessonData;
    await topic.save();

    return generatedLessonData;
};

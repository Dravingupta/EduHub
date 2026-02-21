import geminiService from './llm/gemini.service.js';
import * as topicRepository from '../repositories/topic.repository.js';
import * as subjectRepository from '../repositories/subject.repository.js';

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

    // 3. Extract Context Variables
    const density = subject.explanation_density_preference || 50; // 0-100
    const difficulty = subject.difficulty_preference || "medium";

    // Convert numeric density into an instructional prompt
    let densityInstruction = "Provide balanced, standard length explanations.";
    if (density < 30) densityInstruction = "Be extremely concise and direct. Use bullet points heavily. Minimize fluff.";
    if (density > 70) densityInstruction = "Provide very detailed, elaborate explanations. Use analogies. Break concepts down slowly into granular steps.";

    // 4. Construct the Adaptive LLM Prompt
    const prompt = `
You are an expert tutor creating a progressive digital lesson.
Subject: ${subject.subject_name}
Topic: ${topic.topic_name} (Belongs to section: ${topic.section_name})

ADAPTIVE PREFERENCES:
- Difficulty Level: ${difficulty}
- Explanation Style: ${densityInstruction}

OUTPUT FORMAT REQUIREMENT:
You must return your lesson exactly as a JSON object containing a "blocks" array.
Each block must be a visual component with a specific "type", "title", and "content".
Follow this strict schema:
{
  "blocks": [
    {
      "type": "Enum('concept', 'example', 'diagram', 'mistakes', 'summary')",
      "title": "Short descriptive title",
      "content": "The actual text/markdown payload for this block"
    }
  ]
}

BLOCK TYPE RULES:
- "concept": Standard explanation cards.
- "example": Concrete analogies, code snippets, or mathematical step-by-step applications.
- "diagram": Text-based visualizations or lists.
- "mistakes": Common pitfalls or student misconceptions.
- "summary": The final wrap-up before an assignment.

Ensure the "blocks" array logically flows progressively. Keep it engaging. Output ONLY VALID JSON.`;

    // 5. Call LLM
    console.log(`[LessonService] Generating new lesson for Topic: ${topic.topic_name} | Density: ${density} | Difficulty: ${difficulty}`);

    const generatedLessonData = await geminiService.generateLesson(prompt);

    // Validate the response roughly
    if (!generatedLessonData || !Array.isArray(generatedLessonData.blocks)) {
        throw new Error("LLM did not return a valid blocks array.");
    }

    // 6. Cache the generated lesson back to the MongoDB topic document
    topic.lesson_data = generatedLessonData;
    await topic.save();

    return generatedLessonData;
};

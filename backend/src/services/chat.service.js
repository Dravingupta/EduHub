/**
 * Chat Service — Handles AI-powered concept explanations for assignment questions.
 * 
 * Builds a context-aware prompt from the question, explanation, and chat history,
 * then calls the LLM in text mode for a natural conversational response.
 */

import geminiService from './llm/gemini.service.js';

/**
 * @param {object} params
 * @param {string} params.question        - The MCQ question text
 * @param {string} params.explanation     - The existing short explanation
 * @param {string} params.correctAnswer   - The correct answer
 * @param {string} params.userAnswer      - What the student selected
 * @param {string} params.userMessage     - The student's follow-up question
 * @param {Array}  params.chatHistory     - Previous messages [{role, content}]
 * @returns {Promise<string>} AI response text
 */
export const askConceptQuestion = async ({
    question,
    explanation,
    correctAnswer,
    userAnswer,
    userMessage,
    chatHistory = []
}) => {
    const systemPrompt = `You are a friendly, expert tutor helping a student understand a concept they got wrong on an assignment.

CONTEXT:
- Question: "${question}"
- Student's Answer: "${userAnswer}"
- Correct Answer: "${correctAnswer}"
- Short Explanation: "${explanation}"

RULES:
1. Explain clearly and patiently, using analogies and examples when helpful.
2. Keep responses concise but thorough (3-6 sentences typically).
3. If the student asks something unrelated to this concept, gently redirect them.
4. Use simple language. Avoid jargon unless the student uses it first.
5. If the student seems to understand, encourage them and suggest what to study next.
6. NEVER use markdown formatting. No **, no *, no #, no \`\`\`, no bullet symbols. Respond in plain text only. Use simple dashes (-) for lists if needed.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: userMessage }
    ];

    return await geminiService.chatWithConcept(messages);
};

/**
 * Lesson helper chat — provides tutoring within a lesson context.
 * @param {object} params
 * @param {string} params.topicName       - Current topic name
 * @param {string} params.blockTitle      - Current lesson block title
 * @param {string} params.blockContent    - Current lesson block content (truncated)
 * @param {string} params.userMessage     - The student's question
 * @param {Array}  params.chatHistory     - Previous messages [{role, content}]
 * @returns {Promise<string>} AI response text
 */
export const askLessonQuestion = async ({
    topicName,
    blockTitle,
    blockContent,
    userMessage,
    chatHistory = []
}) => {
    const contentSnippet = blockContent?.substring(0, 500) || '';

    const systemPrompt = `You are an expert tutor helping a student who is studying a lesson on "${topicName}".

CURRENT LESSON SECTION:
- Title: "${blockTitle}"
- Content snippet: "${contentSnippet}"

RULES:
1. Answer questions about this topic clearly and patiently.
2. Use analogies, examples, and step-by-step explanations when helpful.
3. Keep responses concise (3-6 sentences) unless the student asks for more detail.
4. If the student asks about something outside this topic, briefly answer but guide them back.
5. Use simple language. Avoid unnecessary jargon.
6. NEVER use markdown formatting. No **, no *, no #, no \`\`\`, no bullet symbols. Respond in plain text only. Use simple dashes (-) for lists if needed.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: userMessage }
    ];

    return await geminiService.chatWithConcept(messages);
};

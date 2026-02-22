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

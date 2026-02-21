/**
 * MegaLLM Service — Centralized LLM service powered by MegaLLM (OpenAI SDK compatible).
 *
 * Env required:
 *   MEGALLM_API_KEY=your-key
 */

import OpenAI from 'openai';

// Force nodemon restart to load .env

// ─── Config ─────────────────────────────────────────────────────────────────

const MODEL = 'gemini-3-flash-preview';

// ─── Prompt Templates ───────────────────────────────────────────────────────

const PROMPTS = {
    system: (userPrompt) =>
        `You are an expert educational content generator.\n` +
        `RULES:\n` +
        `1. Respond ONLY with valid JSON — no markdown fences, no explanations.\n` +
        `2. Be concise and token-efficient.\n\n` +
        `${userPrompt}`,
};

// ─── JSON Parser ────────────────────────────────────────────────────────────

/**
 * Safely parse a string as JSON. Strips code fences the model might add.
 * @param {string} raw
 * @returns {object}
 */
function parseJSON(raw) {
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    try {
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("[MegaLLMService] JSON parse failed. Raw output:\n", raw);
        throw new Error(`[MegaLLMService] LLM returned invalid JSON. Parse error: ${err.message}`);
    }
}

// ─── Service Class ──────────────────────────────────────────────────────────

class GeminiService { // Kept name GeminiService for compatibility with import usages
    #client;

    constructor() {
        const apiKey = process.env.MEGALLM_API_KEY;
        if (!apiKey) {
            console.warn("[MegaLLMService] MEGALLM_API_KEY is missing. Add it to your .env file.");
        }

        this.#client = new OpenAI({
            baseURL: 'https://ai.megallm.io/v1',
            apiKey: apiKey || 'missing-key'
        });

        console.log(`[MegaLLMService] Initialized — model: ${MODEL}`);
    }

    // ── Internal ────────────────────────────────────────────────────────────

    async #generate(prompt, label) {
        if (!prompt || typeof prompt !== "string") {
            throw new Error(`[MegaLLMService:${label}] Prompt must be a non-empty string.`);
        }

        try {
            console.log(`[MegaLLMService:${label}] Generating…`);

            const response = await this.#client.chat.completions.create({
                model: MODEL,
                messages: [
                    { role: 'system', content: PROMPTS.system("") },
                    { role: 'user', content: prompt }
                ]
            });

            const content = response.choices[0]?.message?.content?.trim();

            if (!content) {
                throw new Error("Empty response received from MegaLLM.");
            }

            const parsed = parseJSON(content);
            console.log(`[MegaLLMService:${label}] Success ✓`);
            return parsed;
        } catch (error) {
            console.error(`[MegaLLMService:${label}] Failed:`, error.message);
            throw new Error(`[MegaLLMService:${label}] ${error.message}`);
        }
    }

    // ── Public API ──────────────────────────────────────────────────────────

    async generateLesson(prompt) {
        return this.#generate(prompt, "generateLesson");
    }

    async regenerateLesson(prompt) {
        return this.#generate(prompt, "regenerateLesson");
    }

    async generateTest(prompt) {
        return this.#generate(prompt, "generateTest");
    }

    async generateCustomTest(prompt) {
        return this.#generate(prompt, "generateCustomTest");
    }
}

// ─── Singleton Export ───────────────────────────────────────────────────────

const geminiService = new GeminiService();
export default geminiService;

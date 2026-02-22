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

        const MAX_RETRIES = 3;
        let delayMs = 1500;
        let lastError;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`[MegaLLMService:${label}] Generating… (Attempt ${attempt}/${MAX_RETRIES})`);

                const response = await this.#client.chat.completions.create({
                    model: MODEL,
                    response_format: { type: "json_object" },
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
                lastError = error;
                console.warn(`[MegaLLMService:${label}] Attempt ${attempt} failed: ${error.message}`);

                if (attempt < MAX_RETRIES) {
                    console.log(`[MegaLLMService:${label}] Waiting ${delayMs}ms before retrying...`);
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                    delayMs *= 2; // exponential backoff
                }
            }
        }

        console.error(`[MegaLLMService:${label}] All ${MAX_RETRIES} attempts failed.`);
        throw new Error(`[MegaLLMService:${label}] ${lastError?.message || "Unknown error"}`);
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

    /**
     * Chat-style completion for concept explanations (plain text, no JSON).
     * @param {Array<{role: string, content: string}>} messages
     * @returns {Promise<string>} AI response text
     */
    async chatWithConcept(messages) {
        const MAX_RETRIES = 2;
        let delayMs = 1000;
        let lastError;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`[MegaLLMService:conceptChat] Generating… (Attempt ${attempt}/${MAX_RETRIES})`);

                const response = await this.#client.chat.completions.create({
                    model: MODEL,
                    messages
                });

                const content = response.choices[0]?.message?.content?.trim();
                if (!content) throw new Error("Empty response from LLM.");

                console.log(`[MegaLLMService:conceptChat] Success ✓`);
                return content;
            } catch (error) {
                lastError = error;
                console.warn(`[MegaLLMService:conceptChat] Attempt ${attempt} failed: ${error.message}`);
                if (attempt < MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, delayMs));
                    delayMs *= 2;
                }
            }
        }

        throw new Error(`[MegaLLMService:conceptChat] ${lastError?.message || "Unknown error"}`);
    }
}

// ─── Singleton Export ───────────────────────────────────────────────────────

const geminiService = new GeminiService();
export default geminiService;

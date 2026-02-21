/**
 * Gemini Service — Centralized LLM service powered by Google Gemini API.
 *
 * Single-provider design optimized for hackathon MVP speed and token efficiency.
 * Structured so a future provider can be swapped in by replacing this file
 * and keeping the same public API surface.
 *
 * Env required:
 *   GEMINI_API_KEY=your-key
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Config ─────────────────────────────────────────────────────────────────

const MODEL = "gemini-pro";
const TIMEOUT_MS = 60_000;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 4096;

// ─── Prompt Templates ───────────────────────────────────────────────────────

const PROMPTS = {
    /**
     * Wraps a raw user prompt with the system instruction.
     * Keep this as a single place to tune the "persona" for all calls.
     */
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
    // Strip ```json ... ``` wrappers
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    try {
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("[GeminiService] JSON parse failed. Raw output:\n", raw);
        throw new Error(
            `[GeminiService] LLM returned invalid JSON. Parse error: ${err.message}`
        );
    }
}

// ─── Service Class ──────────────────────────────────────────────────────────

class GeminiService {
    #model;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error(
                "[GeminiService] GEMINI_API_KEY is missing. Add it to your .env file."
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        this.#model = genAI.getGenerativeModel({
            model: MODEL,
            generationConfig: {
                temperature: DEFAULT_TEMPERATURE,
                maxOutputTokens: DEFAULT_MAX_TOKENS,
            },
        });

        console.log(`[GeminiService] Initialized — model: ${MODEL}`);
    }

    // ── Internal ────────────────────────────────────────────────────────────

    /**
     * Core generation method. Sends prompt, enforces timeout, parses JSON.
     * @param {string} prompt - Raw user prompt.
     * @param {string} label  - Logging label (method name).
     * @returns {Promise<object>} Parsed JSON object.
     */
    async #generate(prompt, label) {
        if (!prompt || typeof prompt !== "string") {
            throw new Error(`[GeminiService:${label}] Prompt must be a non-empty string.`);
        }

        try {
            console.log(`[GeminiService:${label}] Generating…`);

            const result = await Promise.race([
                this.#model.generateContent(PROMPTS.system(prompt)),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Request timed out")), TIMEOUT_MS)
                ),
            ]);

            const content = result.response?.text()?.trim();

            if (!content) {
                throw new Error("Empty response received from Gemini.");
            }

            const parsed = parseJSON(content);
            console.log(`[GeminiService:${label}] Success ✓`);
            return parsed;
        } catch (error) {
            console.error(`[GeminiService:${label}] Failed:`, error.message);
            throw new Error(`[GeminiService:${label}] ${error.message}`);
        }
    }

    // ── Public API ──────────────────────────────────────────────────────────

    /** Generate a new lesson. */
    async generateLesson(prompt) {
        return this.#generate(prompt, "generateLesson");
    }

    /** Regenerate / refine an existing lesson. */
    async regenerateLesson(prompt) {
        return this.#generate(prompt, "regenerateLesson");
    }

    /** Generate a test / quiz. */
    async generateTest(prompt) {
        return this.#generate(prompt, "generateTest");
    }

    /** Generate a custom test with user-specified parameters. */
    async generateCustomTest(prompt) {
        return this.#generate(prompt, "generateCustomTest");
    }
}

// ─── Singleton Export ───────────────────────────────────────────────────────

const geminiService = new GeminiService();
export default geminiService;

// ─── Example Usage (uncomment to test) ──────────────────────────────────────
//
// import geminiService from "./gemini.service.js";
//
// const lesson = await geminiService.generateLesson(
//   "Create a beginner lesson on JavaScript closures with 3 examples."
// );
// console.log(lesson);
//
// const test = await geminiService.generateTest(
//   "Generate a 5-question MCQ quiz on JavaScript closures."
// );
// console.log(test);

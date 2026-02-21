/**
 * TestBank Model
 * 
 * Stores predefined test sets for universal subjects (e.g., Physics, Math)
 * to save tokens, enable deterministic evaluation, and track mastery consistently.
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose;

// ─── Question Sub-Schema ────────────────────────────────────────────────────

const questionSchema = new Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },
        options: {
            type: [String],
            required: true,
            validate: [
                {
                    validator: (arr) => arr.length >= 4,
                    message: "A question must have at least 4 options.",
                }
            ],
        },
        correct_answer: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function (answer) {
                    // 'this' refers to the current question object during creation/updates
                    return this.options && this.options.includes(answer);
                },
                message: "The correct_answer must be one of the provided options.",
            },
        },
        difficulty: {
            type: String,
            required: true,
            enum: ["easy", "medium", "hard"],
        },
        concept_tag: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false } // Avoid generating empty _ids for subdocuments
);

// ─── TestBank Schema ────────────────────────────────────────────────────────

const testBankSchema = new Schema(
    {
        subject_name: {
            type: String,
            required: true,
            trim: true,
        },
        topic_name: {
            type: String,
            required: true,
            trim: true,
        },
        test_set_id: {
            type: String,
            required: true,
            unique: true, // Unique index enforced here
            trim: true,
        },
        questions: {
            type: [questionSchema],
            required: true,
            validate: {
                validator: (arr) => arr.length > 0,
                message: "A test set must contain at least one question.",
            },
        },
        total_questions: {
            type: Number,
            default: 10,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

// ─── Indexes ────────────────────────────────────────────────────────────────

// Compound index for fetching a subject's topic test sets efficiently
testBankSchema.index({ subject_name: 1, topic_name: 1 });

const TestBank = model("TestBank", testBankSchema);
export default TestBank;

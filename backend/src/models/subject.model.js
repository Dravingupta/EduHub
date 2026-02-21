/**
 * Subject Model
 * 
 * Stores the user's learning context for a specific subject, including:
 * - explanation_density_preference (0-100)
 * - difficulty_preference (easy, medium, hard)
 * - topic_mastery_map (topicId -> mastery score 0-100)
 * - weak/strong topics (derived or explicitly stored)
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const subjectSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        explanation_density_preference: {
            type: Number,
            default: 50,
            min: 0,
            max: 100,
        },
        difficulty_preference: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium",
        },
        topic_mastery_map: {
            type: Map,
            of: Number,
            default: {},
        },
        weak_topics: {
            type: [String],
            default: [],
        },
        strong_topics: {
            type: [String],
            default: [],
        },
        swap_count: {
            type: Number,
            default: 0,
        },
        is_active: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

// Indexes
subjectSchema.index({ user_id: 1, name: 1 });

const Subject = model("Subject", subjectSchema);
export default Subject;

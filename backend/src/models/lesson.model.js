/**
 * Lesson Model
 *
 * Stores structured lesson content as an array of flexible JSON blocks.
 * Supports versioning for swap/regeneration and per-user scoping.
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose;

// ─── Block Sub-Schema ───────────────────────────────────────────────────────
// Flexible structure — content accepts any shape (string, object, array).

const blockSchema = new Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ["concept", "analogy", "example", "mistakes", "summary", "diagram"],
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: Schema.Types.Mixed,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: null,
        },
    },
    { _id: false } // blocks don't need their own _id
);

// ─── Lesson Schema ──────────────────────────────────────────────────────────

const lessonSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subject_id: {
            type: Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },
        topic_id: {
            type: Schema.Types.ObjectId,
            ref: "Topic",
            required: true,
        },
        blocks: {
            type: [blockSchema],
            required: true,
            validate: {
                validator: (arr) => arr.length > 0,
                message: "Lesson must have at least one block.",
            },
        },
        difficulty_level: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium",
        },
        version: {
            type: Number,
            default: 1,
            min: 1,
        },
        swap_count: {
            type: Number,
            default: 0,
            min: 0,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

// ─── Indexes ────────────────────────────────────────────────────────────────

// Primary lookup: "get the active lesson for this user on this topic"
lessonSchema.index({ user_id: 1, subject_id: 1, topic_id: 1 });

// Secondary lookup: all lessons for a topic
lessonSchema.index({ topic_id: 1 });

// ─── Export ─────────────────────────────────────────────────────────────────

const Lesson = model("Lesson", lessonSchema);
export default Lesson;

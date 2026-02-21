import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        subject_name: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            enum: ['universal', 'custom'],
            default: 'custom',
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

        avg_subject_mastery: {
            type: Number,
            default: 0,
        },

        explanation_density_preference: {
            type: Number,
            default: 50,
        },

        difficulty_preference: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },

        swap_count: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

subjectSchema.index({ user_id: 1, subject_name: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;

import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },

        assignments_completed: {
            type: Number,
            default: 0,
        },

        topics_completed: {
            type: Number,
            default: 0,
        },

        total_study_time: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

activitySchema.index({ user_id: 1, date: 1 }, { unique: true });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;

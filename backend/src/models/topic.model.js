import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
    {
        subject_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        },

        topic_name: {
            type: String,
            required: true,
        },

        section_name: {
            type: String,
            default: 'General',
        },

        order_index: {
            type: Number,
            required: true,
        },

        is_completed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Prevents duplicate topic names within a subject — optimizes topic lookup by subject
topicSchema.index({ subject_id: 1, topic_name: 1 }, { unique: true });

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;

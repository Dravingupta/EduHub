import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        type: {
            type: String,
            enum: [
                'inactivity_alert',
                'weak_topic_alert',
                'streak_warning',
                'readiness_warning',
                'achievement',
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low',
        },

        is_read: {
            type: Boolean,
            default: false,
        },

        metadata: {
            type: Object,
            default: {},
        },

        created_at: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ user_id: 1, created_at: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

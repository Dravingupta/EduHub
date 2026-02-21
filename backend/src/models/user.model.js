import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        firebase_uid: {
            type: String,
            required: true,
            unique: true,
        },

        global_behavior_profile: {
            avg_time_per_question: {
                type: Number,
                default: 0,
            },
            swap_usage: {
                type: Number,
                default: 0,
            },
            preferred_density: {
                type: Number,
                default: 50,
            },
            retry_count: {
                type: Number,
                default: 0,
            },
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;

import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        subject_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        },

        topic_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic',
            required: true,
        },

        test_set_id: {
            type: String,
            required: true,
        },

        questions: [
            {
                question_id: String,
                difficulty: {
                    type: String,
                    enum: ['easy', 'medium', 'hard'],
                },
                correct_answer: String,
            },
        ],

        user_answers: [
            {
                question_id: String,
                selected_answer: String,
            },
        ],

        score: {
            type: Number,
            default: 0,
        },

        mastery_score: {
            type: Number,
            default: 0,
        },

        time_taken: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;

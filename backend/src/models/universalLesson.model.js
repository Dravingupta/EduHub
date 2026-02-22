import mongoose from 'mongoose';

const universalLessonSchema = new mongoose.Schema(
    {
        subject_name: {
            type: String,
            required: true,
            index: true
        },
        topic_name: {
            type: String,
            required: true,
            index: true
        },
        lesson_data: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    },
    { timestamps: true }
);

// Optimize searches since we retrieve by subject + topic
universalLessonSchema.index({ subject_name: 1, topic_name: 1 }, { unique: true });

const UniversalLesson = mongoose.model('UniversalLesson', universalLessonSchema);

export default UniversalLesson;

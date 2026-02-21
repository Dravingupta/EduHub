import * as subjectService from '../services/subject.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import * as userService from '../services/user.service.js';
import * as topicService from '../services/topic.service.js';
import { createCustomSubject } from '../services/customSubject.service.js';
import { UNIVERSAL_SUBJECTS } from '../config/constants.js';

export const createSubject = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { subject_name, type } = req.body;

        if (!subject_name) {
            return errorResponse(res, 'subject_name is required', 400);
        }

        const user = await userService.getOrCreateUser(uid);
        let subject;

        if (type === 'custom') {
            const { syllabusText } = req.body;
            if (!syllabusText || syllabusText.length < 50) {
                return errorResponse(res, 'syllabusText is required and must be at least 50 characters for custom subjects', 400);
            }

            const targetDays = req.body.target_days ? parseInt(req.body.target_days, 10) : 120;

            const customResult = await createCustomSubject({
                userId: user._id,
                subjectName: subject_name,
                syllabusText: syllabusText,
                targetDays: targetDays
            });

            subject = { _id: customResult.subject_id, subject_name, type: 'custom' };

        } else {
            subject = await subjectService.createSubjectForUser(user._id, subject_name, type, req.body.target_days);

            if (type === 'universal') {
                const universalTopics = UNIVERSAL_SUBJECTS[subject_name];
                if (universalTopics) {
                    const syllabus = {
                        "Core Curriculum": universalTopics
                    };
                    await topicService.createTopicsFromSyllabus(subject._id, syllabus);
                }
            }
        }

        return successResponse(res, { subject }, 'Subject created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const getSubjects = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const user = await userService.getOrCreateUser(uid);
        const subjects = await subjectService.getUserSubjects(user._id);
        const subjectsWithTopics = await Promise.all(subjects.map(async (subj) => {
            const topics = await topicService.getSubjectTopics(subj._id);
            const totalTopics = topics.length;
            const completedTopics = topics.filter(t => t.is_completed).length;

            return {
                ...subj.toObject(),
                is_completed: totalTopics > 0 && totalTopics === completedTopics
            };
        }));

        return successResponse(res, { subjects: subjectsWithTopics }, 'Subjects fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const updateMastery = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { topic, masteryScore } = req.body;

        if (!topic || masteryScore === undefined) {
            return errorResponse(res, 'topic and masteryScore are required', 400);
        }

        if (typeof masteryScore !== 'number') {
            return errorResponse(res, 'masteryScore must be a number', 400);
        }

        const subject = await subjectService.updateTopicMastery(id, topic, masteryScore);

        return successResponse(res, { subject }, 'Topic mastery updated successfully');
    } catch (error) {
        next(error);
    }
};

export const updateDensity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { density } = req.body;

        if (density === undefined) {
            return errorResponse(res, 'density is required', 400);
        }

        if (typeof density !== 'number') {
            return errorResponse(res, 'density must be a number', 400);
        }

        const subject = await subjectService.updateDensityPreference(id, density);

        return successResponse(res, { subject }, 'Density preference updated successfully');
    } catch (error) {
        next(error);
    }
};

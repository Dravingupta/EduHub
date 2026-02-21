/**
 * Notification Service — Core Intelligence
 *
 * Future:
 * - Firebase push notifications
 * - Email notifications
 * - Cron job scheduler
 */

import * as notificationRepository from '../repositories/notification.repository.js';
import * as activityRepository from '../repositories/activity.repository.js';
import * as subjectRepository from '../repositories/subject.repository.js';
import * as streakService from './streak.service.js';
import * as readinessService from './readiness.service.js';

const INACTIVITY_THRESHOLD_HOURS = 48;
const WEAK_TOPIC_THRESHOLD = 3;
const READINESS_WARNING_THRESHOLD = 50;

const createIfNotDuplicate = async (userId, type, notificationData) => {
    const existing = await notificationRepository.findRecentByType(userId, type);

    if (existing) {
        return null;
    }

    return await notificationRepository.createNotification({
        user_id: userId,
        type,
        ...notificationData,
    });
};

export const checkInactivityReminder = async (userId) => {
    const activities = await activityRepository.getRecentActivities(userId, 1);

    if (activities.length === 0) {
        return await createIfNotDuplicate(userId, 'inactivity_alert', {
            title: 'Study Inactivity',
            message: 'You haven\'t studied in the last 2 days. Continue learning to maintain your streak.',
            priority: 'high',
        });
    }

    const lastActivityDate = new Date(activities[0].date);
    const now = new Date();
    const hoursSinceActivity = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceActivity > INACTIVITY_THRESHOLD_HOURS) {
        return await createIfNotDuplicate(userId, 'inactivity_alert', {
            title: 'Study Inactivity',
            message: 'You haven\'t studied in the last 2 days. Continue learning to maintain your streak.',
            priority: 'high',
        });
    }

    return null;
};

export const checkWeakTopicReminder = async (userId) => {
    const subjects = await subjectRepository.findByUser(userId);
    const allWeakTopics = [];

    for (const subject of subjects) {
        for (const topic of subject.weak_topics) {
            allWeakTopics.push({
                subject_name: subject.subject_name,
                topic_name: topic,
            });
        }
    }

    if (allWeakTopics.length >= WEAK_TOPIC_THRESHOLD) {
        return await createIfNotDuplicate(userId, 'weak_topic_alert', {
            title: 'Weak Topics Alert',
            message: `You have ${allWeakTopics.length} weak topics. Consider revising them.`,
            priority: 'medium',
            metadata: { weak_topics: allWeakTopics },
        });
    }

    return null;
};

export const checkStreakRisk = async (userId) => {
    const { current_streak } = await streakService.calculateCurrentStreak(userId);

    if (current_streak === 0) {
        return null;
    }

    const activities = await activityRepository.getRecentActivities(userId, 1);

    if (activities.length === 0) {
        return null;
    }

    const lastActivityDate = new Date(activities[0].date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastActivityDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.round(
        (today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff >= 1) {
        return await createIfNotDuplicate(userId, 'streak_warning', {
            title: 'Streak at Risk',
            message: `Your ${current_streak}-day study streak is at risk. Study today to maintain it.`,
            priority: 'high',
            metadata: { current_streak },
        });
    }

    return null;
};

export const checkReadinessWarning = async (userId) => {
    const readiness = await readinessService.calculateOverallReadiness(userId);

    if (readiness.overall_readiness < READINESS_WARNING_THRESHOLD && readiness.subjects.length > 0) {
        return await createIfNotDuplicate(userId, 'readiness_warning', {
            title: 'Low Readiness Score',
            message: 'Your readiness score is low. Focus on weak areas.',
            priority: 'medium',
            metadata: {
                overall_readiness: readiness.overall_readiness,
                subjects: readiness.subjects,
            },
        });
    }

    return null;
};

export const generateDailyNotifications = async (userId) => {
    const results = await Promise.allSettled([
        checkInactivityReminder(userId),
        checkWeakTopicReminder(userId),
        checkStreakRisk(userId),
        checkReadinessWarning(userId),
    ]);

    const generated = results
        .filter((r) => r.status === 'fulfilled' && r.value !== null)
        .map((r) => r.value);

    return generated;
};

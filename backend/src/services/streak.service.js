import * as activityRepository from '../repositories/activity.repository.js';

const normalizeToMidnight = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

const daysBetween = (date1, date2) => {
    const ms = Math.abs(date1.getTime() - date2.getTime());
    return Math.round(ms / (1000 * 60 * 60 * 24));
};

export const recordDailyActivity = async (userId, { studyTime = 0, assignments = 0, topics = 0 }) => {
    const today = normalizeToMidnight(new Date());
    const existing = await activityRepository.findByUserAndDate(userId, today);

    if (existing) {
        return await activityRepository.updateActivity(existing._id, {
            $inc: {
                assignments_completed: assignments,
                topics_completed: topics,
                total_study_time: studyTime,
            },
        });
    }

    return await activityRepository.createActivity({
        user_id: userId,
        date: today,
        assignments_completed: assignments,
        topics_completed: topics,
        total_study_time: studyTime,
    });
};

export const calculateCurrentStreak = async (userId) => {
    const activities = await activityRepository.getUserActivities(userId);

    if (activities.length === 0) {
        return { current_streak: 0 };
    }

    let streak = 0;
    let expectedDate = normalizeToMidnight(new Date());

    for (const activity of activities) {
        const activityDate = normalizeToMidnight(activity.date);
        const gap = daysBetween(expectedDate, activityDate);

        if (gap === 0) {
            streak += 1;
            expectedDate = new Date(expectedDate);
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else if (gap === 1 && streak === 0) {
            streak += 1;
            expectedDate = new Date(activityDate);
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
            break;
        }
    }

    return { current_streak: streak };
};

export const calculateLongestStreak = async (userId) => {
    const activities = await activityRepository.getUserActivities(userId);

    if (activities.length === 0) {
        return { longest_streak: 0 };
    }

    const sortedAsc = [...activities].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedAsc.length; i++) {
        const prevDate = normalizeToMidnight(sortedAsc[i - 1].date);
        const currDate = normalizeToMidnight(sortedAsc[i].date);
        const gap = daysBetween(currDate, prevDate);

        if (gap === 1) {
            currentStreak += 1;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else if (gap > 1) {
            currentStreak = 1;
        }
    }

    return { longest_streak: longestStreak };
};

export const calculateConsistencyScore = async (userId) => {
    const thirtyDaysAgo = normalizeToMidnight(new Date());
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await activityRepository.getUserActivities(userId);

    const activeDays = activities.filter((a) => {
        const activityDate = normalizeToMidnight(a.date);
        return activityDate.getTime() >= thirtyDaysAgo.getTime();
    }).length;

    return Math.round((activeDays / 30) * 100);
};

export const getStreakAnalytics = async (userId) => {
    const [currentStreak, longestStreak, consistencyScore, activities] = await Promise.all([
        calculateCurrentStreak(userId),
        calculateLongestStreak(userId),
        calculateConsistencyScore(userId),
        activityRepository.getUserActivities(userId),
    ]);

    return {
        current_streak: currentStreak.current_streak,
        longest_streak: longestStreak.longest_streak,
        consistency_score: consistencyScore,
        total_active_days: activities.length,
    };
};

export const getActivityHeatmapData = async (userId) => {
    const activities = await activityRepository.getUserActivities(userId);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    return activities
        .filter(a => new Date(a.date).getTime() >= oneYearAgo.getTime())
        .map(a => ({
            date: new Date(a.date).toISOString().split('T')[0],
            count: (a.assignments_completed || 0) + (a.topics_completed || 0),
        }));
};

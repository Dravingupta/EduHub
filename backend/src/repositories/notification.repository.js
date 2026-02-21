import Notification from '../models/notification.model.js';

export const createNotification = async (data) => {
    const notification = new Notification(data);
    return await notification.save();
};

export const findUserNotifications = async (userId) => {
    return await Notification.find({ user_id: userId }).sort({ created_at: -1 });
};

export const findUnreadNotifications = async (userId) => {
    return await Notification.find({ user_id: userId, is_read: false }).sort({ created_at: -1 });
};

export const markAsRead = async (notificationId) => {
    return await Notification.findByIdAndUpdate(
        notificationId,
        { $set: { is_read: true } },
        { new: true }
    );
};

export const markAllAsRead = async (userId) => {
    return await Notification.updateMany(
        { user_id: userId, is_read: false },
        { $set: { is_read: true } }
    );
};

export const deleteNotification = async (notificationId) => {
    return await Notification.findByIdAndDelete(notificationId);
};

export const findRecentByType = async (userId, type, hoursAgo = 24) => {
    const since = new Date();
    since.setHours(since.getHours() - hoursAgo);

    return await Notification.findOne({
        user_id: userId,
        type,
        created_at: { $gte: since },
    });
};

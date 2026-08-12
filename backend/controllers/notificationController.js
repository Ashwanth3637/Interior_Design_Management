const Notification = require("../models/Notification");

// Role mapping helper to match standardized user roles with DB recipient roles
const getMatchingRoles = (userRole) => {
    if (!userRole) return [];
    const r = userRole.toUpperCase();
    if (r.includes("ACCOUNTANT")) return ["Accountant", "ACCOUNTANT"];
    if (r.includes("PROJECT") || r.includes("PM")) return ["Project Manager", "PROJECT_MANAGER"];
    if (r.includes("DESIGN")) return ["Interior Designer", "INTERIOR_DESIGNER", "Designer"];
    if (r.includes("SITE") || r.includes("ENGINEER")) return ["Site Engineer", "SITE_ENGINEER"];
    if (r.includes("SALES")) return ["Sales Executive", "SALES_EXECUTIVE"];
    if (r.includes("ADMIN")) return ["Admin", "ADMIN", "Super Admin", "SUPER_ADMIN"];
    if (r.includes("CLIENT")) return ["Client"];
    return [userRole];
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const userRoles = getMatchingRoles(req.user.role);

        const userEmail = (req.user.email || "").toLowerCase().trim();
        const filter = {
            $or: [
                { recipientUser: userId },
                { recipientRole: { $in: userRoles } },
                ...(userEmail ? [{ recipientEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } }] : [])
            ],
        };

        const limit = parseInt(req.query.limit, 10) || 30;
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            ...filter,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            unreadCount,
            count: notifications.length,
            data: notifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
            error: error.message,
        });
    }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const userRoles = getMatchingRoles(req.user.role);

        const count = await Notification.countDocuments({
            $or: [
                { recipientUser: userId },
                { recipientRole: { $in: userRoles } },
            ],
            isRead: false,
        });

        res.status(200).json({
            success: true,
            unreadCount: count,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch unread count",
        });
    }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update notification",
        });
    }
};

// @desc    Mark all notifications for logged in user as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const userRoles = getMatchingRoles(req.user.role);

        await Notification.updateMany(
            {
                $or: [
                    { recipientUser: userId },
                    { recipientRole: { $in: userRoles } },
                ],
                isRead: false,
            },
            { $set: { isRead: true } }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to mark notifications as read",
        });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete notification",
        });
    }
};

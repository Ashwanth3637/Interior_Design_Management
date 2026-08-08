const Notification = require("../models/Notification");
const User = require("../models/User");

/**
 * Helper to dispatch notification to specific user ID(s) or role(s).
 */
const createNotification = async ({
    recipientUserId,
    recipientRole,
    recipientName,
    senderName = "System",
    senderRole = "System",
    projectId = "",
    projectName = "",
    title,
    message,
    type = "general",
    link = "",
}) => {
    try {
        let recipientUserIds = [];

        // Case 1: Specific user ID provided
        if (recipientUserId) {
            recipientUserIds.push(recipientUserId);
        }

        // Case 2: Specific user Name provided (e.g. assignedDesigner name from Project)
        if (recipientName && recipientUserIds.length === 0) {
            const users = await User.find({
                name: { $regex: new RegExp(`^${recipientName.trim()}$`, "i") },
            }).select("_id");
            recipientUserIds.push(...users.map((u) => u._id));
        }

        // Case 3: Target Role provided (or fallback broadcast to role)
        if (recipientRole) {
            const roleRegexMap = {
                "Accountant": ["Accountant", "ACCOUNTANT"],
                "Project Manager": ["Project Manager", "PROJECT_MANAGER"],
                "Interior Designer": ["Interior Designer", "INTERIOR_DESIGNER", "Designer"],
                "Site Engineer": ["Site Engineer", "SITE_ENGINEER"],
                "Sales Executive": ["Sales Executive", "SALES_EXECUTIVE"],
                "Client": ["Client"],
                "Admin": ["Admin", "ADMIN", "Super Admin", "SUPER_ADMIN"],
            };

            const targetRoles = roleRegexMap[recipientRole] || [recipientRole];
            const roleUsers = await User.find({ role: { $in: targetRoles }, isActive: true }).select("_id");
            
            const existingIdStrings = recipientUserIds.map((id) => id.toString());
            for (const ru of roleUsers) {
                if (!existingIdStrings.includes(ru._id.toString())) {
                    recipientUserIds.push(ru._id);
                }
            }
        }

        // If no specific users found but a role was specified, create a role broadcast notification
        if (recipientUserIds.length === 0) {
            const newNotif = new Notification({
                recipientRole,
                senderName,
                senderRole,
                projectId,
                projectName,
                title,
                message,
                type,
                link,
            });
            await newNotif.save();
            return [newNotif];
        }

        // Create notification for each recipient user so they can independently mark it read
        const notificationsToCreate = recipientUserIds.map((userId) => ({
            recipientUser: userId,
            recipientRole,
            senderName,
            senderRole,
            projectId,
            projectName,
            title,
            message,
            type,
            link,
        }));

        const created = await Notification.insertMany(notificationsToCreate);
        return created;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

module.exports = {
    createNotification,
};

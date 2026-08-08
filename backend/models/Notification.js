const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipientUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        recipientRole: {
            type: String,
            enum: [
                "Super Admin", "SUPER_ADMIN",
                "Admin", "ADMIN",
                "Project Manager", "PROJECT_MANAGER",
                "Interior Designer", "INTERIOR_DESIGNER", "Designer",
                "Sales Executive", "SALES_EXECUTIVE",
                "Site Engineer", "SITE_ENGINEER",
                "Accountant", "ACCOUNTANT",
                "Client"
            ],
            required: false,
        },
        senderName: {
            type: String,
            default: "System",
        },
        senderRole: {
            type: String,
            default: "System",
        },
        projectId: {
            type: String,
            default: "",
        },
        projectName: {
            type: String,
            default: "",
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: [
                "revision_requested",
                "design_approved",
                "quotation_approved",
                "payment_received",
                "project_completed",
                "material_requested",
                "general"
            ],
            default: "general",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying by recipient and read status
notificationSchema.index({ recipientUser: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);

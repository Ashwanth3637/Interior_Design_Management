const mongoose = require("mongoose");

const siteWorkSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    siteEngineer: {
      type: String,
      required: true,
    },
    dailyLogs: [
      {
        date: { type: Date, default: Date.now },
        workCompleted: { type: String, required: true },
        workersPresent: { type: Number, default: 1 },
        remarks: { type: String, default: "" },
      },
    ],
    siteImages: [
      {
        imageUrl: { type: String, required: true },
        category: {
          type: String,
          enum: ["Before Work", "During Work", "After Work"],
          default: "During Work",
        },
        title: { type: String, default: "Site Image" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    materialUsage: [
      {
        materialName: { type: String, required: true },
        quantityUsed: { type: Number, required: true },
        remainingQuantity: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    reportedIssues: [
      {
        issueType: {
          type: String,
          enum: ["Delay", "Material Shortage", "Safety Issue", "Labour Issue"],
          required: true,
        },
        description: { type: String, required: true },
        severity: {
          type: String,
          enum: ["Low", "Medium", "High", "Critical"],
          default: "Medium",
        },
        status: {
          type: String,
          enum: ["Open", "In Progress", "Resolved"],
          default: "Open",
        },
        reportedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteWork", siteWorkSchema);

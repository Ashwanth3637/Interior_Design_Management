const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: [true, "Project ID is required"],
    },
    projectName: {
      type: String,
      required: [true, "Project Name is required"],
    },
    category: {
      type: String,
      enum: ["Material Cost", "Labour Cost", "Miscellaneous Expenses"],
      required: [true, "Expense category is required"],
    },
    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [0, "Amount must be positive"],
    },
    vendorName: {
      type: String,
      default: "N/A",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: "",
    },
    recordedBy: {
      type: String,
      default: "Accountant",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expense", expenseSchema);

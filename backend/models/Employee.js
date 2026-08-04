const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: [true, "Employee Id is required"],
            unique: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email address is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: [true, "Gender is required"],
        },
        dob: {
            type: Date,
        },
        role: {
            type: String,
            enum: [
                "SUPER_ADMIN",
                "ADMIN",
                "PROJECT_MANAGER",
                "INTERIOR_DESIGNER",
                "SALES_EXECUTIVE",
                "SITE_ENGINEER",
                "ACCOUNTANT",
            ],
            required: [true, "Employee role is required"],
        },
        department: {
            type: String,
            enum: [
                "Administration",
                "Projects",
                "Design",
                "Sales",
                "Engineering",
                "Accounts",
            ],
            required: [true, "Department is required"],
        },
        joiningDate: {
            type: Date,
            default: Date.now,
        },
        experience: {
            type: Number,
            default: 0,
        },
        salary: {
            type: Number,
            default: 0,
        },
        reportingManager: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["Active", "Inactive", "On Leave"],
            default: "Active",
        },
        profileImage: {
            type: String,
            default: "",
        },
        address: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("Employee", employeeSchema);
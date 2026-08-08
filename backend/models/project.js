const mongoose = require("mongoose");

const designSchema = new mongoose.Schema({
    title: { type: String, required: true },
    designType: {
        type: String,
        enum: ["2D Floor Plan", "3D Render", "Moodboard", "Material Catalogue"],
        default: "2D Floor Plan",
    },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
});

const quotationSchema = new mongoose.Schema({
    quotationNumber: { type: String, required: true },
    materialCost: { type: Number, default: 0 },
    labourCost: { type: Number, default: 0 },
    designCharges: { type: Number, default: 0 },
    furnitureCost: { type: Number, default: 0 },
    electricalPlumbingCost: { type: Number, default: 0 },
    taxGst: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    validUntil: { type: Date },
    status: { type: String, enum: ["Draft", "Sent to Client", "Accepted", "Rejected"], default: "Sent to Client" },
    generatedBy: { type: String, default: "Project Manager" },
    createdAt: { type: Date, default: Date.now },
});

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true },
    title: { type: String, default: "Client Invoice" },
    installmentType: { type: String, default: "Advance Payment" },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["Pending", "Unpaid", "Paid", "Overdue"], default: "Pending" },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    paidDate: { type: Date },
    notes: { type: String, default: "" },
});

const timelineSchema = new mongoose.Schema({
    phase: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
        type: String,
        enum: ["Scheduled", "In Progress", "Completed"],
        default: "Scheduled",
    },
});

const materialSchema = new mongoose.Schema({
    materialName: { type: String, required: true },
    brand: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: "Units" },
    estimatedPrice: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Approved"], default: "Pending" },
    addedBy: { type: String, default: "Interior Designer" },
});

const projectSchema = new mongoose.Schema(
    {
        projectId: {
            type: String,
            required: [true, "Project ID is required"],
            unique: true,
            trim: true,
        },
        projectName: {
            type: String,
            required: [true, "Project name is required"],
            trim: true,
        },
        clientName: {
            type: String,
            required: [true, "Client name is required"],
            trim: true,
        },
        clientEmail: {
            type: String,
            required: [true, "Client email is required"],
            lowercase: true,
            trim: true,
        },
        clientPhone: {
            type: String,
            required: [true, "Client phone number is required"],
            trim: true,
        },
        location: {
            type: String,
            required: [true, "Site location is required"],
        },
        projectType: {
            type: String,
            enum: [
                "Residential",
                "Commercial",
                "Renovation",
                "Modular Kitchen",
                "Full Villa Interior",
            ],
            default: "Residential",
        },
        budget: {
            type: Number,
            required: [true, "Project budget is required"],
            default: 0,
        },
        spentAmount: {
            type: Number,
            default: 0,
        },
        assignedDesigner: {
            type: String,
            required: [true, "Assigned Interior Designer is required"],
        },
        projectManager: {
            type: String,
            default: "",
        },
        siteEngineer: {
            type: String,
            default: "",
        },
        salesExecutive: {
            type: String,
            default: "Unassigned",
        },
        accountant: {
            type: String,
            default: "Unassigned",
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        expectedCompletionDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["Planning", "In Progress", "Review", "Completed", "On Hold"],
            default: "Planning",
        },
        workflowStage: {
            type: String,
            enum: [
                "Lead Registered",
                "Client Account Created",
                "Project Created",
                "Designer Assigned",
                "Design Upload",
                "Client Review",
                "Revision Requested",
                "Design Approved",
                "Quotation Generated",
                "Quotation Approved",
                "Quotation Rejected",
                "Advance Payment Received",
                "PM Approval",
                "Site Engineer Assigned",
                "Material Procurement",
                "Execution Started",
                "Site Progress 60%",
                "Second Installment Quotation Generated",
                "Second Installment Paid",
                "Site Progress 90%",
                "Final Installment Pending",
                "Daily Progress Updates",
                "Stage Payments",
                "Quality Inspection",
                "Client Handover",
                "Project Completed",
                "Project Closed"
            ],
            default: "Designer Assigned",
        },
        advancePaymentPaid: {
            type: Boolean,
            default: false,
        },
        advancePaymentAmount: {
            type: Number,
            default: 0,
        },
        quotationApproved: {
            type: Boolean,
            default: false,
        },
        progressPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        designApprovalStatus: {
            type: String,
            enum: ["Pending Review", "Approved", "Changes Requested", "Revision Requested", "Revision Submitted"],
            default: "Pending Review",
        },
        designVersion: {
            type: Number,
            default: 1,
        },
        clientFeedback: {
            type: String,
            default: "",
        },
        sitePhotos: [{
            title: { type: String, default: "Client Site Photo" },
            fileUrl: { type: String, required: true },
            sqFeetEstimate: { type: Number, default: 0 },
            tilesCountEstimate: { type: Number, default: 0 },
            roomType: { type: String, default: "Living Room" },
            notes: { type: String, default: "" },
            uploadedAt: { type: Date, default: Date.now }
        }],
        quotations: [quotationSchema],
        designs: [designSchema],
        invoices: [invoiceSchema],
        timeline: [timelineSchema],
        materials: [materialSchema],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Project", projectSchema);

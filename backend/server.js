const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Initialize express app
const app = express();

// Ensure MongoDB connection for incoming requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("DB Connection Error:", err);
        return res.status(500).json({
            success: false,
            message: "Database connection error. Please check MONGO_URI environment variable."
        });
    }
});

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/site-engineer", require("./routes/siteEngineerRoutes"));
app.use("/api/pm", require("./routes/pmRoutes"));
app.use("/api/accountant", require("./routes/accountantRoutes"));
app.use("/api/sales", require("./routes/salesExecutiveRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Test Route
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Interior Design Management API Server is online!",
        timestamp: new Date()
    });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

// Start Server (Only if not running as a Vercel Serverless Function)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}

module.exports = app;
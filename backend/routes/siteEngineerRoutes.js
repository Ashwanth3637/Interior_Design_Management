const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getAssignedProjects,
  addDailyLog,
  addSiteImage,
  addMaterialUsage,
  reportIssue,
  updateProgress,
} = require("../controllers/siteEngineerController");

// All routes protected by JWT auth
router.use(protect);

router.get("/projects", getAssignedProjects);
router.post("/projects/:projectId/daily-log", addDailyLog);
router.post("/projects/:projectId/site-images", addSiteImage);
router.post("/projects/:projectId/material-usage", addMaterialUsage);
router.post("/projects/:projectId/report-issue", reportIssue);
router.put("/projects/:projectId/progress", updateProgress);

module.exports = router;

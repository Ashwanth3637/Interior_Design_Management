const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getPMDashboard,
  updatePMProject,
  approveProgress,
  handleSiteIssue,
} = require("../controllers/pmController");

// All routes protected by JWT auth
router.use(protect);

router.get("/dashboard", getPMDashboard);
router.put("/projects/:id", updatePMProject);
router.put("/projects/:id/approve-progress", approveProgress);
router.put("/issues/:projectId/:issueId", handleSiteIssue);

module.exports = router;

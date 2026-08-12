const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getPMDashboard,
  updatePMProject,
  approveProgress,
  handleSiteIssue,
  generateQuotation,
  generateSecondInstallmentInvoice,
  verifyCompletionByPM,
} = require("../controllers/pmController");

// All routes protected by JWT auth
router.use(protect);

router.get("/dashboard", getPMDashboard);
router.put("/projects/:id", updatePMProject);
router.post("/projects/:id/quotation", generateQuotation);
router.post("/projects/:id/second-installment-invoice", generateSecondInstallmentInvoice);
router.put("/projects/:id/approve-progress", approveProgress);
router.put("/projects/:id/verify-completion", verifyCompletionByPM);
router.put("/issues/:projectId/:issueId", handleSiteIssue);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  uploadDesign,
  createInvoice,
  payInvoice,
  approveDesign,
  updateProgress,
  deleteDesign,
  addMaterial,
  deleteMaterial,
  respondQuotation,
  getAdminAnalytics,
  postMessage,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");

router.get("/admin-analytics", protect, getAdminAnalytics);
router.route("/").get(protect, getProjects).post(protect, createProject);

router.post("/:id/designs", protect, uploadDesign);
router.delete("/:id/designs/:designId", protect, deleteDesign);
router.post("/:id/materials", protect, addMaterial);
router.delete("/:id/materials/:materialId", protect, deleteMaterial);
router.post("/:id/messages", protect, postMessage);
router.post("/:id/invoices", protect, createInvoice);
router.put("/:id/invoices/:invoiceId/pay", protect, payInvoice);
router.put("/:id/approve-design", protect, approveDesign);
router.put("/:id/respond-quotation", protect, respondQuotation);
router.put("/:id/progress", protect, updateProgress);

router
  .route("/:id")
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

module.exports = router;

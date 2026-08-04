const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getAccountantDashboard,
  createInvoice,
  updatePaymentInstallment,
  deleteInvoice,
  addExpense,
  deleteExpense,
} = require("../controllers/accountantController");

// Protected by JWT auth
router.use(protect);

router.get("/dashboard", getAccountantDashboard);
router.post("/invoices", createInvoice);
router.put("/invoices/:projectId/:invoiceId/payment", updatePaymentInstallment);
router.delete("/invoices/:projectId/:invoiceId", deleteInvoice);

router.post("/expenses", addExpense);
router.delete("/expenses/:id", deleteExpense);

module.exports = router;

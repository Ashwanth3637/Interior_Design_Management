const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getSalesDashboard, registerClientLead } = require("../controllers/salesExecutiveController");

router.use(protect);

router.get("/dashboard", getSalesDashboard);
router.post("/register-client", registerClientLead);

module.exports = router;

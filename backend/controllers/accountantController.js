const Project = require("../models/project");
const Expense = require("../models/Expense");
const { createNotification } = require("../utils/notificationHelper");
const { sendInvoiceEmail, sendPaymentReceiptEmail } = require("../utils/emailService");

// @desc    Get Accountant Dashboard Summary, Invoices, Expenses & Financial Reports
// @route   GET /api/accountant/dashboard
// @access  Private/Accountant
exports.getAccountantDashboard = async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ updatedAt: -1 });
    const expenses = await Expense.find({}).sort({ date: -1 });

    // Consolidate all invoices across projects — filtered by site progress milestones
    let allInvoices = [];
    projects.forEach((prj) => {
      if (prj.invoices && prj.invoices.length > 0) {
        const progress = prj.progressPercentage || 0;
        prj.invoices.forEach((inv) => {
          const isFinal = inv.installmentType === 'Final Installment' || inv.title?.includes('Final');
          const isSecond = inv.installmentType === 'Second Installment' || inv.title?.includes('Second');

          // Final invoice: only show when project progress >= 90%
          if (isFinal && progress < 90) return;
          // 2nd installment: only show when project progress >= 50%
          if (isSecond && progress < 50) return;

          allInvoices.push({
            ...inv.toObject(),
            projectId: prj.projectId,
            projectName: prj.projectName,
            clientName: prj.clientName,
            clientEmail: prj.clientEmail,
            progressPercentage: progress,
          });
        });
      }
    });

    // KPI Calculations
    let totalRevenue = 0;
    let pendingPayments = 0;
    let paidInvoicesCount = 0;
    let monthlyIncome = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    allInvoices.forEach((inv) => {
      const paid = Number(inv.paidAmount || 0);
      const total = Number(inv.amount || 0);
      const pending = Math.max(0, total - paid);

      totalRevenue += paid;
      pendingPayments += pending;

      if (inv.status === "Paid" || paid >= total) {
        paidInvoicesCount += 1;
      }

      if (inv.paidDate) {
        const pDate = new Date(inv.paidDate);
        if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
          monthlyIncome += paid;
        }
      }
    });

    // Expense Metrics
    let totalMaterialCost = 0;
    let totalLabourCost = 0;
    let totalMiscExpenses = 0;

    expenses.forEach((exp) => {
      if (exp.category === "Material Cost") totalMaterialCost += Number(exp.amount || 0);
      else if (exp.category === "Labour Cost") totalLabourCost += Number(exp.amount || 0);
      else totalMiscExpenses += Number(exp.amount || 0);
    });

    const totalExpenses = totalMaterialCost + totalLabourCost + totalMiscExpenses;
    const netProfit = totalRevenue - totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          pendingPayments,
          paidInvoicesCount,
          monthlyIncome,
          totalExpenses,
          netProfit,
        },
        invoices: allInvoices,
        expenses,
        projects: projects.map((p) => ({
          _id: p._id,
          projectId: p.projectId,
          projectName: p.projectName,
          clientName: p.clientName,
          budget: p.budget,
          spentAmount: p.spentAmount,
        })),
        reports: {
          totalRevenue,
          totalMaterialCost,
          totalLabourCost,
          totalMiscExpenses,
          totalExpenses,
          netProfit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching Accountant dashboard",
    });
  }
};

// @desc    Create New Client Invoice with Installment Stages
// @route   POST /api/accountant/invoices
// @access  Private/Accountant
exports.createInvoice = async (req, res) => {
  try {
    const {
      projectId,
      invoiceNumber,
      amount,
      installmentType, // Advance Payment, Second Installment, Final Payment
      dueDate,
      notes,
    } = req.body;

    if (!projectId || !amount) {
      return res.status(400).json({ success: false, message: "Project ID and invoice amount are required" });
    }

    const project = await Project.findOne({
      $or: [{ _id: projectId.match(/^[0-9a-fA-F]{24}$/) ? projectId : null }, { projectId }],
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const type = installmentType || "Advance Payment";
    if (type.includes("Advance") && !project.quotationApproved) {
      return res.status(400).json({
        success: false,
        message: "Cannot issue Advance Payment Invoice! The client must first approve the official quotation."
      });
    }

    const newInvNumber = invoiceNumber || `INV-${Math.floor(10000 + Math.random() * 90000)}`;

    const newInvoice = {
      invoiceNumber: newInvNumber,
      title: installmentType || "Client Invoice",
      amount: Number(amount),
      installmentType: installmentType || "Advance Payment",
      issueDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: "Pending",
      paidAmount: 0,
      notes: notes || "",
    };

    project.invoices.push(newInvoice);
    await project.save();

    // Dispatch Invoice Email to Client
    if (project.clientEmail) {
      sendInvoiceEmail({
        clientEmail: project.clientEmail,
        clientName: project.clientName,
        projectName: project.projectName,
        invoiceNumber: newInvNumber,
        amount: newInvoice.amount,
        dueDate: newInvoice.dueDate,
        installmentType: newInvoice.installmentType,
      }).catch(err => console.error("Invoice email error:", err));
    }

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: newInvoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error creating invoice" });
  }
};

// @desc    Update Payment Installment / Record Receipt
// @route   PUT /api/accountant/invoices/:projectId/:invoiceId/payment
// @access  Private/Accountant
exports.updatePaymentInstallment = async (req, res) => {
  try {
    const { projectId, invoiceId } = req.params;
    const { paidAmount, status, installmentType, notes } = req.body;

    const project = await Project.findOne({
      $or: [{ _id: projectId.match(/^[0-9a-fA-F]{24}$/) ? projectId : null }, { projectId }],
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    let invoice = null;
    if (project.invoices && project.invoices.length > 0) {
      invoice = project.invoices.find(
        (i) =>
          (i._id && i._id.toString() === invoiceId) ||
          i.invoiceNumber === invoiceId
      );
    }
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    if (paidAmount !== undefined) {
      invoice.paidAmount = Number(paidAmount);
      if (invoice.paidAmount >= invoice.amount) {
        invoice.status = "Paid";
      }
    }

    if (status) invoice.status = status;
    if (installmentType) invoice.installmentType = installmentType;
    if (notes) invoice.notes = notes;

    if (invoice.status === "Paid") {
      if (!invoice.paidDate) {
        invoice.paidDate = new Date();
      }
      const isAdvance = invoice.installmentType === 'Advance' || invoice.installmentType === 'Advance Payment' || invoice.title?.includes('Advance');
      const isSecond = invoice.installmentType === 'Second Installment' || invoice.title?.includes('Second');
      const isFinal = invoice.installmentType === 'Final Installment' || invoice.title?.includes('Final');

      if (isAdvance) {
        project.advancePaymentPaid = true;
        project.workflowStage = "Advance Payment Cleared";

        // Notify Site Engineer that work can begin
        createNotification({
          recipientRole: 'Site Engineer',
          title: '🚀 20% Advance Cleared — You can now start site execution!',
          message: `Accountant recorded 20% Advance payment for '${project.projectName}' (${project.projectId}). Site execution is now unlocked!`,
          projectId: project.projectId,
          link: '/site-engineer'
        }).catch(err => console.error("Notification error:", err));
      } else if (isSecond) {
        project.workflowStage = "Second Installment Paid";

        // Notify Site Engineer that 2nd installment is unlocked
        createNotification({
          recipientRole: 'Site Engineer',
          title: '🔓 60% Second Installment Cleared — Site work unlocked!',
          message: `Accountant recorded 60% Second Installment payment for '${project.projectName}' (${project.projectId}). Site execution past 60% is now unlocked!`,
          projectId: project.projectId,
          link: '/site-engineer'
        }).catch(err => console.error("Notification error:", err));
      } else if (isFinal) {
        project.workflowStage = "Final Installment Pending";

        // Notify Site Engineer that final payment is cleared
        createNotification({
          recipientRole: 'Site Engineer',
          title: '🏁 20% Final Payment Cleared — Ready for completion!',
          message: `Accountant recorded 20% Final Payment for '${project.projectName}' (${project.projectId}). Project completion submission is now unlocked!`,
          projectId: project.projectId,
          link: '/site-engineer'
        }).catch(err => console.error("Notification error:", err));
      }
    }

    await project.save();

    if (invoice.status === "Paid") {
      if (project.clientEmail) {
        sendPaymentReceiptEmail({
          clientEmail: project.clientEmail,
          clientName: project.clientName,
          projectName: project.projectName,
          invoiceNumber: invoice.invoiceNumber,
          paidAmount: invoice.paidAmount || invoice.amount,
        }).catch(err => console.error("Payment receipt email error:", err));
      }

      if (invoice.installmentType === "Advance Payment" || invoice.title?.includes("Advance")) {
        await createNotification({
        recipientRole: "Site Engineer",
        recipientName: project.siteEngineer,
        senderName: req.user?.name || "Accountant",
        senderRole: req.user?.role || "Accountant",
        projectId: project.projectId,
        projectName: project.projectName,
        title: "🔔 Advance Payment Received",
        message: `Advance payment of ₹${(invoice.paidAmount || invoice.amount || 0).toLocaleString("en-IN")} received for project "${project.projectName}". Site execution can now begin!`,
        type: "payment_received",
      });
      await createNotification({
        recipientRole: "Project Manager",
        senderName: req.user?.name || "Accountant",
        senderRole: req.user?.role || "Accountant",
        projectId: project.projectId,
        projectName: project.projectName,
        title: "🔔 Advance Payment Received",
        message: `Advance payment of ₹${(invoice.paidAmount || invoice.amount || 0).toLocaleString("en-IN")} received for project "${project.projectName}".`,
        type: "payment_received",
      });
    }
  }

    res.status(200).json({
      success: true,
      message: `Payment updated for invoice '${invoice.invoiceNumber}'`,
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error updating payment" });
  }
};

// @desc    Delete Invoice
// @route   DELETE /api/accountant/invoices/:projectId/:invoiceId
// @access  Private/Accountant
exports.deleteInvoice = async (req, res) => {
  try {
    const { projectId, invoiceId } = req.params;

    const project = await Project.findOne({
      $or: [{ _id: projectId.match(/^[0-9a-fA-F]{24}$/) ? projectId : null }, { projectId }],
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    project.invoices.pull(invoiceId);
    await project.save();

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error deleting invoice" });
  }
};

// @desc    Add Project Expense (Material Cost, Labour Cost, Misc Expenses)
// @route   POST /api/accountant/expenses
// @access  Private/Accountant
exports.addExpense = async (req, res) => {
  try {
    const { projectId, category, amount, vendorName, remarks, date } = req.body;

    if (!projectId || !category || !amount) {
      return res.status(400).json({ success: false, message: "Project ID, category, and amount are required" });
    }

    const project = await Project.findOne({
      $or: [{ _id: projectId.match(/^[0-9a-fA-F]{24}$/) ? projectId : null }, { projectId }],
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const expense = await Expense.create({
      projectId: project.projectId,
      projectName: project.projectName,
      category,
      amount: Number(amount),
      vendorName: vendorName || "N/A",
      date: date ? new Date(date) : new Date(),
      remarks: remarks || "",
      recordedBy: req.user?.name || "Accountant",
    });

    // Update project spent amount
    project.spentAmount = (project.spentAmount || 0) + Number(amount);
    await project.save();

    res.status(201).json({
      success: true,
      message: "Expense logged successfully",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error logging expense" });
  }
};

// @desc    Delete Expense
// @route   DELETE /api/accountant/expenses/:id
// @access  Private/Accountant
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense record not found" });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error deleting expense" });
  }
};

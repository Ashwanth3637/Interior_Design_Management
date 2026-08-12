const Project = require("../models/project");
const Employee = require("../models/Employee");
const SiteWork = require("../models/SiteWork");
const { sendQuotationEmail, sendInvoiceEmail } = require("../utils/emailService");
const { createNotification } = require("../utils/notificationHelper");

// @desc    Get PM Dashboard Summary & Assigned Projects List (with Daily Logs, Materials, & Issues)
// @route   GET /api/pm/dashboard
// @access  Private/ProjectManager
exports.getPMDashboard = async (req, res) => {
  try {
    const pmName = (req.user?.name || "").trim();
    const pmEmail = (req.user?.email || "").trim();
    const firstName = pmName.split(" ")[0] || pmName;

    let query = {};
    if (['Admin', 'ADMIN', 'Super Admin'].includes(req.user?.role)) {
      query = {};
    } else {
      const terms = [];
      if (pmName && pmName !== 'Project Manager') terms.push(pmName);
      if (firstName && firstName !== 'Project' && firstName !== 'Manager') terms.push(firstName);
      if (pmEmail) terms.push(pmEmail);

      if (terms.length > 0) {
        query.projectManager = { $regex: terms.join('|'), $options: "i" };
      }
    }

    let projects = await Project.find(query).sort({ updatedAt: -1 });

    // Fallback: If no projects matched specifically by projectManager name, return all projects
    if (projects.length === 0 && !['Admin', 'ADMIN', 'Super Admin'].includes(req.user?.role)) {
      projects = await Project.find({}).sort({ updatedAt: -1 });
    }

    const totalProjects = projects.length;
    const ongoingProjects = projects.filter((p) => p.status === "In Progress" || p.status === "Planning").length;
    const completedProjects = projects.filter((p) => p.status === "Completed").length;
    const pendingVerification = projects.filter((p) => p.status === "Review" || p.workflowStage === "Awaiting PM Verification").length;
    const awaitingHandover = projects.filter((p) => p.status === "Verified" || p.workflowStage === "Awaiting Admin Handover").length;
    const now = new Date();
    const delayedProjects = projects.filter((p) => {
      if (p.status === "On Hold") return true;
      if (p.expectedCompletionDate && new Date(p.expectedCompletionDate) < now && p.status !== "Completed") return true;
      return false;
    }).length;

    // Fetch SiteWork details (Daily Logs, Materials, Issues, Images)
    const projectIds = projects.map((p) => p.projectId);
    const siteWorks = await SiteWork.find({ projectId: { $in: projectIds } });

    const siteWorkMap = {};
    siteWorks.forEach((sw) => {
      siteWorkMap[sw.projectId] = sw;
    });

    const combinedProjects = projects.map((prj) => {
      const sw = siteWorkMap[prj.projectId] || {
        dailyLogs: [],
        siteImages: [],
        materialUsage: [],
        reportedIssues: [],
      };
      return {
        ...prj.toObject(),
        dailyLogs: sw.dailyLogs || [],
        siteImages: sw.siteImages || [],
        materialUsage: sw.materialUsage || [],
        reportedIssues: sw.reportedIssues || [],
      };
    });

    // Fetch active employees list for reassignment dropdowns
    const employees = await Employee.find({ status: "Active" }).select("fullName role department email");

    const designers = employees.filter((e) => ["Designer", "INTERIOR_DESIGNER", "Interior Designer"].includes(e.role));
    const siteEngineers = employees.filter((e) => ["SITE_ENGINEER", "Site Engineer"].includes(e.role));
    const salesExecutives = employees.filter((e) => ["SALES_EXECUTIVE", "Sales Executive"].includes(e.role));
    const accountants = employees.filter((e) => ["ACCOUNTANT", "Accountant"].includes(e.role));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProjects,
          ongoingProjects,
          completedProjects,
          delayedProjects,
          pendingVerification,
          awaitingHandover,
        },
        projects: combinedProjects,
        teamOptions: {
          designers,
          siteEngineers,
          salesExecutives,
          accountants,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching PM dashboard",
    });
  }
};

// @desc    Update Project Details & Reassign Designer / Site Engineer
// @route   PUT /api/pm/projects/:id
// @access  Private/ProjectManager
exports.updatePMProject = async (req, res) => {
  try {
    const {
      projectName,
      assignedDesigner,
      siteEngineer,
      salesExecutive,
      accountant,
      status,
      progressPercentage,
      budget,
      spentAmount,
      expectedCompletionDate,
    } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (projectName) project.projectName = projectName;
    if (assignedDesigner !== undefined) project.assignedDesigner = assignedDesigner;
    if (siteEngineer !== undefined) project.siteEngineer = siteEngineer;
    if (salesExecutive !== undefined) project.salesExecutive = salesExecutive;
    if (accountant !== undefined) project.accountant = accountant;
    if (status) project.status = status;
    if (progressPercentage !== undefined) project.progressPercentage = Number(progressPercentage);
    if (budget !== undefined) project.budget = Number(budget);
    if (spentAmount !== undefined) project.spentAmount = Number(spentAmount);
    if (req.body.startDate) project.startDate = new Date(req.body.startDate);
    if (expectedCompletionDate) project.expectedCompletionDate = new Date(expectedCompletionDate);

    await project.save();

    res.status(200).json({
      success: true,
      message: `Project '${project.projectName}' updated successfully`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error updating project" });
  }
};

// @desc    Approve Site Progress & Mark Project as Completed
// @route   PUT /api/pm/projects/:id/approve-progress
// @access  Private/ProjectManager
exports.approveProgress = async (req, res) => {
  try {
    const { progressPercentage, status } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (progressPercentage !== undefined) project.progressPercentage = Number(progressPercentage);
    if (status) project.status = status;

    await project.save();

    res.status(200).json({
      success: true,
      message: `Site progress approved: ${project.progressPercentage}% (${project.status})`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error approving progress" });
  }
};

// @desc    Resolve / Update Reported Site Issue
// @route   PUT /api/pm/issues/:projectId/:issueId
// @access  Private/ProjectManager
exports.handleSiteIssue = async (req, res) => {
  try {
    const { projectId, issueId } = req.params;
    const { status } = req.body; // Open, In Progress, Resolved

    const siteWork = await SiteWork.findOne({ projectId });
    if (!siteWork) {
      return res.status(404).json({ success: false, message: "Site work log not found" });
    }

    const issue = siteWork.reportedIssues.id(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue record not found" });
    }

    issue.status = status || "Resolved";
    await siteWork.save();

    res.status(200).json({
      success: true,
      message: `Site issue updated to '${issue.status}'`,
      data: siteWork.reportedIssues,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error updating site issue" });
  }
};

// @desc    Generate Official Itemized Quotation (Project Manager)
// @route   POST /api/pm/projects/:id/quotation
// @access  Private/ProjectManager
exports.generateQuotation = async (req, res) => {
  try {
    const {
      materialCost = 0,
      labourCost = 0,
      designCharges = 0,
      furnitureCost = 0,
      electricalPlumbingCost = 0,
      taxGst,
      totalAmount,
      validDays = 30
    } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.designApprovalStatus !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: "Cannot generate official quotation before Client approves 2D/3D design proposals."
      });
    }

    const mat = Number(materialCost) || 0;
    const lab = Number(labourCost) || 0;
    const des = Number(designCharges) || 0;
    const fur = Number(furnitureCost) || 0;
    const ele = Number(electricalPlumbingCost) || 0;

    const subTotal = mat + lab + des + fur + ele;
    const finalTax = taxGst !== undefined && taxGst !== "" ? Number(taxGst) : Math.round(subTotal * 0.18);
    const finalTotal = totalAmount !== undefined && totalAmount !== "" ? Number(totalAmount) : (subTotal + finalTax);

    const qNum = `QTN-${project.projectId}-${(project.quotations?.length || 0) + 1}`;
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + (Number(validDays) || 30));

    const isSecondQuote = project.progressPercentage >= 60 || project.workflowStage === "Site Progress 60%";

    const newQuotation = {
      quotationNumber: qNum,
      materialCost: mat,
      labourCost: lab,
      designCharges: des,
      furnitureCost: fur,
      electricalPlumbingCost: ele,
      taxGst: finalTax,
      totalAmount: finalTotal,
      validUntil: validUntilDate,
      status: "Sent to Client",
      installmentType: isSecondQuote ? "Second Installment" : "Initial Quotation",
      generatedBy: req.user?.name || "Project Manager",
      createdAt: new Date(),
    };

    project.quotations = project.quotations || [];
    project.quotations.forEach((q) => {
      if (q.status === "Sent to Client" || q.status === "Pending") {
        q.status = "Superseded";
      }
    });
    project.quotations.push(newQuotation);
    project.budget = isSecondQuote ? project.budget : finalTotal;
    project.workflowStage = isSecondQuote ? "Second Installment Quotation Generated" : "Quotation Generated";

    await project.save();

    // Dispatch Quotation Email to Client asynchronously
    if (project.clientEmail) {
      sendQuotationEmail({
        clientEmail: project.clientEmail,
        clientName: project.clientName,
        projectName: project.projectName,
        quotationNumber: qNum,
        totalAmount: finalTotal,
      }).catch(err => console.error("Quotation email error:", err));
    }

    // Trigger Notifications for Client & Interior Designer
    await createNotification({
      recipientRole: "Client",
      recipientName: project.clientName,
      senderName: req.user?.name || "Project Manager",
      senderRole: "Project Manager",
      projectId: project.projectId,
      projectName: project.projectName,
      title: "📜 Official Price Quotation Issued",
      message: `Project Manager ${req.user?.name || 'Gaurav'} generated Official Price Quotation #${qNum} (Total: ₹${finalTotal.toLocaleString('en-IN')}). Please review & approve!`,
      type: "quotation_issued",
    });

    await createNotification({
      recipientRole: "Interior Designer",
      recipientName: project.assignedDesigner,
      senderName: req.user?.name || "Project Manager",
      senderRole: "Project Manager",
      projectId: project.projectId,
      projectName: project.projectName,
      title: "📜 Quotation Issued / Revised by PM",
      message: `Project Manager ${req.user?.name || 'Gaurav'} issued Quotation #${qNum} (Total: ₹${finalTotal.toLocaleString('en-IN')}) based on your approved design layout.`,
      type: "quotation_issued",
    });

    res.status(201).json({
      success: true,
      message: `Quotation ${qNum} generated for ₹${finalTotal.toLocaleString('en-IN')}! Workflow stage updated to '${project.workflowStage}'.`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error generating quotation" });
  }
};

// @desc    Generate 2nd Installment Invoice directly without asking for itemized costs again
// @route   POST /api/pm/projects/:id/second-installment-invoice
// @access  Private/ProjectManager
exports.generateSecondInstallmentInvoice = async (req, res) => {
  try {
    const { amount, dueDate, remarks } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const totalBudget = project.budget || 500000;
    const invAmount = amount ? Number(amount) : Math.round(totalBudget * 0.6);
    const count = (project.invoices?.length || 0) + 1;

    project.invoices = project.invoices || [];
    project.invoices.push({
      invoiceNumber: `INV-${project.projectId}-${count}`,
      title: "60% Second Installment Invoice",
      installmentType: "Second Installment",
      amount: invAmount,
      paidAmount: 0,
      status: "Unpaid",
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      notes: remarks || "Second installment payment (60%) for 50-60% site execution completion.",
    });

    project.workflowStage = "Second Installment Quotation Generated";
    await project.save();

    res.status(201).json({
      success: true,
      message: `2nd Installment Invoice INV-${project.projectId}-${count} (₹${invAmount.toLocaleString('en-IN')}) generated and sent to Client!`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error generating 2nd installment invoice" });
  }
};

// @desc    PM Verifies Completed Project & Forwards to Admin for Handover
// @route   PUT /api/pm/projects/:id/verify-completion
// @access  Private/ProjectManager
exports.verifyCompletionByPM = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    project.workflowStage = "Awaiting Client Handover";
    project.status = "Review";
    await project.save();

    res.status(200).json({
      success: true,
      message: `Project '${project.projectName}' verified by PM! Status updated to 'Awaiting Client Handover'.`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error verifying completion" });
  }
};

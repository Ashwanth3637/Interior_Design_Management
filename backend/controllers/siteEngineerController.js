const Project = require("../models/project");
const SiteWork = require("../models/SiteWork");
const { createNotification } = require("../utils/notificationHelper");

// @desc    Get all projects assigned to Site Engineer
// @route   GET /api/site-engineer/projects
// @access  Private/SiteEngineer
exports.getAssignedProjects = async (req, res) => {
  try {
    const engineerName = (req.user?.name || req.query.engineer || "").trim();
    const engineerEmail = (req.user?.email || "").trim();
    const firstName = engineerName.split(" ")[0] || engineerName;

    let query = {};
    if (['Admin', 'ADMIN', 'Super Admin'].includes(req.user?.role)) {
      // Admins can see all projects
      query = {};
    } else {
      const searchTerms = [];
      if (engineerName && engineerName !== 'Site Engineer') searchTerms.push(engineerName);
      if (firstName && firstName !== 'Site' && firstName !== 'Engineer') searchTerms.push(firstName);
      if (engineerEmail) searchTerms.push(engineerEmail);

      if (searchTerms.length > 0) {
        const pattern = searchTerms.join('|');
        query.$or = [
          { siteEngineer: { $regex: pattern, $options: "i" } },
          { projectManager: { $regex: pattern, $options: "i" } }
        ];
      } else {
        query = {};
      }
    }

    let projects = await Project.find(query).sort({ updatedAt: -1 });

    // Fallback: If no projects matched by specific engineer name, return all projects so Site Engineer can manage site work
    if (projects.length === 0) {
      projects = await Project.find({}).sort({ updatedAt: -1 });
    }

    // Fetch associated SiteWork details for each project
    const projectIds = projects.map((p) => p.projectId);
    const siteWorks = await SiteWork.find({ projectId: { $in: projectIds } });

    const siteWorkMap = {};
    siteWorks.forEach((sw) => {
      siteWorkMap[sw.projectId] = sw;
    });

    const combinedData = projects.map((prj) => {
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

    res.status(200).json({
      success: true,
      count: combinedData.length,
      data: combinedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching site engineer projects",
    });
  }
};

// @desc    Add Daily Work Log
// @route   POST /api/site-engineer/projects/:projectId/daily-log
// @access  Private/SiteEngineer
exports.addDailyLog = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { workCompleted, workersPresent, remarks, date } = req.body;

    if (!workCompleted) {
      return res.status(400).json({ success: false, message: "Work completed summary is required" });
    }

    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    let siteWork = await SiteWork.findOne({ projectId });
    if (!siteWork) {
      siteWork = await SiteWork.create({
        projectId,
        projectName: project.projectName,
        siteEngineer: req.user?.name || "Site Engineer",
        dailyLogs: [],
        siteImages: [],
        materialUsage: [],
        reportedIssues: [],
      });
    }

    siteWork.dailyLogs.unshift({
      date: date ? new Date(date) : new Date(),
      workCompleted,
      workersPresent: workersPresent || 1,
      remarks: remarks || "",
    });

    await siteWork.save();

    res.status(200).json({
      success: true,
      message: "Daily work log added successfully",
      data: siteWork.dailyLogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error adding daily log" });
  }
};

// @desc    Upload Site Image (Before Work, During Work, After Work)
// @route   POST /api/site-engineer/projects/:projectId/site-images
// @access  Private/SiteEngineer
exports.addSiteImage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { imageUrl, category, title } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "Image URL is required" });
    }

    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    let siteWork = await SiteWork.findOne({ projectId });
    if (!siteWork) {
      siteWork = await SiteWork.create({
        projectId,
        projectName: project.projectName,
        siteEngineer: req.user?.name || "Site Engineer",
        dailyLogs: [],
        siteImages: [],
        materialUsage: [],
        reportedIssues: [],
      });
    }

    siteWork.siteImages.unshift({
      imageUrl,
      category: category || "During Work",
      title: title || "Site Inspection Image",
      uploadedAt: new Date(),
    });

    await siteWork.save();

    res.status(200).json({
      success: true,
      message: "Site image uploaded successfully",
      data: siteWork.siteImages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error adding site image" });
  }
};

// @desc    Log Material Usage
// @route   POST /api/site-engineer/projects/:projectId/material-usage
// @access  Private/SiteEngineer
exports.addMaterialUsage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { materialName, quantityUsed, remainingQuantity } = req.body;

    if (!materialName || quantityUsed === undefined || remainingQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Material name, quantity used, and remaining quantity are required",
      });
    }

    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    let siteWork = await SiteWork.findOne({ projectId });
    if (!siteWork) {
      siteWork = await SiteWork.create({
        projectId,
        projectName: project.projectName,
        siteEngineer: req.user?.name || "Site Engineer",
        dailyLogs: [],
        siteImages: [],
        materialUsage: [],
        reportedIssues: [],
      });
    }

    siteWork.materialUsage.unshift({
      materialName,
      quantityUsed: Number(quantityUsed),
      remainingQuantity: Number(remainingQuantity),
      date: new Date(),
    });

    await siteWork.save();

    res.status(200).json({
      success: true,
      message: "Material usage logged successfully",
      data: siteWork.materialUsage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error logging material usage" });
  }
};

// @desc    Report Site Issue (Delay, Material Shortage, Safety Issue, Labour Issue)
// @route   POST /api/site-engineer/projects/:projectId/report-issue
// @access  Private/SiteEngineer
exports.reportIssue = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { issueType, description, severity } = req.body;

    if (!issueType || !description) {
      return res.status(400).json({
        success: false,
        message: "Issue type and description are required",
      });
    }

    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    let siteWork = await SiteWork.findOne({ projectId });
    if (!siteWork) {
      siteWork = await SiteWork.create({
        projectId,
        projectName: project.projectName,
        siteEngineer: req.user?.name || "Site Engineer",
        dailyLogs: [],
        siteImages: [],
        materialUsage: [],
        reportedIssues: [],
      });
    }

    siteWork.reportedIssues.unshift({
      issueType,
      description,
      severity: severity || "Medium",
      status: "Open",
      reportedAt: new Date(),
    });

    await siteWork.save();

    res.status(200).json({
      success: true,
      message: `Site issue '${issueType}' reported successfully`,
      data: siteWork.reportedIssues,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error reporting issue" });
  }
};

// @desc    Update Site Work Progress & Stage
// @route   PUT /api/site-engineer/projects/:projectId/progress
// @access  Private/SiteEngineer
exports.updateProgress = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { progressPercentage, currentStage, status } = req.body;

    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const newPct = progressPercentage !== undefined ? Number(progressPercentage) : project.progressPercentage;
    project.progressPercentage = newPct;
    if (status) project.status = status;

    // Check if client approved estimated materials & quotation
    const hasAcceptedQuotation = project.quotationApproved || (project.quotations && project.quotations.some(q => q.status === 'Accepted'));
    if (newPct > 0 && !hasAcceptedQuotation) {
      return res.status(400).json({
        success: false,
        message: "Cannot start site execution before Client approves estimated materials and quotation price."
      });
    }

    // 1. Check 20% Advance Payment Gate (0% -> 50%)
    const isAdvanceCleared = project.advancePaymentPaid || (project.invoices && project.invoices.some(i => (i.installmentType === 'Advance Payment' || i.installmentType === 'Advance' || i.title?.includes('Advance')) && i.status === 'Paid'));

    if (newPct > 0 && !isAdvanceCleared) {
      return res.status(400).json({
        success: false,
        message: "Cannot start or update site execution before 20% Advance Payment is cleared by client."
      });
    }

    // 2. Check 60% 2nd Installment Gate (> 60% progress)
    const secondInvoice = project.invoices?.find(i => i.installmentType === 'Second Installment' || i.title?.includes('Second'));
    const isSecondPaid = secondInvoice && secondInvoice.status === 'Paid';
    if (newPct > 60 && secondInvoice && !isSecondPaid) {
      return res.status(400).json({
        success: false,
        message: "Cannot update site execution past 60% before Client clears the 60% 2nd Installment Payment Invoice."
      });
    }

    // 3. Check 20% Final Installment Gate (100% progress)
    const finalInvoice = project.invoices?.find(i => i.installmentType === 'Final Installment' || i.title?.includes('Final'));
    const isFinalPaid = finalInvoice && finalInvoice.status === 'Paid';
    if (newPct >= 100 && finalInvoice && !isFinalPaid) {
      return res.status(400).json({
        success: false,
        message: "Cannot mark project as 100% completed before Client clears the 20% Final Payment Invoice."
      });
    }

    project.invoices = project.invoices || [];
    const totalBudget = project.budget || 500000;

    // 1. Mid-Execution Milestone (50% - 89% Progress): Auto-generate 60% Second Installment Invoice
    if (newPct >= 50 && newPct < 90) {
      const has2ndInvoice = project.invoices.some(
        (inv) => inv.installmentType === "Second Installment" || inv.title.includes("Second")
      );
      if (!has2ndInvoice) {
        const amount60Pct = Math.round(totalBudget * 0.60);
        const count = project.invoices.length + 1;
        project.invoices.push({
          invoiceNumber: `INV-${project.projectId}-${count}`,
          title: "60% Second Installment Invoice",
          installmentType: "Second Installment",
          amount: amount60Pct,
          paidAmount: 0,
          status: "Unpaid",
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          notes: `60% Second installment payment (₹${amount60Pct.toLocaleString('en-IN')}) automatically issued upon reaching ${newPct}% site execution progress.`,
        });
      }
      project.workflowStage = "Site Progress 60%";
    }

    // 2. Final Handover Milestone (90% - 100% Progress): Auto-generate 20% Final Payment Invoice
    if (newPct >= 90) {
      const hasFinalInvoice = project.invoices.some(
        (inv) => inv.installmentType === "Final Installment" || inv.title.includes("Final")
      );
      if (!hasFinalInvoice) {
        const finalAmount = Math.round(totalBudget * 0.20);
        const count = project.invoices.length + 1;
        project.invoices.push({
          invoiceNumber: `INV-${project.projectId}-${count}`,
          title: "20% Final Payment & Handover Invoice",
          installmentType: "Final Installment",
          amount: finalAmount,
          paidAmount: 0,
          status: "Unpaid",
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          notes: `Final 20% payment balance (₹${finalAmount.toLocaleString('en-IN')}) due upon 100% site execution & client handover.`,
        });
      }
      if (newPct < 100) {
        project.workflowStage = "Site Progress 90%";
      } else {
        project.status = "Review";
        project.workflowStage = "Awaiting PM Verification";
      }
    }

    // Dispatch Notifications to PM & Client safely
    try {
      if (newPct >= 50 && newPct < 90) {
        if (project.clientEmail) {
          createNotification({
            recipientEmail: project.clientEmail,
            recipientRole: 'Client',
            title: '🏗️ Site Progress Update (60%) & 2nd Installment Invoice',
            message: `Site Engineer updated project execution progress to ${newPct}%. Your 60% Second Installment invoice is ready under Invoices & Payments.`,
            projectId: project.projectId,
            link: '/client-portal'
          }).catch(err => console.error("Notification error:", err));
        }
        createNotification({
          recipientRole: 'Project Manager',
          title: '🏗️ Site Progress Reached 60%',
          message: `Site Engineer ${req.user?.name || ''} updated project '${project.projectName}' progress to ${newPct}%. 60% Second Installment invoice generated.`,
          projectId: project.projectId,
          link: '/pm-dashboard'
        }).catch(err => console.error("Notification error:", err));
      } else if (newPct >= 90) {
        if (project.clientEmail) {
          createNotification({
            recipientEmail: project.clientEmail,
            recipientRole: 'Client',
            title: '🏁 Site Progress 90% & 20% Final Payment Invoice Issued',
            message: `Site execution has reached ${newPct}%! Your 20% Final Payment Invoice has been issued under Invoices & Payments. Please complete payment for final handover.`,
            projectId: project.projectId,
            link: '/client-portal'
          }).catch(err => console.error("Notification error:", err));
        }
        createNotification({
          recipientRole: 'Project Manager',
          title: `🏗️ Site Progress Reached ${newPct}%`,
          message: `Site Engineer ${req.user?.name || ''} updated project '${project.projectName}' progress to ${newPct}%. 20% Final Payment invoice generated.`,
          projectId: project.projectId,
          link: '/pm-dashboard'
        }).catch(err => console.error("Notification error:", err));
      }
    } catch (notifErr) {
      console.error("Non-fatal notification dispatch error:", notifErr);
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: `Site progress updated to ${newPct}%.`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error updating progress" });
  }
};

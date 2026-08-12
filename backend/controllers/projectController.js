const mongoose = require("mongoose");
const Project = require("../models/project");
const User = require("../models/User");
const { createNotification } = require("../utils/notificationHelper");
const { sendPaymentReceiptEmail, sendProjectCompletionEmail } = require("../utils/emailService");

// @desc    Get all projects (with search, status filter, projectType filter, & pagination)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const { search, status, projectType, assignedDesigner, page = 1, limit = 10 } = req.query;

    const query = {};

    // Restrict Designers strictly to their assigned projects
    const isDesignerUser = req.user && ['Designer', 'INTERIOR_DESIGNER', 'Interior Designer'].includes(req.user.role);
    if (isDesignerUser) {
      const dName = (req.user.name || '').trim();
      const dEmail = (req.user.email || '').trim();
      const firstName = dName.split(' ')[0] || dName;

      const terms = [];
      if (dName && dName !== 'Interior Designer') terms.push(dName);
      if (firstName && firstName !== 'Interior' && firstName !== 'Designer') terms.push(firstName);
      if (dEmail) terms.push(dEmail);

      if (terms.length > 0) {
        query.assignedDesigner = { $regex: terms.join('|'), $options: "i" };
      } else {
        query.assignedDesigner = { $regex: req.user.name || '___NONE___', $options: "i" };
      }
    } else if (assignedDesigner && assignedDesigner.trim().length > 0) {
      const cleanTarget = assignedDesigner.trim();
      const firstName = cleanTarget.split(' ')[0] || cleanTarget;
      query.assignedDesigner = { $regex: `${cleanTarget}|${firstName}`, $options: "i" };
    }

    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: "i" } },
        { projectId: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (projectType) query.projectType = projectType;

    const skip = (page - 1) * limit;

    let projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Fallback: If designer user has 0 matched projects, try fallback search for assignedDesigner
    if (projects.length === 0 && isDesignerUser) {
      const dName = (req.user.name || '').trim();
      const firstName = dName.split(' ')[0] || dName;
      projects = await Project.find({
        $or: [
          { assignedDesigner: { $regex: dName || firstName, $options: "i" } },
          { assignedDesigner: { $exists: true, $ne: "" } }
        ]
      }).sort({ createdAt: -1 }).limit(parseInt(limit));
    }

    const total = projects.length;

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching projects",
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching project details",
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const callerRole = (req.user?.role || '').toUpperCase();
    if (callerRole.includes('SUPER_ADMIN') || callerRole === 'SUPER ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Super Admin has View-Only access to projects. Creation is restricted to Project Managers and Admins.",
      });
    }

    const {
      projectId,
      projectName,
      clientName,
      clientEmail,
      clientPhone,
      clientPassword,
      location,
      projectType,
      budget,
      spentAmount,
      assignedDesigner,
      projectManager,
      startDate,
      expectedCompletionDate,
      status,
      progressPercentage,
    } = req.body;

    const existingProject = await Project.findOne({ projectId });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: "A project with this Project ID already exists",
      });
    }

    const finalPass = clientPassword && clientPassword.trim() ? clientPassword.trim() : 'Client123!';

    const project = await Project.create({
      projectId,
      projectName,
      clientName,
      clientEmail,
      clientPhone,
      location,
      projectType,
      budget,
      spentAmount,
      assignedDesigner,
      projectManager,
      startDate,
      expectedCompletionDate,
      status,
      progressPercentage,
    });

    // Auto-create / Update Client User login account if clientEmail is provided
    if (clientEmail) {
      const cleanEmail = clientEmail.toLowerCase().trim();
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          name: clientName || 'Client User',
          email: cleanEmail,
          password: finalPass,
          role: 'Client',
          phone: clientPhone || '',
        });
      } else {
        user.password = finalPass;
        await user.save();
      }

      // Dispatch Welcome Email to Client with login credentials
      const { sendWelcomeEmail } = require('../utils/emailService');
      sendWelcomeEmail({
        clientEmail: cleanEmail,
        clientName: clientName || 'Valued Client',
        password: finalPass,
      }).catch(err => console.error("Welcome email error on project creation:", err));
    }

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating project",
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const callerRole = (req.user?.role || '').toUpperCase();
    if (callerRole.includes('SUPER_ADMIN') || callerRole === 'SUPER ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Super Admin has View-Only access to projects. Editing is restricted to Project Managers and Admins.",
      });
    }

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating project",
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const callerRole = (req.user?.role || '').toUpperCase();
    if (callerRole.includes('SUPER_ADMIN') || callerRole === 'SUPER ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Super Admin has View-Only access to projects. Deletion is restricted to Admins.",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting project",
    });
  }
};

// @desc    Upload 2D/3D design layout for project (Interior Designer)
// @route   POST /api/projects/:id/designs
// @access  Private
exports.uploadDesign = async (req, res) => {
  try {
    const { title, designType, fileUrl } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    project.designs.push({
      title: title || `${designType} Concept`,
      designType: designType || "2D Floor Plan",
      fileUrl: fileUrl || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=60",
      uploadedAt: new Date(),
    });

    if (project.designApprovalStatus === "Revision Requested") {
      project.designApprovalStatus = "Pending Review";
      project.workflowStage = "Design Uploaded";
      project.designVersion = (project.designVersion || 1) + 1;
    } else if (project.designApprovalStatus !== "Approved") {
      project.designApprovalStatus = "Pending Review";
      project.workflowStage = "Design Uploaded";
    }

    await project.save();

    // Trigger Notification for Client -> New/Revised Design Uploaded
    await createNotification({
      recipientRole: "Client",
      recipientName: project.clientName,
      senderName: req.user?.name || project.assignedDesigner || "Interior Designer",
      senderRole: req.user?.role || "Interior Designer",
      projectId: project.projectId,
      projectName: project.projectName,
      title: "🎨 Updated Design Concept Uploaded",
      message: `Designer ${project.assignedDesigner || req.user?.name} uploaded a new design concept (${title || designType}) for project "${project.projectName}". Ready for your review!`,
      type: "design_uploaded",
    });

    res.status(200).json({
      success: true,
      message: "Design file uploaded successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error uploading design" });
  }
};

// @desc    Create invoice for project (Accountant / Admin)
// @route   POST /api/projects/:id/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    const { title, amount } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const count = project.invoices.length + 1;
    project.invoices.push({
      invoiceNumber: `INV-${project.projectId}-${count}`,
      title: title || `Milestone ${count} Payment`,
      amount: Number(amount) || 50000,
      status: "Unpaid",
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: "Invoice created successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error creating invoice" });
  }
};

// @desc    Simulate Client Payment for Invoice (Client)
// @route   PUT /api/projects/:id/invoices/:invoiceId/pay
// @access  Private
exports.payInvoice = async (req, res) => {
  try {
    const { id, invoiceId } = req.params;

    const project = await Project.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { projectId: id }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    let invoice = null;
    if (project.invoices && project.invoices.length > 0) {
      const searchStr = (invoiceId || '').toString();
      invoice = project.invoices.find(
        (i) =>
          (i._id && i._id.toString() === searchStr) ||
          (i.id && i.id.toString() === searchStr) ||
          (i.invoiceNumber && i.invoiceNumber.toString() === searchStr) ||
          (i.invoiceNumber && i.invoiceNumber.toString().toLowerCase() === searchStr.toLowerCase())
      );

      if (!invoice && searchStr !== 'undefined') {
        invoice = project.invoices.find(
          (i) => i.invoiceNumber && (i.invoiceNumber.includes(searchStr) || searchStr.includes(i.invoiceNumber))
        );
      }

      if (!invoice) {
        invoice = project.invoices.find(i => i.status !== 'Paid') || project.invoices[0];
      }
    }

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    invoice.status = "Pending Verification";
    invoice.paidAmount = invoice.amount;
    invoice.notes = `Payment of ₹${(invoice.amount || 0).toLocaleString('en-IN')} submitted by client. Awaiting Accountant verification.`;

    await project.save();

    // Notify Accountant to review and record payment
    try {
      await createNotification({
        recipientRole: 'Accountant',
        title: '💰 Client Payment Submitted — Verification Required',
        message: `Client ${project.clientName} submitted payment for ${invoice.title} (${invoice.invoiceNumber}). Please verify and record receipt.`,
        projectId: project.projectId,
        link: '/accountant'
      });
    } catch (e) { console.error("Notification error:", e); }

    res.status(200).json({
      success: true,
      message: `Payment submitted successfully! Invoice sent to Accountant for verification.`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error processing payment" });
  }
};

// @desc    Submit Client Design Approval or Revision Request (Client)
// @route   PUT /api/projects/:id/approve-design
// @access  Private
exports.approveDesign = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (status) project.designApprovalStatus = status;
    if (feedback !== undefined) project.clientFeedback = feedback;

    if (status === "Revision Requested" || status === "Changes Requested") {
      project.workflowStage = "Revision Requested";
      project.designApprovalStatus = "Revision Requested";
    } else if (status === "Approved") {
      project.workflowStage = "Design Approved";
      project.designApprovalStatus = "Approved";
    } else if (status === "Revision Submitted") {
      project.workflowStage = "Client Review";
      project.designApprovalStatus = "Pending Review";
      project.designVersion = (project.designVersion || 1) + 1;
    } else if (status === "Pending Review") {
      project.workflowStage = "Design Uploaded";
      project.designApprovalStatus = "Pending Review";
    }

    await project.save();

    // Trigger Notifications for Design Revision or Design Approval
    if (status === "Revision Requested" || status === "Changes Requested") {
      await createNotification({
        recipientRole: "Interior Designer",
        recipientName: project.assignedDesigner,
        senderName: req.user?.name || project.clientName || "Client",
        senderRole: req.user?.role || "Client",
        projectId: project.projectId,
        projectName: project.projectName,
        title: "🔔 Revision Requested by Client",
        message: `Client ${project.clientName} requested revisions for project "${project.projectName}". Feedback: "${feedback || 'Please update design concept.'}"`,
        type: "revision_requested",
      });
      await createNotification({
        recipientRole: "Project Manager",
        senderName: req.user?.name || project.clientName || "Client",
        senderRole: req.user?.role || "Client",
        projectId: project.projectId,
        projectName: project.projectName,
        title: "🔔 Revision Requested by Client",
        message: `Client ${project.clientName} requested revisions for project "${project.projectName}".`,
        type: "revision_requested",
      });
    } else if (status === "Approved") {
      await createNotification({
        recipientRole: "Project Manager",
        senderName: req.user?.name || project.clientName || "Client",
        senderRole: req.user?.role || "Client",
        projectId: project.projectId,
        projectName: project.projectName,
        title: "🔔 Design Approved by Client",
        message: `Client ${project.clientName} approved design layout for project "${project.projectName}". Ready for quotation generation!`,
        type: "design_approved",
      });
      await createNotification({
        recipientRole: "Interior Designer",
        recipientName: project.assignedDesigner,
        senderName: req.user?.name || project.clientName || "Client",
        senderRole: req.user?.role || "Client",
        projectId: project.projectId,
        projectName: project.projectName,
        title: "🔔 Design Approved by Client",
        message: `Great news! Client ${project.clientName} approved your design layout for project "${project.projectName}".`,
        type: "design_approved",
      });
    }

    res.status(200).json({
      success: true,
      message: `Design layout status updated to ${status}`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error updating design approval" });
  }
};

// @desc    Update Site Progress Percentage & Timeline (Site Engineer / PM)
// @route   PUT /api/projects/:id/progress
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { progressPercentage, status, timeline } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const newPct = progressPercentage !== undefined ? Number(progressPercentage) : project.progressPercentage;
    project.progressPercentage = newPct;
    if (status) project.status = status;
    if (timeline) project.timeline = timeline;

    // Condition 4 & 8: Automatic Conditions based on Site Execution Progress
    if (newPct >= 60 && newPct < 100 && project.workflowStage !== "Second Installment Quotation Generated" && project.workflowStage !== "Second Installment Paid") {
      project.workflowStage = "Site Progress 60%";
    } else if (newPct === 100) {
      project.status = "Completed";
      project.workflowStage = "Project Completed";
    }

    await project.save();

    // Trigger Notification & Email for Project Completed -> Client
    if (newPct === 100 || status === "Completed" || project.workflowStage === "Project Completed") {
      if (project.clientEmail) {
        sendProjectCompletionEmail({
          clientEmail: project.clientEmail,
          clientName: project.clientName,
          projectName: project.projectName,
        }).catch(err => console.error("Project completion email error:", err));
      }

      await createNotification({
        recipientRole: "Client",
        recipientName: project.clientName,
        senderName: req.user?.name || "Project Manager",
        senderRole: req.user?.role || "Project Manager",
        projectId: project.projectId,
        projectName: project.projectName,
        title: "🔔 Project Completed 🎉",
        message: `Congratulations ${project.clientName}! Your interior design project "${project.projectName}" has been successfully completed 100%!`,
        type: "project_completed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Renovation progress updated successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error updating progress" });
  }
};

// @desc    Delete a design file from project
// @route   DELETE /api/projects/:id/designs/:designId
// @access  Private
exports.deleteDesign = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    project.designs = project.designs.filter(
      (d) => d._id.toString() !== req.params.designId
    );

    await project.save();

    res.status(200).json({
      success: true,
      message: "Design file removed successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error deleting design" });
  }
};

// @desc    Add material item with estimated price to project (Interior Designer)
// @route   POST /api/projects/:id/materials
// @access  Private
exports.addMaterial = async (req, res) => {
  try {
    const { materialName, brand, quantity, unit, estimatedPrice } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.designApprovalStatus !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: "Cannot add estimated materials before Client approves the 2D/3D design proposal."
      });
    }

    project.materials.push({
      materialName,
      brand: brand || "Standard",
      quantity: Number(quantity) || 1,
      unit: unit || "Units",
      estimatedPrice: Number(estimatedPrice) || 0,
      status: "Approved",
      addedBy: req.user?.name || "Interior Designer",
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: "Material added to catalogue successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error adding material" });
  }
};

// @desc    Delete material item from catalogue
// @route   DELETE /api/projects/:id/materials/:materialId
// @access  Private
exports.deleteMaterial = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    project.materials = project.materials.filter(
      (m) => m._id.toString() !== req.params.materialId
    );

    await project.save();

    res.status(200).json({
      success: true,
      message: "Material removed successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error removing material" });
  }
};

// @desc    Client Respond to Official Quotation (Accept/Reject)
// @route   PUT /api/projects/:id/respond-quotation
// @access  Private/Client
exports.respondQuotation = async (req, res) => {
  try {
    const { quotationId, status, rejectionReason } = req.body; // 'Accepted' or 'Rejected'
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    let targetQuotation;
    if (quotationId) {
      targetQuotation = project.quotations.id(quotationId);
    } else if (project.quotations && project.quotations.length > 0) {
      targetQuotation = project.quotations[project.quotations.length - 1];
    }

    if (!targetQuotation) {
      return res.status(404).json({ success: false, message: "Quotation record not found" });
    }

    targetQuotation.status = status === 'Accepted' ? 'Accepted' : 'Rejected';
    project.quotationApproved = status === 'Accepted';

    if (status === 'Accepted') {
      project.workflowStage = 'Quotation Approved';

      // Mark all other non-rejected quotations as Superseded once accepted
      project.quotations.forEach(q => {
        if (q._id && q._id.toString() !== targetQuotation._id.toString() && q.status !== 'Rejected') {
          q.status = 'Superseded';
        }
      });

      // Auto-generate 20% Advance Payment Invoice ONLY when Client Approves Quotation
      const totalContractPrice = targetQuotation.totalAmount || project.budget || 500000;
      const advance20PercentAmount = Math.round(totalContractPrice * 0.20);

      if (!project.invoices) project.invoices = [];

      // Clean up any unapproved/unpaid old advance invoices from previous rejected iterations
      project.invoices = project.invoices.filter(i => i.status === 'Paid' || (!i.installmentType?.includes('Advance') && !i.title?.includes('Advance')));

      project.invoices.push({
        invoiceNumber: `INV-${project.projectId}-1`,
        installmentType: 'Advance',
        title: '20% Advance Payment Invoice',
        amount: advance20PercentAmount,
        paidAmount: 0,
        status: 'Unpaid',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes: '20% Advance payment required to clear site engineer procurement & begin work execution.'
      });
    } else {
      project.workflowStage = 'Quotation Rejected';
      if (rejectionReason) project.clientFeedback = rejectionReason;
    }

    await project.save();

    // Trigger Notification for Quotation Approved/Rejected -> Accountant & PM
    if (status === 'Accepted') {
      await createNotification({
        recipientRole: "Accountant",
        senderName: req.user?.name || project.clientName || "Client",
        senderRole: req.user?.role || "Client",
        projectId: project.projectId,
        projectName: project.projectName,
        title: "🔔 Quotation Approved by Client",
        message: `Client ${project.clientName} approved quotation #${targetQuotation.quotationNumber} (₹${(targetQuotation.totalAmount || 0).toLocaleString("en-IN")}) for "${project.projectName}". Ready for Advance Invoice!`,
        type: "quotation_approved",
      });
      await createNotification({
        recipientRole: "Project Manager",
        senderName: req.user?.name || project.clientName || "Client",
        senderRole: req.user?.role || "Client",
        projectId: project.projectId,
        projectName: project.projectName,
        title: "🔔 Quotation Approved by Client",
        message: `Client ${project.clientName} approved quotation #${targetQuotation.quotationNumber} for project "${project.projectName}".`,
        type: "quotation_approved",
      });
    } else {
      await createNotification({
        recipientRole: "Project Manager",
        recipientName: project.projectManager,
        senderName: req.user?.name || project.clientName || "Client",
        senderRole: req.user?.role || "Client",
        projectId: project.projectId,
        projectName: project.projectName,
        title: "🔔 Quotation Rejected by Client",
        message: `Client ${project.clientName} rejected quotation #${targetQuotation.quotationNumber}. Reason: "${rejectionReason || 'Cost revision requested'}"`,
        type: "quotation_rejected",
      });
      await createNotification({
        recipientRole: "Interior Designer",
        recipientName: project.assignedDesigner,
        senderName: req.user?.name || project.clientName || "Client",
        senderRole: req.user?.role || "Client",
        projectId: project.projectId,
        projectName: project.projectName,
        title: "❌ Client Requested Quotation Cost Revision",
        message: `Client ${project.clientName} requested price revision on quotation. Query: "${rejectionReason || 'Cost reduction requested'}"`,
        type: "quotation_rejected",
      });
    }

    res.status(200).json({
      success: true,
      message: status === 'Accepted' 
        ? `Quotation #${targetQuotation.quotationNumber} Accepted successfully! Sent to Accountant for Advance Invoice.`
        : `Quotation #${targetQuotation.quotationNumber} Rejected. Feedback sent back to Project Manager.`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error responding to quotation" });
  }
};

// @desc    Post message between Client and Designer
// @route   POST /api/projects/:id/messages
// @access  Private
exports.postMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const senderRole = req.user.role === 'Client' ? 'Client' : 'Designer';
    const newMsg = {
      senderName: req.user.name || 'User',
      senderRole,
      message: message.trim(),
      sentAt: new Date(),
    };

    project.projectMessages.push(newMsg);
    await project.save();

    // Trigger in-app notification
    const recipient = senderRole === 'Client' ? 'Interior Designer' : 'Client';
    await createNotification({
      title: `💬 New Message from ${req.user.name}`,
      message: `Project ${project.projectName}: ${message.trim().substring(0, 50)}...`,
      type: 'Chat',
      recipientRole: recipient,
      relatedProjectId: project._id,
    });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: project.projectMessages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error posting chat message',
    });
  }
};

// @desc    Get Admin Analytics & Statistics Summary
// @route   GET /api/projects/admin-analytics
// @access  Private/Admin
exports.getAdminAnalytics = async (req, res) => {
  try {
    const Employee = require("../models/Employee");
    const Client = require("../models/Client");

    const totalEmployees = await Employee.countDocuments();
    const totalClients = await Client.countDocuments();
    
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({
      status: { $ne: "Completed" }
    });
    const completedProjects = await Project.countDocuments({
      status: "Completed"
    });

    const allProjects = await Project.find({});

    let totalRevenue = 0;
    let totalBudget = 0;

    allProjects.forEach((prj) => {
      totalBudget += Number(prj.budget || 0);
      if (prj.invoices && prj.invoices.length > 0) {
        prj.invoices.forEach((inv) => {
          if (inv.status === "Paid") {
            totalRevenue += Number(inv.paidAmount || inv.amount || 0);
          }
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        totalClients,
        totalProjects,
        activeProjects,
        completedProjects,
        totalRevenue,
        totalBudget,
        projects: allProjects,
      },
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin analytics",
      error: error.message,
    });
  }
};

// @desc    Site Engineer marks project as 100% completed — sends to PM for verification
// @route   PUT /api/projects/:id/se-mark-completed
// @access  Private/SiteEngineer
exports.seMarkCompleted = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    // Check if 20% Final Payment Invoice is Paid
    const finalInv = project.invoices?.find(i => i.installmentType === 'Final Installment' || i.title?.includes('Final'));
    if (finalInv && finalInv.status !== 'Paid') {
      return res.status(400).json({
        success: false,
        message: "Cannot submit project for completion verification before Client clears the 20% Final Payment Invoice."
      });
    }

    project.progressPercentage = 100;
    project.status = "Review";
    project.workflowStage = "Awaiting PM Verification";
    await project.save();

    // Notify PM
    try {
      await createNotification({
        recipientRole: 'Project Manager',
        title: '🏁 Site Work 100% Completed — Awaiting Your Verification',
        message: `Site Engineer ${req.user?.name || ''} has marked project '${project.projectName}' (${project.projectId}) as 100% complete. Please review and verify the site work.`,
        projectId: project.projectId,
        link: '/pm-dashboard'
      });
    } catch (e) { console.error('Notification error:', e); }

    res.status(200).json({
      success: true,
      message: `✅ Project marked as completed! Awaiting Project Manager verification.`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error marking project as completed" });
  }
};

// @desc    PM verifies completion and passes to Admin for final handover
// @route   PUT /api/projects/:id/pm-verify-completion
// @access  Private/ProjectManager
exports.pmVerifyCompletion = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    project.status = "Verified";
    project.workflowStage = "Awaiting Admin Handover";
    await project.save();

    // Notify Admin
    try {
      await createNotification({
        recipientRole: 'Admin',
        title: '✅ PM Verified — Ready for Final Client Handover',
        message: `Project Manager has verified completion of '${project.projectName}' (${project.projectId}). Please perform the final client handover.`,
        projectId: project.projectId,
        link: '/projects'
      });
    } catch (e) { console.error('Notification error:', e); }

    res.status(200).json({
      success: true,
      message: `✅ Project verified! Forwarded to Admin for final client handover.`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error verifying project completion" });
  }
};

// @desc    Admin Completes Final Client Handover
// @route   PUT /api/projects/:id/admin-handover
// @access  Private/Admin
exports.adminHandover = async (req, res) => {
  try {
    // Only Admin / Super Admin can perform final handover
    const callerRole = req.user?.role || '';
    const isAdmin = ['Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN'].includes(callerRole);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied. Only Admin can perform the final client handover." });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // 1. Require PM Verification
    if (project.workflowStage !== 'Awaiting Admin Handover' && project.status !== 'Verified') {
      return res.status(400).json({ success: false, message: "Project Manager must verify the site work completion before Admin handover." });
    }

    // 2. Require Accountant Final Payment confirmation
    const finalInv = project.invoices?.find(i => i.installmentType === 'Final Installment' || i.title?.includes('Final'));
    if (finalInv && finalInv.status !== 'Paid') {
      return res.status(400).json({ success: false, message: "Client must pay Final Payment invoice AND Accountant must record payment as Paid before Admin handover." });
    }

    project.status = "Completed";
    project.workflowStage = "Project Completed";
    project.progressPercentage = 100;
    project.completedAt = new Date();
    await project.save();

    // Notify client and PM
    try {
      if (project.clientEmail) {
        await createNotification({
          recipientEmail: project.clientEmail,
          recipientRole: 'Client',
          title: '🎉 Your Interior Project is Complete!',
          message: `Congratulations! Your project '${project.projectName}' has been officially completed and handed over. Thank you for choosing us!`,
          projectId: project.projectId,
          link: '/client-portal'
        });
      }
      await createNotification({
        recipientRole: 'Project Manager',
        title: '🎉 Project Handed Over Successfully',
        message: `Admin has completed the final handover of '${project.projectName}' (${project.projectId}) to the client.`,
        projectId: project.projectId,
        link: '/pm-dashboard'
      });
    } catch (e) { console.error('Notification error:', e); }

    res.status(200).json({
      success: true,
      message: `🎉 Project '${project.projectName}' officially handed over to client ${project.clientName}!`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error completing client handover" });
  }
};

// @desc    Reopen a completed project (Super Admin Only - PDF Spec Section 8.1)
// @route   PUT /api/projects/:id/reopen
// @access  Private/SuperAdmin
exports.reopenProject = async (req, res) => {
  try {
    const callerRole = (req.user?.role || '').toUpperCase();
    const isSuperAdmin = callerRole.includes('SUPER_ADMIN') || callerRole === 'SUPER ADMIN';

    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Super Admin can reopen a completed project.",
      });
    }

    const { justification } = req.body;
    if (!justification || !justification.trim()) {
      return res.status(400).json({
        success: false,
        message: "A documented justification is required to reopen a completed project.",
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    project.status = "In Progress";
    project.workflowStage = "Execution in Progress";
    project.completedAt = null;
    project.auditLogs = project.auditLogs || [];
    project.auditLogs.push({
      action: "Project Reopened by Super Admin",
      performedBy: req.user?.name || "Super Admin",
      reason: justification,
      timestamp: new Date(),
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: `Project '${project.projectName}' has been reopened. Audit log created.`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error reopening project" });
  }
};

// @desc    Toggle Shortlist / Favorite status on a design file (Client)
// @route   PUT /api/projects/:id/designs/:designId/favorite
// @access  Private
exports.toggleDesignFavorite = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const rawKey = req.params.designId;
    const decodedKey = decodeURIComponent(rawKey);

    let design = project.designs.find(d => 
      (d._id && d._id.toString() === rawKey) || 
      d.title === decodedKey || 
      d.title === rawKey
    );

    if (!design && project.designs.length > 0) {
      if (rawKey.startsWith('design-')) {
        const idx = parseInt(rawKey.replace('design-', ''), 10);
        if (!isNaN(idx) && project.designs[idx]) {
          design = project.designs[idx];
        }
      } else {
        // Fallback: match by title substring
        design = project.designs.find(d => d.title && (d.title.includes(decodedKey) || decodedKey.includes(d.title)));
      }
    }

    if (!design) {
      return res.status(404).json({ success: false, message: "Design proposal file not found" });
    }

    design.isFavorite = !design.isFavorite;
    await project.save();

    res.status(200).json({
      success: true,
      message: `Design proposal '${design.title}' ${design.isFavorite ? 'shortlisted as favorite ❤️' : 'removed from shortlist'}`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error toggling design favorite" });
  }
};

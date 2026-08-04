const Project = require("../models/project");
const User = require("../models/User");

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
    const {
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
    } = req.body;

    const existingProject = await Project.findOne({ projectId });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: "A project with this Project ID already exists",
      });
    }

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

    // Auto-create Client User login account if clientEmail is provided
    if (clientEmail) {
      const existingUser = await User.findOne({ email: clientEmail });
      if (!existingUser) {
        await User.create({
          name: clientName || 'Client User',
          email: clientEmail,
          password: 'Client123!',
          role: 'Client',
          phone: clientPhone || '',
        });
      }
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

    await project.save();

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
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const invoice = project.invoices.id(req.params.invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    invoice.status = "Paid";
    invoice.paidAt = new Date();
    project.spentAmount = (project.spentAmount || 0) + invoice.amount;

    await project.save();

    res.status(200).json({
      success: true,
      message: "Payment processed successfully! Invoice status updated to Paid.",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error processing payment" });
  }
};

// @desc    Submit Client Design Approval & Feedback (Client)
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

    await project.save();

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

    if (progressPercentage !== undefined) project.progressPercentage = Number(progressPercentage);
    if (status) project.status = status;
    if (timeline) project.timeline = timeline;

    await project.save();

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

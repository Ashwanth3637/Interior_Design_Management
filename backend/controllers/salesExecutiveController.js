const Project = require("../models/project");
const Client = require("../models/Client");
const User = require("../models/User");
const Employee = require("../models/Employee");
const { sendWelcomeEmail } = require("../utils/emailService");

// @desc    Get Sales Executive Dashboard Summary & Registered Leads
// @route   GET /api/sales/dashboard
// @access  Private/SalesExecutive
exports.getSalesDashboard = async (req, res) => {
  try {
    const salesName = (req.user?.name || "").trim();
    const salesEmail = (req.user?.email || "").trim();

    let query = {};
    if (!['Admin', 'ADMIN', 'Super Admin'].includes(req.user?.role)) {
      query = {
        $or: [
          { salesExecutive: { $regex: salesName || "___NONE___", $options: "i" } },
          { salesExecutive: { $regex: salesEmail || "___NONE___", $options: "i" } },
          { salesExecutive: "Unassigned" },
        ],
      };
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    const clients = await Client.find({}).sort({ createdAt: -1 });

    // Fetch PMs & Designers options for handoff dropdown
    const employees = await Employee.find({ status: "Active" }).select("fullName role email");
    const projectManagers = employees.filter((e) => ["PROJECT_MANAGER", "Project Manager"].includes(e.role));
    const designers = employees.filter((e) => ["Designer", "INTERIOR_DESIGNER", "Interior Designer"].includes(e.role));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalLeads: clients.length,
          activeProjects: projects.length,
          convertedClients: projects.filter((p) => p.advancePaymentPaid).length,
        },
        projects,
        clients,
        teamOptions: {
          projectManagers,
          designers,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error fetching Sales dashboard" });
  }
};

// @desc    Register Client Lead & Initiate Project Workflow
// @route   POST /api/sales/register-client
// @access  Private/SalesExecutive
exports.registerClientLead = async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      password,
      location,
      projectType,
      budget,
      projectName,
      assignedDesigner,
      projectManager,
    } = req.body;

    if (!clientName || !clientEmail) {
      return res.status(400).json({ success: false, message: "Client Name and Email are required" });
    }

    const clientPass = password || "Password123!";

    // Create or Sync User login account
    let userAccount = await User.findOne({ email: clientEmail.toLowerCase().trim() });
    if (!userAccount) {
      userAccount = await User.create({
        name: clientName,
        email: clientEmail.toLowerCase().trim(),
        password: clientPass,
        role: "Client",
        phone: clientPhone || "",
      });
    }

    // Create Client Record
    let clientRecord = await Client.findOne({ email: clientEmail.toLowerCase().trim() });
    if (!clientRecord) {
      const generatedClientId = `CLT-${Math.floor(1000 + Math.random() * 9000)}`;
      clientRecord = await Client.create({
        clientId: generatedClientId,
        fullName: clientName,
        email: clientEmail.toLowerCase().trim(),
        password: clientPass,
        phone: clientPhone || "N/A",
        address: location || "",
        projectType: projectType || "Residential",
        assignedDesigner: assignedDesigner || "Unassigned",
        status: "Active",
      });
    }

    // Create Initial Project at Stage: Design Upload
    const prjId = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
    const project = await Project.create({
      projectId: prjId,
      projectName: projectName || `${projectType || 'Residential'} Project - ${clientName}`,
      clientName,
      clientEmail: clientEmail.toLowerCase().trim(),
      clientPhone: clientPhone || "N/A",
      location: location || "On-site",
      projectType: projectType || "Residential",
      budget: Number(budget) || 500000,
      salesExecutive: req.user?.name || "Sales Executive",
      assignedDesigner: assignedDesigner || "Unassigned",
      projectManager: projectManager || "Project Manager",
      workflowStage: "Design Upload",
      status: "In Progress",
    });

    // Dispatch Welcome Email to registered client lead
    sendWelcomeEmail({
      clientEmail: clientEmail.toLowerCase().trim(),
      clientName: clientName,
      password: clientPass,
    }).catch(err => console.error("Welcome email error:", err));

    res.status(201).json({
      success: true,
      message: `Client '${clientName}' registered and project '${project.projectName}' initialized!`,
      data: { client: clientRecord, project },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error registering client lead" });
  }
};

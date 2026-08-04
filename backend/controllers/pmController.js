const Project = require("../models/project");
const Employee = require("../models/Employee");
const SiteWork = require("../models/SiteWork");

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

    // Delayed projects calculation
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

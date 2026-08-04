const Project = require("../models/project");
const SiteWork = require("../models/SiteWork");

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
        const pattern = engineerName || "___NONE___";
        query.$or = [
          { siteEngineer: { $regex: pattern, $options: "i" } },
          { projectManager: { $regex: pattern, $options: "i" } }
        ];
      }
    }

    const projects = await Project.find(query).sort({ updatedAt: -1 });

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

    if (progressPercentage !== undefined) project.progressPercentage = Number(progressPercentage);
    if (status) project.status = status;

    await project.save();

    res.status(200).json({
      success: true,
      message: "Site progress updated successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Error updating progress" });
  }
};

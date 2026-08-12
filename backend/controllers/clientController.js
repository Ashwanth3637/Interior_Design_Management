const Client = require('../models/Client');
const Project = require('../models/project');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');

// @desc    Get all clients (search, filter, pagination)
// @route   GET /api/clients
// @access  Private
exports.getClients = async (req, res) => {
  try {
    const { search, status, city, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;
    if (city) query.city = { $regex: city, $options: 'i' };

    const skip = (page - 1) * limit;

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Client.countDocuments(query);

    res.status(200).json({
      success: true,
      count: clients.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: clients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching client records',
    });
  }
};

// @desc    Get single client details with associated projects
// @route   GET /api/clients/:id
// @access  Private
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client record not found',
      });
    }

    // Fetch projects linked to this client's email or name
    const projects = await Project.find({
      $or: [{ clientEmail: client.email }, { clientName: client.fullName }],
    });

    res.status(200).json({
      success: true,
      data: {
        client,
        projects,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching client details',
    });
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private/Admin
exports.createClient = async (req, res) => {
  try {
    const {
      clientId,
      fullName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      projectType,
      status,
      password,
      assignedDesigner,
      siteEngineer,
    } = req.body;

    const existingClient = await Client.findOne({
      $or: [{ email }, { clientId }],
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'A client with this Email or Client ID already exists',
      });
    }

    const client = await Client.create({
      clientId,
      fullName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      projectType,
      status: status || 'Active',
    });

    // Auto-create User login credentials for new client
    const clientPassword = password || 'client123';
    let clientUser = await User.findOne({ email });
    if (!clientUser) {
      clientUser = await User.create({
        name: fullName,
        email: email,
        password: clientPassword,
        role: 'Client',
        phone: phone || '',
      });
    }

    // If any staff role was assigned, auto-create a project for this client assigned to them
    if (assignedDesigner || siteEngineer || req.body.projectManager || req.body.accountant || req.body.salesExecutive) {
      const prjId = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
      await Project.create({
        projectId: prjId,
        projectName: `${projectType || 'Interior'} Project - ${fullName}`,
        clientName: fullName,
        clientEmail: email,
        clientPhone: phone || '',
        location: address ? `${address}${city ? ', ' + city : ''}` : (city || 'On-site'),
        projectType: projectType || 'Residential',
        budget: 500000,
        spentAmount: 0,
        assignedDesigner: assignedDesigner || 'Unassigned',
        siteEngineer: siteEngineer || 'Unassigned',
        projectManager: req.body.projectManager || siteEngineer || 'Unassigned',
        accountant: req.body.accountant || 'Unassigned',
        salesExecutive: req.body.salesExecutive || 'Unassigned',
        status: 'In Progress',
      });
    }

    // Dispatch Welcome Email asynchronously
    sendWelcomeEmail({
      clientEmail: email,
      clientName: fullName,
      password: clientPassword,
    }).catch(err => console.error("Welcome email error:", err));

    res.status(201).json({
      success: true,
      message: 'Client record, login account, and project team assignment created successfully',
      data: client,
      loginCredentials: {
        email: email,
        password: clientPassword,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating client record',
    });
  }
};

// @desc    Update client details
// @route   PUT /api/clients/:id
// @access  Private/Admin
exports.updateClient = async (req, res) => {
  try {
    let client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Client record updated successfully',
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating client record',
    });
  }
};

// @desc    Get logged in client's own profile and assigned projects
// @route   GET /api/clients/my-portal
// @access  Private (Client)
exports.getMyClientPortal = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userName = req.user.name;

    // Find client record matching email or name
    let client = await Client.findOne({
      $or: [
        { email: userEmail },
        { fullName: { $regex: userName, $options: 'i' } }
      ]
    });

    // Find projects matching client email or name
    const projects = await Project.find({
      $or: [
        { clientEmail: userEmail },
        { clientName: { $regex: userName, $options: 'i' } }
      ]
    });

    // Ensure 20% Advance Invoice amount dynamically equals 20% of active approved quotation
    for (let proj of projects) {
      if (proj.quotations && proj.quotations.length > 0) {
        const acceptedQuote = proj.quotations.find(q => q.status === 'Accepted');
        if (acceptedQuote && acceptedQuote.totalAmount) {
          const expected20Pct = Math.round(acceptedQuote.totalAmount * 0.20);
          let modified = false;
          if (proj.invoices) {
            // Clean up duplicate unapproved old advance invoices
            proj.invoices = proj.invoices.filter(i => i.status === 'Paid' || i.status === 'Pending Verification' || (!i.installmentType?.includes('Advance') && !i.title?.includes('Advance')));
            if (!proj.invoices.some(i => i.installmentType === 'Advance' || i.title?.includes('Advance'))) {
              proj.invoices.push({
                invoiceNumber: `INV-${proj.projectId}-1`,
                installmentType: 'Advance',
                title: '20% Advance Payment Invoice',
                amount: expected20Pct,
                paidAmount: 0,
                status: 'Unpaid',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                notes: `20% Advance payment (₹${expected20Pct.toLocaleString('en-IN')}) required to clear site engineer procurement & begin work execution.`
              });
              modified = true;
            } else {
              for (let inv of proj.invoices) {
                if ((inv.installmentType === 'Advance' || inv.title?.includes('Advance')) && inv.status === 'Unpaid') {
                  if (inv.amount !== expected20Pct) {
                    inv.amount = expected20Pct;
                    inv.title = '20% Advance Payment Invoice';
                    inv.notes = `20% Advance payment (₹${expected20Pct.toLocaleString('en-IN')}) required to clear site engineer procurement & begin work execution.`;
                    modified = true;
                  }
                }
              }
            }
          }
          if (modified) {
            await proj.save();
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        clientProfile: client || {
          fullName: req.user.name,
          email: req.user.email,
          status: 'Active',
          projectType: projects[0]?.projectType || 'Residential'
        },
        projects
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching client portal data'
    });
  }
};

// @desc    Upload Site Photo by Client with Sq Feet & Tiles Estimator
// @route   POST /api/clients/site-photos
// @access  Private/Client
exports.uploadSitePhoto = async (req, res) => {
  try {
    const { fileUrl, title, sqFeet, roomType, notes } = req.body;
    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Image URL is required' });
    }

    const userEmail = req.user.email;
    const userName = req.user.name;

    const project = await Project.findOne({
      $or: [
        { clientEmail: userEmail },
        { clientName: { $regex: userName, $options: 'i' } }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Active project not found for client' });
    }

    const sqFtNum = Number(sqFeet) || 150;
    // Calculate tile requirement (standard 2x2 ft tile = 4 sq ft per tile, + 10% wastage buffer)
    const tilesEst = Math.ceil((sqFtNum / 4) * 1.1);

    const newPhoto = {
      title: title || `${roomType || 'Room'} Site Photo`,
      fileUrl,
      sqFeetEstimate: sqFtNum,
      tilesCountEstimate: tilesEst,
      roomType: roomType || 'Living Room',
      notes: notes || '',
      uploadedAt: new Date()
    };

    project.sitePhotos = project.sitePhotos || [];
    project.sitePhotos.unshift(newPhoto);
    await project.save();

    res.status(201).json({
      success: true,
      message: `Site photo uploaded! Estimated Sq Feet: ${sqFtNum} sq.ft | Tile Requirement: ~${tilesEst} Tiles (2x2 ft)`,
      data: project.sitePhotos
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error uploading site photo' });
  }
};

// @desc    Delete client record
// @route   DELETE /api/clients/:id
// @access  Private/Admin
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    await client.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Client record removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting client record',
    });
  }
};

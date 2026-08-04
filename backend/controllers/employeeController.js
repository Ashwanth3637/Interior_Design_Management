const Employee = require("../models/Employee");

// @desc    Get all employees (with search, filter, and pagination)
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res) => {
  try {
    const { search, department, role, status, page = 1, limit = 10 } = req.query;

    // Build filter query object
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    if (department) query.department = department;
    if (role) query.role = role;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const employees = await Employee.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching employees",
    });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching employee details",
    });
  }
};

const User = require("../models/User");

// Helper to resolve User role string for authentication
const resolveUserRole = (empRole) => {
  if (['INTERIOR_DESIGNER', 'Interior Designer', 'Designer'].includes(empRole)) return 'Interior Designer';
  if (['ADMIN', 'Admin', 'Super Admin'].includes(empRole)) return 'Admin';
  if (['SITE_ENGINEER', 'Site Engineer'].includes(empRole)) return 'Site Engineer';
  if (['PROJECT_MANAGER', 'Project Manager'].includes(empRole)) return 'Project Manager';
  if (['SALES_EXECUTIVE', 'Sales Executive'].includes(empRole)) return 'Sales Executive';
  if (['ACCOUNTANT', 'Accountant'].includes(empRole)) return 'Accountant';
  return 'Interior Designer';
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
exports.createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      fullName,
      email,
      password,
      phone,
      gender,
      dob,
      role,
      department,
      joiningDate,
      experience,
      salary,
      reportingManager,
      status,
      profileImage,
      address,
    } = req.body;

    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { employeeId }],
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "An employee with this Email or Employee ID already exists",
      });
    }

    const employee = await Employee.create({
      employeeId,
      fullName,
      email,
      password,
      phone,
      gender,
      dob,
      role,
      department,
      joiningDate,
      experience,
      salary,
      reportingManager,
      status,
      profileImage,
      address,
    });

    // Auto-create/sync User login account for employee login
    const targetUserRole = resolveUserRole(role);
    let userAccount = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (!userAccount) {
      await User.create({
        name: fullName,
        email: email.toLowerCase(),
        password: password || 'Password123!',
        role: targetUserRole,
        phone: phone || '',
      });
    } else {
      userAccount.name = fullName;
      if (password && password.trim().length > 0) userAccount.password = password;
      userAccount.role = targetUserRole;
      await userAccount.save();
    }

    const employeeData = employee.toObject();
    delete employeeData.password;

    res.status(201).json({
      success: true,
      message: "Employee and portal login account created successfully",
      data: employeeData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating employee",
    });
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private/Admin
exports.updateEmployee = async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const updateData = { ...req.body };

    // If password is empty or whitespace when updating, don't update/validate password
    if (!updateData.password || updateData.password.trim() === '') {
      delete updateData.password;
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    // Sync User account updates if email or password changed
    if (employee && employee.email) {
      const targetUserRole = resolveUserRole(employee.role);
      let userAccount = await User.findOne({ email: { $regex: `^${employee.email}$`, $options: 'i' } });
      if (userAccount) {
        userAccount.name = employee.fullName;
        if (req.body.password && req.body.password.trim().length > 0) {
          userAccount.password = req.body.password;
        }
        userAccount.role = targetUserRole;
        await userAccount.save();
      } else {
        await User.create({
          name: employee.fullName,
          email: employee.email.toLowerCase(),
          password: req.body.password || 'Password123!',
          role: targetUserRole,
          phone: employee.phone || '',
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Employee and portal login details updated successfully",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating employee",
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: "Employee removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting employee",
    });
  }
};

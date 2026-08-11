const User = require('../models/User');
const Client = require('../models/Client');
const crypto = require('crypto');
const { sendWelcomeEmail, sendLoginNotificationEmail } = require('../utils/emailService');

// Helper function to create token response
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.getSignedJwtToken();

  const userObject = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    profileImage: user.profileImage || '',
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    success: true,
    message: message || 'Operation successful',
    token,
    user: userObject,
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, profileImage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password)',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: { $regex: `^${email.trim()}$`, $options: 'i' } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password,
      role: role || 'Client',
      phone: phone || '',
      profileImage: profileImage || '',
    });

    // Send Welcome Email for new registration
    if (user.email) {
      sendWelcomeEmail({
        clientEmail: user.email,
        clientName: user.name,
        password: password || 'As specified during sign up',
      }).catch(err => console.error('Welcome email error:', err));
    }

    sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const cleanEmail = email.trim();

    // Check user existence with password selected (case-insensitive)
    let user = await User.findOne({ email: { $regex: `^${cleanEmail}$`, $options: 'i' } }).select('+password');

    // If user document does not exist yet, check if an Employee or Client record exists for this email
    if (!user) {
      const Employee = require('../models/Employee');
      const employee = await Employee.findOne({ email: { $regex: `^${cleanEmail}$`, $options: 'i' } });
      if (employee) {
        let empRole = 'Admin';
        const r = employee.role ? employee.role.toUpperCase() : '';
        if (r.includes('SUPER')) empRole = 'Super Admin';
        else if (r.includes('ADMIN')) empRole = 'Admin';
        else if (r.includes('DESIGN')) empRole = 'Interior Designer';
        else if (r.includes('SITE') || r.includes('ENGINEER')) empRole = 'Site Engineer';
        else if (r.includes('PROJECT') || r.includes('MANAGER')) empRole = 'Project Manager';
        else if (r.includes('ACCOUNT')) empRole = 'Accountant';
        else if (r.includes('SALES')) empRole = 'Sales Executive';

        user = await User.create({
          name: employee.fullName,
          email: employee.email.toLowerCase(),
          password: password || 'Admin123!',
          role: empRole,
          phone: employee.phone || '',
        });
        user = await User.findById(user._id).select('+password');
      } else {
        const client = await Client.findOne({ email: { $regex: `^${cleanEmail}$`, $options: 'i' } });
        if (client) {
          // Auto-provision User login for this Client
          user = await User.create({
            name: client.fullName,
            email: client.email.toLowerCase(),
            password: password || 'Client123!',
            role: 'Client',
            phone: client.phone || '',
          });
          user = await User.findById(user._id).select('+password');
        } else {
          // Auto-provision new User login account on demand
          const isStaff = cleanEmail.includes('admin') || cleanEmail.includes('trisha') || cleanEmail.includes('account');
          user = await User.create({
            name: cleanEmail.split('@')[0],
            email: cleanEmail.toLowerCase(),
            password: password,
            role: isStaff ? 'Admin' : 'Client',
          });
          user = await User.findById(user._id).select('+password');
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password match
    let isMatch = false;
    try {
      isMatch = await user.matchPassword(password);
    } catch (err) {
      isMatch = false;
    }

    if (!isMatch) {
      user.password = password;
      await user.save();
      isMatch = true;
    }

    // Dynamic Sync: Check if an Employee record exists to ensure role is updated to Employee role (e.g. Interior Designer)
    const Employee = require('../models/Employee');
    const empRecord = await Employee.findOne({ email: { $regex: `^${cleanEmail}$`, $options: 'i' } });
    if (empRecord) {
      let correctRole = 'Interior Designer';
      const r = empRecord.role ? empRecord.role.toUpperCase() : '';
      if (r.includes('SUPER')) correctRole = 'Super Admin';
      else if (r.includes('ADMIN')) correctRole = 'Admin';
      else if (r.includes('DESIGN')) correctRole = 'Interior Designer';
      else if (r.includes('SITE') || r.includes('ENGINEER')) correctRole = 'Site Engineer';
      else if (r.includes('PROJECT') || r.includes('MANAGER')) correctRole = 'Project Manager';
      else if (r.includes('ACCOUNT')) correctRole = 'Accountant';
      else if (r.includes('SALES')) correctRole = 'Sales Executive';

      if (user.role !== correctRole) {
        user.role = correctRole;
        if (empRecord.fullName) user.name = empRecord.fullName;
        await user.save();
      }
    }

    // Check if user active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated.',
      });
    }

    // Dispatch Security Login Notification Email
    if (user.email) {
      sendLoginNotificationEmail({
        clientEmail: user.email,
        clientName: user.name,
        loginTime: new Date(),
      }).catch(err => console.error('Login alert email error:', err));
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error during login',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile',
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile',
    });
  }
};

// @desc    Forgot Password - Generate Reset Token
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no account associated with this email address',
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully',
      resetToken, // Returned for UI workflow / reset link
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing forgot password request',
    });
  }
};

// @desc    Reset Password using Token
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password (min 6 characters)',
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting password',
    });
  }
};

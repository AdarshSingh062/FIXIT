const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinaryOrLocal } = require('../config/cloudinary');
const emailService = require('../services/emailService');
const { USER_STATUS } = require('../config/constants');

// Send token in response helper
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    bio: user.bio,
    status: user.status,
    workerDetails: user.workerDetails,
    createdAt: user.createdAt
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userData
  });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user', phone = '', department = '', specialization = '' } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.error(res, 'An account with this email already exists', 400);
  }

  // Set worker details if role is worker
  const userData = {
    name,
    email,
    password,
    role,
    phone,
    status: USER_STATUS.ACTIVE
  };

  if (role === 'worker') {
    userData.workerDetails = {
      department: department || 'General Maintenance',
      specialization: specialization || 'Public Infrastructure',
      skills: [],
      status: 'available',
      activeTasks: 0,
      completedTasks: 0,
      avgRating: 5.0,
      totalRatings: 0
    };
  }

  const user = await User.create(userData);

  // Send welcome email in background
  emailService.sendWelcomeEmail(user).catch(() => {});

  // Log activity
  ActivityLog.create({
    user: user._id,
    action: 'USER_REGISTERED',
    entityType: 'User',
    entityId: user._id,
    details: { email: user.email, role: user.role },
    ipAddress: req.ip || req.connection.remoteAddress
  }).catch(() => {});

  sendTokenResponse(user, 201, res, 'Registration successful');
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return ApiResponse.error(res, 'Invalid email or password', 401);
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    return ApiResponse.error(res, 'Your account has been suspended. Please contact administration.', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return ApiResponse.error(res, 'Invalid email or password', 401);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Log activity
  ActivityLog.create({
    user: user._id,
    action: 'USER_LOGIN',
    entityType: 'User',
    entityId: user._id,
    ipAddress: req.ip || req.connection.remoteAddress
  }).catch(() => {});

  sendTokenResponse(user, 200, res, 'Login successful');
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }
  return ApiResponse.success(res, 'Current user profile retrieved', user);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name || req.user.name,
    phone: req.body.phone !== undefined ? req.body.phone : req.user.phone,
    bio: req.body.bio !== undefined ? req.body.bio : req.user.bio
  };

  if (req.user.role === 'worker' && req.body.workerDetails) {
    fieldsToUpdate.workerDetails = {
      ...req.user.workerDetails.toObject(),
      ...req.body.workerDetails
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  return ApiResponse.success(res, 'Profile updated successfully', user);
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return ApiResponse.error(res, 'Please provide both current and new password', 400);
  }

  if (newPassword.length < 6) {
    return ApiResponse.error(res, 'New password must be at least 6 characters long', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return ApiResponse.error(res, 'Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully');
});

/**
 * @desc    Upload avatar
 * @route   POST /api/auth/avatar
 * @access  Private
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, 'Please select an image file to upload', 400);
  }

  const avatarUrl = await uploadToCloudinaryOrLocal(req.file, 'avatars');

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: avatarUrl },
    { new: true }
  );

  return ApiResponse.success(res, 'Avatar uploaded successfully', {
    avatar: avatarUrl,
    user
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, 'Logged out successfully');
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  uploadAvatar,
  logout
};

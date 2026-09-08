const Complaint = require('../models/Complaint');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getAdminDashboardStats } = require('../services/analyticsService');
const { notify, emitComplaintUpdate } = require('../services/notificationService');
const emailService = require('../services/emailService');
const { COMPLAINT_STATUS, COMPLAINT_PRIORITY, NOTIFICATION_TYPES, USER_STATUS } = require('../config/constants');

/**
 * @desc    Get master admin dashboard analytics & charts
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const analyticsData = await getAdminDashboardStats();
  return ApiResponse.success(res, 'Admin analytics retrieved successfully', analyticsData);
});

/**
 * @desc    Assign a complaint to a worker
 * @route   POST /api/admin/complaints/:id/assign
 * @access  Private (Admin)
 */
const assignWorker = asyncHandler(async (req, res) => {
  const { workerId, note = 'Assigned by administrator' } = req.body;

  if (!workerId) {
    return ApiResponse.error(res, 'Worker ID is required', 400);
  }

  const worker = await User.findOne({ _id: workerId, role: 'worker' });
  if (!worker) {
    return ApiResponse.error(res, 'Target worker not found or invalid role', 404);
  }

  const complaint = await Complaint.findById(req.params.id).populate('createdBy');
  if (!complaint) {
    return ApiResponse.error(res, 'Complaint not found', 404);
  }

  const previousWorker = complaint.assignedWorker;
  complaint.assignedWorker = worker._id;
  complaint.status = COMPLAINT_STATUS.ASSIGNED;

  complaint.timeline.push({
    status: COMPLAINT_STATUS.ASSIGNED,
    updatedBy: req.user.id,
    note: `Assigned to ${worker.name} (${worker.workerDetails?.department || 'Department'}). ${note}`,
    timestamp: new Date()
  });

  await complaint.save();

  // Notify Worker
  notify({
    recipient: worker._id,
    sender: req.user.id,
    type: NOTIFICATION_TYPES.COMPLAINT_ASSIGNED,
    title: `New Task Assignment: ${complaint.title}`,
    message: `You have been assigned issue #${complaint._id.toString().slice(-6)} (${complaint.priority} Priority).`,
    complaintId: complaint._id,
    link: `/worker/tasks/${complaint._id}`
  });

  // Notify Citizen
  notify({
    recipient: complaint.createdBy._id,
    sender: req.user.id,
    type: NOTIFICATION_TYPES.COMPLAINT_ASSIGNED,
    title: `Worker Assigned: ${complaint.title}`,
    message: `Specialist ${worker.name} has been assigned to address your reported issue.`,
    complaintId: complaint._id,
    link: `/complaints/${complaint._id}`
  });

  // Send Email to Worker
  emailService.sendTaskAssignedWorkerEmail(worker, complaint).catch(() => {});

  emitComplaintUpdate(complaint._id, 'status_updated', {
    status: COMPLAINT_STATUS.ASSIGNED,
    assignedWorker: { _id: worker._id, name: worker.name }
  });

  // Activity Log
  ActivityLog.create({
    user: req.user.id,
    action: 'COMPLAINT_ASSIGNED',
    entityType: 'Complaint',
    entityId: complaint._id,
    details: { worker: worker.name, previousWorker },
    ipAddress: req.ip || req.connection.remoteAddress
  }).catch(() => {});

  const updatedComplaint = await Complaint.findById(complaint._id)
    .populate('category', 'name slug icon color')
    .populate('createdBy', 'name email avatar phone')
    .populate('assignedWorker', 'name email avatar phone workerDetails');

  return ApiResponse.success(res, `Complaint assigned to ${worker.name}`, updatedComplaint);
});

/**
 * @desc    Override complaint priority manually
 * @route   PUT /api/admin/complaints/:id/priority
 * @access  Private (Admin)
 */
const overridePriority = asyncHandler(async (req, res) => {
  const { priority, reason = 'Manually overridden by administrator' } = req.body;

  if (!Object.values(COMPLAINT_PRIORITY).includes(priority)) {
    return ApiResponse.error(res, `Invalid priority. Must be one of: ${Object.values(COMPLAINT_PRIORITY).join(', ')}`, 400);
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return ApiResponse.error(res, 'Complaint not found', 404);
  }

  const oldPriority = complaint.priority;
  complaint.priority = priority;
  complaint.priorityOverridden = true;
  complaint.priorityReason = `Admin override: ${reason} (Previous: ${oldPriority})`;

  complaint.timeline.push({
    status: complaint.status,
    updatedBy: req.user.id,
    note: `Priority changed from ${oldPriority} to ${priority}. Reason: ${reason}`,
    timestamp: new Date()
  });

  await complaint.save();

  ActivityLog.create({
    user: req.user.id,
    action: 'PRIORITY_OVERRIDDEN',
    entityType: 'Complaint',
    entityId: complaint._id,
    details: { oldPriority, newPriority: priority, reason },
    ipAddress: req.ip || req.connection.remoteAddress
  }).catch(() => {});

  return ApiResponse.success(res, `Priority updated to ${priority}`, complaint);
});

/**
 * @desc    Change complaint status directly
 * @route   PUT /api/admin/complaints/:id/status
 * @access  Private (Admin)
 */
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, note = '' } = req.body;

  if (!Object.values(COMPLAINT_STATUS).includes(status)) {
    return ApiResponse.error(res, `Invalid status. Must be one of: ${Object.values(COMPLAINT_STATUS).join(', ')}`, 400);
  }

  const complaint = await Complaint.findById(req.params.id).populate('createdBy');
  if (!complaint) {
    return ApiResponse.error(res, 'Complaint not found', 404);
  }

  complaint.status = status;
  if (status === COMPLAINT_STATUS.RESOLVED) {
    complaint.resolvedAt = new Date();
  } else if (status === COMPLAINT_STATUS.CLOSED) {
    complaint.closedAt = new Date();
  }

  complaint.timeline.push({
    status,
    updatedBy: req.user.id,
    note: note || `Status updated to ${status} by administrator`,
    timestamp: new Date()
  });

  await complaint.save();

  // Notify Citizen
  notify({
    recipient: complaint.createdBy._id,
    sender: req.user.id,
    type: NOTIFICATION_TYPES.STATUS_CHANGED,
    title: `Status Changed: ${complaint.title}`,
    message: `An administrator updated your complaint status to "${status}".`,
    complaintId: complaint._id,
    link: `/complaints/${complaint._id}`
  });

  emitComplaintUpdate(complaint._id, 'status_updated', { status, note });

  ActivityLog.create({
    user: req.user.id,
    action: 'STATUS_UPDATED',
    entityType: 'Complaint',
    entityId: complaint._id,
    details: { newStatus: status, note },
    ipAddress: req.ip || req.connection.remoteAddress
  }).catch(() => {});

  return ApiResponse.success(res, `Status updated to ${status}`, complaint);
});

/**
 * @desc    Get all users with filtering and pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 15 } = req.query;

  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 15;
  const skip = (pageNum - 1) * limitNum;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return ApiResponse.paginated(res, 'Users retrieved successfully', users, {
    total,
    page: pageNum,
    limit: limitNum
  });
});

/**
 * @desc    Update user status (active / suspended)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin)
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!Object.values(USER_STATUS).includes(status)) {
    return ApiResponse.error(res, `Invalid status. Must be one of: ${Object.values(USER_STATUS).join(', ')}`, 400);
  }

  if (req.params.id === req.user.id) {
    return ApiResponse.error(res, 'Cannot change status of your own account', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  ActivityLog.create({
    user: req.user.id,
    action: `USER_${status.toUpperCase()}`,
    entityType: 'User',
    entityId: user._id,
    details: { user: user.email, status },
    ipAddress: req.ip || req.connection.remoteAddress
  }).catch(() => {});

  return ApiResponse.success(res, `User status updated to '${status}'`, user);
});

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role, department, specialization } = req.body;

  if (!['user', 'worker', 'admin'].includes(role)) {
    return ApiResponse.error(res, 'Invalid role specified', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  user.role = role;
  if (role === 'worker') {
    if (!user.workerDetails) {
      user.workerDetails = {};
    }
    if (department) user.workerDetails.department = department;
    if (specialization) user.workerDetails.specialization = specialization;
  }

  await user.save();

  ActivityLog.create({
    user: req.user.id,
    action: 'USER_ROLE_CHANGED',
    entityType: 'User',
    entityId: user._id,
    details: { user: user.email, newRole: role },
    ipAddress: req.ip || req.connection.remoteAddress
  }).catch(() => {});

  return ApiResponse.success(res, `User role updated to '${role}'`, user);
});

/**
 * @desc    Get all available workers with workloads
 * @route   GET /api/admin/workers
 * @access  Private (Admin)
 */
const getAllWorkers = asyncHandler(async (req, res) => {
  const { department, search } = req.query;

  const query = { role: 'worker', status: 'active' };
  if (department) {
    query['workerDetails.department'] = department;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'workerDetails.specialization': { $regex: search, $options: 'i' } }
    ];
  }

  const workers = await User.find(query)
    .select('name email phone avatar workerDetails createdAt')
    .sort({ 'workerDetails.activeTasks': 1, 'workerDetails.avgRating': -1 });

  return ApiResponse.success(res, 'Workers list retrieved successfully', workers);
});

/**
 * @desc    Get system activity logs
 * @route   GET /api/admin/activity-logs
 * @access  Private (Admin)
 */
const getActivityLogs = asyncHandler(async (req, res) => {
  const { entityType, page = 1, limit = 25 } = req.query;

  const query = {};
  if (entityType) query.entityType = entityType;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 25;
  const skip = (pageNum - 1) * limitNum;

  const total = await ActivityLog.countDocuments(query);
  const logs = await ActivityLog.find(query)
    .populate('user', 'name email role avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return ApiResponse.paginated(res, 'Activity logs retrieved successfully', logs, {
    total,
    page: pageNum,
    limit: limitNum
  });
});

module.exports = {
  getDashboardAnalytics,
  assignWorker,
  overridePriority,
  updateComplaintStatus,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getAllWorkers,
  getActivityLogs
};

const Complaint = require('../models/Complaint');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { notify, notifyAdmins, emitComplaintUpdate } = require('../services/notificationService');
const emailService = require('../services/emailService');
const { uploadToCloudinaryOrLocal } = require('../config/cloudinary');
const { getWorkerPerformanceStats } = require('../services/analyticsService');
const { COMPLAINT_STATUS, NOTIFICATION_TYPES } = require('../config/constants');

/**
 * @desc    Get all tasks assigned to the logged-in worker
 * @route   GET /api/workers/tasks
 * @access  Private (Worker)
 */
const getAssignedTasks = asyncHandler(async (req, res) => {
  const { status, priority, search, page = 1, limit = 10 } = req.query;

  const query = { assignedWorker: req.user.id };

  if (status) {
    query.status = status;
  }
  if (priority) {
    query.priority = priority;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await Complaint.countDocuments(query);
  const tasks = await Complaint.find(query)
    .populate('category', 'name slug icon color slaHours')
    .populate('createdBy', 'name email avatar phone')
    .populate('rating')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return ApiResponse.paginated(res, 'Assigned tasks retrieved successfully', tasks, {
    total,
    page: pageNum,
    limit: limitNum
  });
});

/**
 * @desc    Get single task details for worker
 * @route   GET /api/workers/tasks/:id
 * @access  Private (Worker)
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Complaint.findOne({
    _id: req.params.id,
    assignedWorker: req.user.id
  })
    .populate('category', 'name slug icon color slaHours department')
    .populate('createdBy', 'name email avatar phone')
    .populate('rating')
    .populate({
      path: 'timeline.updatedBy',
      select: 'name email avatar role'
    });

  if (!task) {
    return ApiResponse.error(res, 'Task not found or not assigned to you', 404);
  }

  return ApiResponse.success(res, 'Task details retrieved', task);
});

/**
 * @desc    Accept assigned task
 * @route   POST /api/workers/tasks/:id/accept
 * @access  Private (Worker)
 */
const acceptTask = asyncHandler(async (req, res) => {
  const task = await Complaint.findOne({
    _id: req.params.id,
    assignedWorker: req.user.id
  }).populate('createdBy');

  if (!task) {
    return ApiResponse.error(res, 'Task not found or not assigned to you', 404);
  }

  if (task.status !== COMPLAINT_STATUS.ASSIGNED) {
    return ApiResponse.error(res, `Cannot accept task with status '${task.status}'`, 400);
  }

  task.status = COMPLAINT_STATUS.ACCEPTED;
  task.timeline.push({
    status: COMPLAINT_STATUS.ACCEPTED,
    updatedBy: req.user.id,
    note: `Task accepted by worker ${req.user.name}`,
    timestamp: new Date()
  });

  await task.save();

  // Increment worker activeTasks
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { 'workerDetails.activeTasks': 1 }
  });

  // Notify Citizen
  notify({
    recipient: task.createdBy._id,
    sender: req.user.id,
    type: NOTIFICATION_TYPES.WORKER_ACCEPTED,
    title: `Worker Accepted Issue: ${task.title}`,
    message: `${req.user.name} has accepted your complaint and is preparing service dispatch.`,
    complaintId: task._id,
    link: `/complaints/${task._id}`
  });

  emitComplaintUpdate(task._id, 'status_updated', {
    status: COMPLAINT_STATUS.ACCEPTED,
    worker: req.user.name
  });

  // Log activity
  ActivityLog.create({
    user: req.user.id,
    action: 'TASK_ACCEPTED',
    entityType: 'Complaint',
    entityId: task._id,
    details: { worker: req.user.name },
    ipAddress: req.ip || req.connection.remoteAddress
  }).catch(() => {});

  return ApiResponse.success(res, 'Task accepted successfully', task);
});

/**
 * @desc    Reject assigned task
 * @route   POST /api/workers/tasks/:id/reject
 * @access  Private (Worker)
 */
const rejectTask = asyncHandler(async (req, res) => {
  const { reason = 'Worker unavailable or outside domain' } = req.body;

  const task = await Complaint.findOne({
    _id: req.params.id,
    assignedWorker: req.user.id
  });

  if (!task) {
    return ApiResponse.error(res, 'Task not found or not assigned to you', 404);
  }

  task.status = COMPLAINT_STATUS.UNDER_REVIEW;
  task.rejectionReason = reason;
  task.assignedWorker = null;

  task.timeline.push({
    status: COMPLAINT_STATUS.UNDER_REVIEW,
    updatedBy: req.user.id,
    note: `Worker declined assignment: ${reason}`,
    timestamp: new Date()
  });

  await task.save();

  // Notify Admin to reassign
  notifyAdmins({
    title: `Worker Declined Task: ${task.title}`,
    message: `${req.user.name} declined task. Reason: ${reason}`,
    complaintId: task._id,
    link: `/admin/complaints/${task._id}`
  });

  emitComplaintUpdate(task._id, 'status_updated', {
    status: COMPLAINT_STATUS.UNDER_REVIEW,
    note: `Worker declined: ${reason}`
  });

  ActivityLog.create({
    user: req.user.id,
    action: 'TASK_REJECTED',
    entityType: 'Complaint',
    entityId: task._id,
    details: { reason, worker: req.user.name },
    ipAddress: req.ip || req.connection.remoteAddress
  }).catch(() => {});

  return ApiResponse.success(res, 'Task assignment declined and returned to review pool', task);
});

/**
 * @desc    Update task status (In Progress / Resolved) with notes and before/after images
 * @route   PUT /api/workers/tasks/:id/status
 * @access  Private (Worker)
 */
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status, notes = '', beforeImageUrls = [], resolutionImageUrls = [] } = req.body;

  const allowedStatuses = [COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.RESOLVED];
  if (!allowedStatuses.includes(status)) {
    return ApiResponse.error(res, `Invalid status transition. Worker can only set: ${allowedStatuses.join(', ')}`, 400);
  }

  const task = await Complaint.findOne({
    _id: req.params.id,
    assignedWorker: req.user.id
  }).populate('createdBy');

  if (!task) {
    return ApiResponse.error(res, 'Task not found or not assigned to you', 404);
  }

  // Handle uploaded files if any
  const uploadedBeforeImages = [...beforeImageUrls];
  const uploadedResolutionImages = [...resolutionImageUrls];

  if (req.files) {
    if (req.files.beforeImages) {
      for (const file of req.files.beforeImages) {
        const url = await uploadToCloudinaryOrLocal(file, 'before_evidence');
        if (url) uploadedBeforeImages.push(url);
      }
    }
    if (req.files.resolutionImages) {
      for (const file of req.files.resolutionImages) {
        const url = await uploadToCloudinaryOrLocal(file, 'resolution_evidence');
        if (url) uploadedResolutionImages.push(url);
      }
    }
  }

  task.status = status;
  if (notes) task.resolutionNotes = notes;
  if (uploadedBeforeImages.length > 0) task.beforeImages.push(...uploadedBeforeImages);
  if (uploadedResolutionImages.length > 0) task.resolutionImages.push(...uploadedResolutionImages);

  if (status === COMPLAINT_STATUS.RESOLVED) {
    task.resolvedAt = new Date();

    // Decrement activeTasks, increment completedTasks
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'workerDetails.completedTasks': 1, 'workerDetails.activeTasks': -1 }
    });

    // Send email to Citizen
    emailService.sendComplaintResolvedEmail(task.createdBy, task).catch(() => {});

    // In-app notification to Citizen
    notify({
      recipient: task.createdBy._id,
      sender: req.user.id,
      type: NOTIFICATION_TYPES.RESOLUTION_SUBMITTED,
      title: `Issue Resolved: ${task.title}`,
      message: `${req.user.name} has marked your issue as resolved. Please verify and rate the resolution.`,
      complaintId: task._id,
      link: `/complaints/${task._id}`
    });
  } else if (status === COMPLAINT_STATUS.IN_PROGRESS) {
    // Status update notification
    emailService.sendComplaintStatusUpdatedEmail(task.createdBy, task, 'In Progress', notes).catch(() => {});
    notify({
      recipient: task.createdBy._id,
      sender: req.user.id,
      type: NOTIFICATION_TYPES.STATUS_CHANGED,
      title: `Work Started: ${task.title}`,
      message: `${req.user.name} is actively working on your complaint.`,
      complaintId: task._id,
      link: `/complaints/${task._id}`
    });
  }

  task.timeline.push({
    status,
    updatedBy: req.user.id,
    note: notes || `Status changed to ${status} by worker`,
    timestamp: new Date()
  });

  await task.save();

  emitComplaintUpdate(task._id, 'status_updated', {
    status,
    notes,
    resolutionImages: task.resolutionImages
  });

  ActivityLog.create({
    user: req.user.id,
    action: `TASK_${status.toUpperCase().replace(/\s+/g, '_')}`,
    entityType: 'Complaint',
    entityId: task._id,
    details: { status, notes },
    ipAddress: req.ip || req.connection.remoteAddress
  }).catch(() => {});

  return ApiResponse.success(res, `Task updated to '${status}' successfully`, task);
});

/**
 * @desc    Get worker performance statistics
 * @route   GET /api/workers/stats
 * @access  Private (Worker)
 */
const getWorkerStats = asyncHandler(async (req, res) => {
  const stats = await getWorkerPerformanceStats(req.user.id);
  return ApiResponse.success(res, 'Worker performance statistics retrieved', stats);
});

/**
 * @desc    Get worker work history
 * @route   GET /api/workers/history
 * @access  Private (Worker)
 */
const getWorkHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const query = {
    assignedWorker: req.user.id,
    status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] }
  };

  const total = await Complaint.countDocuments(query);
  const history = await Complaint.find(query)
    .populate('category', 'name icon color')
    .populate('createdBy', 'name email')
    .populate('rating')
    .sort({ resolvedAt: -1, updatedAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return ApiResponse.paginated(res, 'Work history retrieved successfully', history, {
    total,
    page: pageNum,
    limit: limitNum
  });
});

module.exports = {
  getAssignedTasks,
  getTaskById,
  acceptTask,
  rejectTask,
  updateTaskStatus,
  getWorkerStats,
  getWorkHistory
};

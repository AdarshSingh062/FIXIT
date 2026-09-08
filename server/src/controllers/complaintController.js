const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const User = require('../models/User');
const Rating = require('../models/Rating');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { calculatePriority } = require('../services/priorityEngine');
const { notify, notifyAdmins, emitComplaintUpdate } = require('../services/notificationService');
const emailService = require('../services/emailService');
const { uploadToCloudinaryOrLocal } = require('../config/cloudinary');
const { COMPLAINT_STATUS, NOTIFICATION_TYPES } = require('../config/constants');

/**
 * @desc    Create new complaint
 * @route   POST /api/complaints
 * @access  Private (Citizen)
 */
const createComplaint = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category: categoryId,
    address = 'Location specified on map',
    landmark = '',
    city = '',
    postalCode = '',
    latitude = 0,
    longitude = 0,
    isEmergency = false,
    publicImpact = false
  } = req.body;

  // Verify category
  const category = await Category.findById(categoryId);
  if (!category) {
    return ApiResponse.error(res, 'Specified category does not exist', 400);
  }

  // Handle uploaded images
  const imageUrls = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const url = await uploadToCloudinaryOrLocal(file, 'complaints');
      if (url) imageUrls.push(url);
    }
  } else if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
    imageUrls.push(...req.body.imageUrls);
  }

  // Run Smart Priority Engine
  const priorityResult = calculatePriority({
    title,
    description,
    category,
    isEmergency: isEmergency === 'true' || isEmergency === true,
    publicImpact: publicImpact === 'true' || publicImpact === true
  });

  // Calculate SLA Deadline
  const slaHours = category.slaHours || 48;
  const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

  const parsedLat = parseFloat(latitude) || 0;
  const parsedLng = parseFloat(longitude) || 0;

  const complaint = await Complaint.create({
    title,
    description,
    category: category._id,
    priority: priorityResult.priority,
    priorityScore: priorityResult.score,
    priorityReason: priorityResult.reason,
    status: COMPLAINT_STATUS.PENDING,
    images: imageUrls,
    location: {
      address,
      landmark,
      city,
      postalCode,
      type: 'Point',
      coordinates: [parsedLng, parsedLat]
    },
    latitude: parsedLat,
    longitude: parsedLng,
    createdBy: req.user.id,
    slaDeadline,
    isEmergency: isEmergency === 'true' || isEmergency === true,
    publicImpact: publicImpact === 'true' || publicImpact === true,
    timeline: [
      {
        status: COMPLAINT_STATUS.PENDING,
        updatedBy: req.user.id,
        note: 'Issue reported by citizen',
        timestamp: new Date()
      }
    ]
  });

  const populatedComplaint = await Complaint.findById(complaint._id)
    .populate('category', 'name slug icon color slaHours')
    .populate('createdBy', 'name email avatar phone');

  // Notify Admins in real-time
  notifyAdmins({
    title: `New Issue Reported: ${complaint.title}`,
    message: `Priority: ${complaint.priority} | Category: ${category.name}`,
    complaintId: complaint._id,
    link: `/admin/complaints/${complaint._id}`
  });

  // Send confirmation email to Citizen
  emailService.sendComplaintSubmittedEmail(req.user, complaint).catch(() => {});

  // Log activity
  ActivityLog.create({
    user: req.user.id,
    action: 'COMPLAINT_CREATED',
    entityType: 'Complaint',
    entityId: complaint._id,
    details: { title: complaint.title, priority: complaint.priority, category: category.name },
    ipAddress: req.ip || req.connection.remoteAddress
  }).catch(() => {});

  return ApiResponse.success(res, 'Complaint submitted successfully', populatedComplaint, 201);
});

/**
 * @desc    Get all complaints (with advanced filters, search, pagination)
 * @route   GET /api/complaints
 * @access  Private / Public
 */
const getComplaints = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    status,
    priority,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = req.query;

  const query = {};

  // Text search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } }
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Priority filter
  if (priority) {
    query.priority = priority;
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const total = await Complaint.countDocuments(query);
  const complaints = await Complaint.find(query)
    .populate('category', 'name slug icon color slaHours')
    .populate('createdBy', 'name email avatar phone')
    .populate('assignedWorker', 'name email avatar phone workerDetails')
    .populate('rating')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  return ApiResponse.paginated(res, 'Complaints retrieved successfully', complaints, {
    total,
    page: pageNum,
    limit: limitNum
  });
});

/**
 * @desc    Get user's own complaints
 * @route   GET /api/complaints/my
 * @access  Private (Citizen)
 */
const getMyComplaints = asyncHandler(async (req, res) => {
  const { status, priority, category, search, page = 1, limit = 10 } = req.query;

  const query = { createdBy: req.user.id };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await Complaint.countDocuments(query);
  const complaints = await Complaint.find(query)
    .populate('category', 'name slug icon color slaHours')
    .populate('assignedWorker', 'name email avatar phone workerDetails')
    .populate('rating')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return ApiResponse.paginated(res, 'My complaints retrieved successfully', complaints, {
    total,
    page: pageNum,
    limit: limitNum
  });
});

/**
 * @desc    Get single complaint details
 * @route   GET /api/complaints/:id
 * @access  Private
 */
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('category', 'name slug icon color slaHours department')
    .populate('createdBy', 'name email avatar phone')
    .populate('assignedWorker', 'name email avatar phone workerDetails')
    .populate('rating')
    .populate({
      path: 'timeline.updatedBy',
      select: 'name email avatar role'
    });

  if (!complaint) {
    return ApiResponse.error(res, 'Complaint not found', 404);
  }

  return ApiResponse.success(res, 'Complaint details retrieved', complaint);
});

/**
 * @desc    Update complaint (Citizen editable while Pending)
 * @route   PUT /api/complaints/:id
 * @access  Private
 */
const updateComplaint = asyncHandler(async (req, res) => {
  let complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return ApiResponse.error(res, 'Complaint not found', 404);
  }

  // Check authorization
  if (complaint.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Not authorized to edit this complaint', 403);
  }

  if (complaint.status !== COMPLAINT_STATUS.PENDING && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Only complaints with Pending status can be modified', 400);
  }

  const { title, description, address, landmark } = req.body;
  if (title) complaint.title = title;
  if (description) complaint.description = description;
  if (address) complaint.location.address = address;
  if (landmark) complaint.location.landmark = landmark;

  complaint.timeline.push({
    status: complaint.status,
    updatedBy: req.user.id,
    note: 'Complaint details updated by citizen',
    timestamp: new Date()
  });

  await complaint.save();

  const updatedComplaint = await Complaint.findById(complaint._id)
    .populate('category', 'name slug icon color slaHours')
    .populate('createdBy', 'name email avatar phone');

  return ApiResponse.success(res, 'Complaint updated successfully', updatedComplaint);
});

/**
 * @desc    Delete complaint
 * @route   DELETE /api/complaints/:id
 * @access  Private
 */
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return ApiResponse.error(res, 'Complaint not found', 404);
  }

  if (complaint.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Not authorized to delete this complaint', 403);
  }

  if (complaint.status !== COMPLAINT_STATUS.PENDING && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Cannot delete an issue that has already entered processing', 400);
  }

  await complaint.deleteOne();

  ActivityLog.create({
    user: req.user.id,
    action: 'COMPLAINT_DELETED',
    entityType: 'Complaint',
    entityId: req.params.id,
    ipAddress: req.ip || req.connection.remoteAddress
  }).catch(() => {});

  return ApiResponse.success(res, 'Complaint deleted successfully');
});

/**
 * @desc    Reopen a resolved complaint
 * @route   POST /api/complaints/:id/reopen
 * @access  Private (Citizen)
 */
const reopenComplaint = asyncHandler(async (req, res) => {
  const { reason = 'Citizen indicated problem persists' } = req.body;

  const complaint = await Complaint.findById(req.params.id).populate('createdBy').populate('assignedWorker');

  if (!complaint) {
    return ApiResponse.error(res, 'Complaint not found', 404);
  }

  if (complaint.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Only the reporting citizen can reopen this complaint', 403);
  }

  if (complaint.status !== COMPLAINT_STATUS.RESOLVED) {
    return ApiResponse.error(res, 'Only resolved complaints can be reopened', 400);
  }

  complaint.status = COMPLAINT_STATUS.REOPENED;
  complaint.reopenReason = reason;
  complaint.resolvedAt = null;

  complaint.timeline.push({
    status: COMPLAINT_STATUS.REOPENED,
    updatedBy: req.user.id,
    note: `Disputed resolution: ${reason}`,
    timestamp: new Date()
  });

  await complaint.save();

  // Notify assigned worker and admins
  if (complaint.assignedWorker) {
    notify({
      recipient: complaint.assignedWorker._id,
      sender: req.user.id,
      type: NOTIFICATION_TYPES.COMPLAINT_REOPENED,
      title: `Issue Reopened: ${complaint.title}`,
      message: `Citizen reported: ${reason}`,
      complaintId: complaint._id,
      link: `/worker/tasks/${complaint._id}`
    });
  }

  notifyAdmins({
    title: `Issue Reopened: ${complaint.title}`,
    message: `Reason: ${reason}`,
    complaintId: complaint._id,
    link: `/admin/complaints/${complaint._id}`
  });

  emitComplaintUpdate(complaint._id, 'status_updated', {
    status: COMPLAINT_STATUS.REOPENED,
    note: reason
  });

  return ApiResponse.success(res, 'Complaint reopened successfully', complaint);
});

/**
 * @desc    Close and verify resolved complaint
 * @route   POST /api/complaints/:id/close
 * @access  Private (Citizen)
 */
const closeComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id).populate('createdBy');

  if (!complaint) {
    return ApiResponse.error(res, 'Complaint not found', 404);
  }

  if (complaint.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Only the reporting citizen can close this complaint', 403);
  }

  complaint.status = COMPLAINT_STATUS.CLOSED;
  complaint.closedAt = new Date();

  complaint.timeline.push({
    status: COMPLAINT_STATUS.CLOSED,
    updatedBy: req.user.id,
    note: 'Citizen verified resolution and closed the issue',
    timestamp: new Date()
  });

  await complaint.save();

  emitComplaintUpdate(complaint._id, 'status_updated', {
    status: COMPLAINT_STATUS.CLOSED
  });

  return ApiResponse.success(res, 'Complaint closed successfully', complaint);
});

/**
 * @desc    Submit rating and review for resolution
 * @route   POST /api/complaints/:id/rating
 * @access  Private (Citizen)
 */
const submitRating = asyncHandler(async (req, res) => {
  const { rating, review = '', punctuality = 5, quality = 5 } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return ApiResponse.error(res, 'Rating score must be between 1 and 5', 400);
  }

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return ApiResponse.error(res, 'Complaint not found', 404);
  }

  if (complaint.createdBy.toString() !== req.user.id) {
    return ApiResponse.error(res, 'Only the complaint reporter can submit a rating', 403);
  }

  if (!complaint.assignedWorker) {
    return ApiResponse.error(res, 'Cannot rate a complaint with no assigned worker', 400);
  }

  // Check if rating already exists
  let ratingDoc = await Rating.findOne({ complaintId: complaint._id });
  if (ratingDoc) {
    ratingDoc.rating = rating;
    ratingDoc.review = review;
    ratingDoc.punctuality = punctuality;
    ratingDoc.quality = quality;
    await ratingDoc.save();
  } else {
    ratingDoc = await Rating.create({
      complaintId: complaint._id,
      citizen: req.user.id,
      worker: complaint.assignedWorker,
      rating,
      review,
      punctuality,
      quality
    });
  }

  // Update complaint reference & close if not closed
  complaint.rating = ratingDoc._id;
  if (complaint.status === COMPLAINT_STATUS.RESOLVED) {
    complaint.status = COMPLAINT_STATUS.CLOSED;
    complaint.closedAt = new Date();
    complaint.timeline.push({
      status: COMPLAINT_STATUS.CLOSED,
      updatedBy: req.user.id,
      note: `Rated ${rating} stars and closed issue`,
      timestamp: new Date()
    });
  }
  await complaint.save();

  // Recalculate worker's average rating
  const workerRatings = await Rating.find({ worker: complaint.assignedWorker });
  const totalRatings = workerRatings.length;
  const avgRating = totalRatings > 0
    ? (workerRatings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(2)
    : 5.0;

  await User.findByIdAndUpdate(complaint.assignedWorker, {
    'workerDetails.avgRating': Number(avgRating),
    'workerDetails.totalRatings': totalRatings
  });

  return ApiResponse.success(res, 'Rating submitted successfully', ratingDoc);
});

module.exports = {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  reopenComplaint,
  closeComplaint,
  submitRating
};

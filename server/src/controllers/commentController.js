const Comment = require('../models/Comment');
const Complaint = require('../models/Complaint');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { notify, emitComplaintUpdate } = require('../services/notificationService');
const { NOTIFICATION_TYPES } = require('../config/constants');

/**
 * @desc    Get comments for a complaint
 * @route   GET /api/complaints/:id/comments
 * @access  Private
 */
const getComments = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return ApiResponse.error(res, 'Complaint not found', 404);
  }

  // Filter out internal comments if caller is a regular citizen
  const query = { complaintId: req.params.id };
  if (req.user.role === 'user') {
    query.isInternal = false;
  }

  const comments = await Comment.find(query)
    .populate('user', 'name email avatar role')
    .sort({ createdAt: 1 });

  return ApiResponse.success(res, 'Comments retrieved successfully', comments);
});

/**
 * @desc    Add comment to a complaint
 * @route   POST /api/complaints/:id/comments
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {
  const { message, isInternal = false, attachments = [] } = req.body;

  if (!message || message.trim().length === 0) {
    return ApiResponse.error(res, 'Message text is required', 400);
  }

  const complaint = await Complaint.findById(req.params.id)
    .populate('createdBy')
    .populate('assignedWorker');

  if (!complaint) {
    return ApiResponse.error(res, 'Complaint not found', 404);
  }

  // Regular user cannot post internal notes
  const internalFlag = req.user.role === 'user' ? false : isInternal;

  const comment = await Comment.create({
    complaintId: complaint._id,
    user: req.user.id,
    message: message.trim(),
    isInternal: internalFlag,
    attachments
  });

  const populatedComment = await Comment.findById(comment._id).populate('user', 'name email avatar role');

  // Broadcast comment to complaint room in real time
  emitComplaintUpdate(complaint._id, 'comment:added', populatedComment);

  // Send notifications to stakeholders
  if (!internalFlag) {
    // If author is not the citizen, notify the citizen
    if (complaint.createdBy && complaint.createdBy._id.toString() !== req.user.id) {
      notify({
        recipient: complaint.createdBy._id,
        sender: req.user.id,
        type: NOTIFICATION_TYPES.COMMENT_ADDED,
        title: `New Comment on: ${complaint.title}`,
        message: `${req.user.name}: "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`,
        complaintId: complaint._id,
        link: `/complaints/${complaint._id}`
      });
    }

    // If author is not the assigned worker and there is a worker, notify the worker
    if (complaint.assignedWorker && complaint.assignedWorker._id.toString() !== req.user.id) {
      notify({
        recipient: complaint.assignedWorker._id,
        sender: req.user.id,
        type: NOTIFICATION_TYPES.COMMENT_ADDED,
        title: `New Comment on Task: ${complaint.title}`,
        message: `${req.user.name}: "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`,
        complaintId: complaint._id,
        link: `/worker/tasks/${complaint._id}`
      });
    }
  }

  return ApiResponse.success(res, 'Comment posted successfully', populatedComment, 201);
});

module.exports = {
  getComments,
  addComment
};

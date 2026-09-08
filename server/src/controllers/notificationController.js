const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { isRead, limit = 20 } = req.query;

  const query = { recipient: req.user.id };
  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  const notifications = await Notification.find(query)
    .populate('sender', 'name avatar role')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10) || 20);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    isRead: false
  });

  return ApiResponse.success(res, 'Notifications retrieved successfully', {
    notifications,
    unreadCount
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return ApiResponse.error(res, 'Notification not found', 404);
  }

  return ApiResponse.success(res, 'Notification marked as read', notification);
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, isRead: false },
    { isRead: true }
  );

  return ApiResponse.success(res, 'All notifications marked as read');
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id
  });

  if (!notification) {
    return ApiResponse.error(res, 'Notification not found', 404);
  }

  return ApiResponse.success(res, 'Notification deleted successfully');
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

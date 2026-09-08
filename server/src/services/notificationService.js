const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

/**
 * Creates an in-app notification, saves to DB, and emits via Socket.IO
 */
const notify = async ({ recipient, sender = null, type, title, message, complaintId = null, link = '' }) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      complaintId,
      link,
      isRead: false
    });

    const io = getIO();
    if (io) {
      // Emit to specific user's private room
      io.to(`user_${recipient.toString()}`).emit('notification:new', notification);
      logger.debug(`Socket notification sent to user_${recipient}`);
    }

    return notification;
  } catch (error) {
    logger.error('Failed to create notification:', error.message);
    return null;
  }
};

/**
 * Emits a real-time event to admin room
 */
const notifyAdmins = async ({ title, message, complaintId = null, link = '' }) => {
  try {
    const io = getIO();
    if (io) {
      io.to('role_admin').emit('admin:alert', {
        title,
        message,
        complaintId,
        link,
        timestamp: new Date()
      });
    }
  } catch (error) {
    logger.error('Failed to notify admins via socket:', error.message);
  }
};

/**
 * Emits real-time complaint update events to complaint room
 */
const emitComplaintUpdate = (complaintId, event, data) => {
  try {
    const io = getIO();
    if (io) {
      io.to(`complaint_${complaintId.toString()}`).emit(event, data);
      io.to('role_admin').emit(`complaint:${event}`, { complaintId, ...data });
    }
  } catch (error) {
    logger.error(`Failed to emit complaint update for ${complaintId}:`, error.message);
  }
};

module.exports = {
  notify,
  notifyAdmins,
  emitComplaintUpdate
};

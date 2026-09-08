const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  reopenComplaint,
  closeComplaint,
  submitRating
} = require('../controllers/complaintController');
const { getComments, addComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');
const { validateComplaint } = require('../middleware/validationMiddleware');

// Public/Protected read, protected write
router.route('/')
  .get(getComplaints)
  .post(protect, uploadMultiple, validateComplaint, createComplaint);

router.get('/my', protect, getMyComplaints);

router.route('/:id')
  .get(getComplaintById)
  .put(protect, updateComplaint)
  .delete(protect, deleteComplaint);

// Lifecycle actions
router.post('/:id/reopen', protect, reopenComplaint);
router.post('/:id/close', protect, closeComplaint);
router.post('/:id/rating', protect, submitRating);

// Discussion & Comments
router.route('/:id/comments')
  .get(protect, getComments)
  .post(protect, addComment);

module.exports = router;

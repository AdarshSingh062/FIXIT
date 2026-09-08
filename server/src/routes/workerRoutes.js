const express = require('express');
const router = express.Router();
const {
  getAssignedTasks,
  getTaskById,
  acceptTask,
  rejectTask,
  updateTaskStatus,
  getWorkerStats,
  getWorkHistory
} = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadFields } = require('../middleware/uploadMiddleware');

// All worker routes require authentication and worker role
router.use(protect);
router.use(authorize('worker', 'admin'));

router.get('/tasks', getAssignedTasks);
router.get('/tasks/:id', getTaskById);
router.post('/tasks/:id/accept', acceptTask);
router.post('/tasks/:id/reject', rejectTask);
router.put('/tasks/:id/status', uploadFields, updateTaskStatus);

router.get('/stats', getWorkerStats);
router.get('/history', getWorkHistory);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  assignWorker,
  overridePriority,
  updateComplaintStatus,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getAllWorkers,
  getActivityLogs
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardAnalytics);
router.get('/analytics', getDashboardAnalytics);

// Complaint management
router.post('/complaints/:id/assign', assignWorker);
router.put('/complaints/:id/priority', overridePriority);
router.put('/complaints/:id/status', updateComplaintStatus);

// User & Worker management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.get('/workers', getAllWorkers);

// System Logs
router.get('/activity-logs', getActivityLogs);

module.exports = router;

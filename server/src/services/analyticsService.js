const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Category = require('../models/Category');
const Rating = require('../models/Rating');
const { COMPLAINT_STATUS } = require('../config/constants');

const getAdminDashboardStats = async () => {
  // 1. High-level metric counts
  const totalComplaints = await Complaint.countDocuments();
  const pendingComplaints = await Complaint.countDocuments({ status: COMPLAINT_STATUS.PENDING });
  const underReviewComplaints = await Complaint.countDocuments({ status: COMPLAINT_STATUS.UNDER_REVIEW });
  const assignedComplaints = await Complaint.countDocuments({ status: { $in: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.ACCEPTED] } });
  const inProgressComplaints = await Complaint.countDocuments({ status: COMPLAINT_STATUS.IN_PROGRESS });
  const resolvedComplaints = await Complaint.countDocuments({ status: COMPLAINT_STATUS.RESOLVED });
  const closedComplaints = await Complaint.countDocuments({ status: COMPLAINT_STATUS.CLOSED });
  const reopenedComplaints = await Complaint.countDocuments({ status: COMPLAINT_STATUS.REOPENED });
  const rejectedComplaints = await Complaint.countDocuments({ status: COMPLAINT_STATUS.REJECTED });

  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalWorkers = await User.countDocuments({ role: 'worker' });

  // 2. Calculate resolution rate & average resolution time (hours)
  const resolvedOrClosed = resolvedComplaints + closedComplaints;
  const resolutionPercentage = totalComplaints > 0 ? ((resolvedOrClosed / totalComplaints) * 100).toFixed(1) : 0;

  const resolutionTimeAgg = await Complaint.aggregate([
    {
      $match: {
        status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
        resolvedAt: { $exists: true, $ne: null }
      }
    },
    {
      $project: {
        durationHours: {
          $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgDurationHours: { $avg: '$durationHours' }
      }
    }
  ]);

  const avgResolutionHours = resolutionTimeAgg.length > 0 ? (resolutionTimeAgg[0].avgDurationHours || 0).toFixed(1) : 0;

  // 3. Category Breakdown Aggregation
  const categoryStats = await Complaint.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [{ $in: ['$status', [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED]] }, 1, 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $in: ['$status', [COMPLAINT_STATUS.PENDING, COMPLAINT_STATUS.UNDER_REVIEW]] }, 1, 0]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: {
        path: '$categoryInfo',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        name: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
        color: { $ifNull: ['$categoryInfo.color', '#3b82f6'] },
        count: 1,
        resolved: 1,
        pending: 1
      }
    },
    { $sort: { count: -1 } }
  ]);

  // 4. Status Breakdown Aggregation
  const statusStats = await Complaint.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // 5. Priority Breakdown Aggregation
  const priorityStats = await Complaint.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // 6. Monthly Trend (Past 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyTrends = await Complaint.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        reported: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [{ $in: ['$status', [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED]] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' }
              ]
            }
          ]
        },
        reported: 1,
        resolved: 1
      }
    }
  ]);

  // 7. Worker Performance Leaderboard
  const workerLeaderboard = await User.aggregate([
    { $match: { role: 'worker', status: 'active' } },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        avatar: 1,
        department: '$workerDetails.department',
        specialization: '$workerDetails.specialization',
        completedTasks: '$workerDetails.completedTasks',
        activeTasks: '$workerDetails.activeTasks',
        avgRating: '$workerDetails.avgRating',
        totalRatings: '$workerDetails.totalRatings'
      }
    },
    { $sort: { completedTasks: -1, avgRating: -1 } },
    { $limit: 10 }
  ]);

  return {
    metrics: {
      totalComplaints,
      pendingComplaints,
      underReviewComplaints,
      assignedComplaints,
      inProgressComplaints,
      resolvedComplaints,
      closedComplaints,
      reopenedComplaints,
      rejectedComplaints,
      totalUsers,
      totalWorkers,
      resolutionPercentage: Number(resolutionPercentage),
      avgResolutionHours: Number(avgResolutionHours)
    },
    charts: {
      byCategory: categoryStats,
      byStatus: statusStats.map((item) => ({ status: item._id, count: item.count })),
      byPriority: priorityStats.map((item) => ({ priority: item._id, count: item.count })),
      monthlyTrends
    },
    workerLeaderboard
  };
};

const getWorkerPerformanceStats = async (workerId) => {
  const activeTasks = await Complaint.countDocuments({
    assignedWorker: workerId,
    status: { $in: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.ACCEPTED, COMPLAINT_STATUS.IN_PROGRESS] }
  });

  const completedTasks = await Complaint.countDocuments({
    assignedWorker: workerId,
    status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] }
  });

  const ratings = await Rating.find({ worker: workerId });
  const totalRatings = ratings.length;
  const avgRating = totalRatings > 0
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1)
    : '5.0';

  const resolutionTimeAgg = await Complaint.aggregate([
    {
      $match: {
        assignedWorker: workerId,
        status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
        resolvedAt: { $exists: true, $ne: null }
      }
    },
    {
      $project: {
        durationHours: {
          $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgDurationHours: { $avg: '$durationHours' }
      }
    }
  ]);

  const avgResolutionHours = resolutionTimeAgg.length > 0
    ? (resolutionTimeAgg[0].avgDurationHours || 0).toFixed(1)
    : 0;

  return {
    activeTasks,
    completedTasks,
    totalRatings,
    avgRating: Number(avgRating),
    avgResolutionHours: Number(avgResolutionHours),
    recentReviews: ratings.slice(-5)
  };
};

module.exports = {
  getAdminDashboardStats,
  getWorkerPerformanceStats
};

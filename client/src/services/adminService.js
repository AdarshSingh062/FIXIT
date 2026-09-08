import api from './api';

export const adminService = {
  getDashboardAnalytics: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  assignWorker: async (complaintId, workerId, note = '') => {
    const response = await api.post(`/admin/complaints/${complaintId}/assign`, { workerId, note });
    return response.data;
  },

  overridePriority: async (complaintId, priority, reason) => {
    const response = await api.put(`/admin/complaints/${complaintId}/priority`, { priority, reason });
    return response.data;
  },

  updateComplaintStatus: async (complaintId, status, note = '') => {
    const response = await api.put(`/admin/complaints/${complaintId}/status`, { status, note });
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  updateUserRole: async (userId, data) => {
    const response = await api.put(`/admin/users/${userId}/role`, data);
    return response.data;
  },

  getAllWorkers: async (params = {}) => {
    const response = await api.get('/admin/workers', { params });
    return response.data;
  },

  getActivityLogs: async (params = {}) => {
    const response = await api.get('/admin/activity-logs', { params });
    return response.data;
  }
};

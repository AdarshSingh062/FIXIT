import api from './api';

export const workerService = {
  getAssignedTasks: async (params = {}) => {
    const response = await api.get('/workers/tasks', { params });
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await api.get(`/workers/tasks/${id}`);
    return response.data;
  },

  acceptTask: async (id) => {
    const response = await api.post(`/workers/tasks/${id}/accept`);
    return response.data;
  },

  rejectTask: async (id, reason) => {
    const response = await api.post(`/workers/tasks/${id}/reject`, { reason });
    return response.data;
  },

  updateTaskStatus: async (id, formData) => {
    const isMultipart = formData instanceof FormData;
    const response = await api.put(`/workers/tasks/${id}/status`, formData, {
      headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  },

  getWorkerStats: async () => {
    const response = await api.get('/workers/stats');
    return response.data;
  },

  getWorkHistory: async (params = {}) => {
    const response = await api.get('/workers/history', { params });
    return response.data;
  }
};

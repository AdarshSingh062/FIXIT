import api from './api';

export const complaintService = {
  getComplaints: async (params = {}) => {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  getMyComplaints: async (params = {}) => {
    const response = await api.get('/complaints/my', { params });
    return response.data;
  },

  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  createComplaint: async (formData) => {
    // If formData is an instance of FormData, send with multipart headers
    const isMultipart = formData instanceof FormData;
    const response = await api.post('/complaints', formData, {
      headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  },

  updateComplaint: async (id, data) => {
    const response = await api.put(`/complaints/${id}`, data);
    return response.data;
  },

  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },

  reopenComplaint: async (id, reason) => {
    const response = await api.post(`/complaints/${id}/reopen`, { reason });
    return response.data;
  },

  closeComplaint: async (id) => {
    const response = await api.post(`/complaints/${id}/close`);
    return response.data;
  },

  submitRating: async (id, ratingData) => {
    const response = await api.post(`/complaints/${id}/rating`, ratingData);
    return response.data;
  },

  getComments: async (complaintId) => {
    const response = await api.get(`/complaints/${complaintId}/comments`);
    return response.data;
  },

  addComment: async (complaintId, commentData) => {
    const response = await api.post(`/complaints/${complaintId}/comments`, commentData);
    return response.data;
  }
};

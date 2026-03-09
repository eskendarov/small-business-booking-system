import apiClient from './apiClient';

export const appointmentsApi = {
  getAll: () => apiClient.get('/appointments'),

  getMy: () => apiClient.get('/appointments/my'),

  getById: (id) => apiClient.get(`/appointments/${id}`),

  create: (data) => apiClient.post('/appointments', data),

  updateStatus: (id, status) =>
    apiClient.put(`/appointments/${id}/status`, null, { params: { status } }),

  delete: (id) => apiClient.delete(`/appointments/${id}`),
};

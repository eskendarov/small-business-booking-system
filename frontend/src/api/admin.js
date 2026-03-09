import apiClient from './apiClient';

export const adminApi = {
  getAllAppointments: () => apiClient.get('/admin/appointments'),

  getUsers: () => apiClient.get('/admin/users'),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getUserServices: (userId) => apiClient.get(`/admin/users/${userId}/services`),
  deleteService: (id) => apiClient.delete(`/admin/services/${id}`),

  getCustomers: () => apiClient.get('/admin/customers'),
  deleteCustomer: (id) => apiClient.delete(`/admin/customers/${id}`),

  deleteAppointment: (id) => apiClient.delete(`/admin/appointments/${id}`),
};

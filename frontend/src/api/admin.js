import apiClient from './apiClient';

export const adminApi = {
  getAllAppointments: () => apiClient.get('/admin/appointments'),
  getUsers: () => apiClient.get('/admin/users'),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getCustomers: () => apiClient.get('/admin/customers'),
  deleteCustomer: (id) => apiClient.delete(`/admin/customers/${id}`),
};

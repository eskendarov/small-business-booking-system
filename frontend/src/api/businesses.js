import apiClient from './apiClient';

export const businessesApi = {
  getAll: () => apiClient.get('/businesses'),
  getMyBusiness: () => apiClient.get('/businesses/my'),
  getServices: (businessId) => apiClient.get(`/businesses/${businessId}/services`),
  addService: (data) => apiClient.post('/businesses/my/services', data),
  deleteService: (serviceId) => apiClient.delete(`/businesses/my/services/${serviceId}`),
};

import apiClient from './apiClient';

export const businessesApi = {
  getAll: () => apiClient.get('/businesses'),
  getServices: (businessId) => apiClient.get(`/businesses/${businessId}/services`),
};

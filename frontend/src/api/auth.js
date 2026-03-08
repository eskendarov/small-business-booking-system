import apiClient from './apiClient';

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),

  register: (data) => apiClient.post('/auth/register', data),
};

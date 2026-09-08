import axios from 'axios';

export const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_GATEWAY_URL || '') + '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s timeout for AI RCA calls
});

// Response interceptor for unified error logging & extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);

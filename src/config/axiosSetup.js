import axios from 'axios';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/auth';
    }
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data?.error || error.message);
    }
    return Promise.reject(error);
  }
);

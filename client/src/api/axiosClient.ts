import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT Access Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cinebook_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic error extraction
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized token refresh if needed
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('cinebook_refresh_token');
      if (refreshToken) {
        originalRequest._retry = true;
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem('cinebook_access_token', accessToken);
          localStorage.setItem('cinebook_refresh_token', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('cinebook_access_token');
          localStorage.removeItem('cinebook_refresh_token');
          localStorage.removeItem('cinebook_user');
        }
      }
    }

    const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra';
    return Promise.reject(new Error(message));
  }
);

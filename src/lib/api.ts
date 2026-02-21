import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010/api/v1';

// Removed console.warn to prevent information disclosure in production

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('admin_refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const data = response.data.data || response.data;

          if (data.accessToken) {
            localStorage.setItem('admin_token', data.accessToken);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            
            isRefreshing = false;
            onRefreshed(data.accessToken);

            originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          isRefreshing = false;
          // Token refresh failed, redirect to login
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');
          window.dispatchEvent(new CustomEvent('unauthorized'));
          return Promise.reject(refreshError);
        }
      } else {
        isRefreshing = false;
        // No refresh token, redirect to login
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        window.dispatchEvent(new CustomEvent('unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

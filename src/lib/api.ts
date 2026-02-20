import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010/api/v1';

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not defined in environment variables. Defaulting to localhost.');
}

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

// Interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('admin_refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (response.data.accessToken) {
            localStorage.setItem('admin_token', response.data.accessToken);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Token refresh failed, redirect to login
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');
          window.dispatchEvent(new CustomEvent('unauthorized'));
          return Promise.reject(refreshError);
        }
      } else {
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

// Interceptor to handle common errors (e.g., unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // This interceptor seems redundant with the one above, but let's ensure it handles non-refresh 401s if the above one didn't catch it
    // actually the above one handles ALL 401s.
    // The previous code had two interceptors doing similar things. I should probably merge them or remove the second one if it's duplicate.
    // But to be safe and minimal, I will just ensure this one also dispatches CustomEvent and clears storage.
    
    if (error.response?.status === 401 && !error.config._retry) {
       // If the previous interceptor didn't handle it (e.g. if _retry was somehow set but failed?)
       // Or if this is a second pass.
       // The previous interceptor sets _retry = true.
       // If the refresh failed, it rejected the promise.
       // Does it fall through to here? No, it rejects.
    }
    
    // If we are here and it is 401, it means it wasn't handled or it's a final failure
    if (error.response?.status === 401) {
         localStorage.removeItem('admin_token');
         localStorage.removeItem('admin_refresh_token');
         localStorage.removeItem('admin_user');
         window.dispatchEvent(new CustomEvent('unauthorized'));
    }

    return Promise.reject(error);
  }
);

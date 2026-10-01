import axios, { AxiosError } from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach access token if and only if a valid token exists
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sports_access_token');
      if (token && token.trim() && token !== 'undefined' && token !== 'null' && config.headers) {
        config.headers.Authorization = `Bearer ${token.trim()}`;
      } else if (config.headers && config.headers.Authorization) {
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle token refresh and normalized errors without hard redirects
api.interceptors.response.use(
  (response) => {
    // Backend standard envelope is { success, statusCode, data, meta, timestamp }
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;

    // Handle 401 Unauthorized (Token Expiration & Refresh)
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('sports_refresh_token') : null;
        if (refreshToken && refreshToken.trim() && refreshToken !== 'undefined' && refreshToken !== 'null') {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true });
          const newTokens = res.data?.data?.tokens || res.data?.tokens;
          if (newTokens?.accessToken) {
            localStorage.setItem('sports_access_token', newTokens.accessToken);
            if (newTokens.refreshToken) {
              localStorage.setItem('sports_refresh_token', newTokens.refreshToken);
            }
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshErr) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sports_access_token');
          localStorage.removeItem('sports_refresh_token');
        }
      }
    }

    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const status = error.response?.status || 500;
    const customError = new Error(typeof message === 'object' ? JSON.stringify(message) : message);
    (customError as any).status = status;
    (customError as any).details = error.response?.data?.details;
    (customError as any).correlationId = error.response?.data?.correlationId;

    return Promise.reject(customError);
  },
);

import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];
let lastRateLimitNoticeAt = 0;

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

const isAuthPath = (url = '') => {
  const normalized = url.toLowerCase();
  return (
    normalized.includes('/user/login')
    || normalized.includes('/user/refresh')
    || normalized.includes('/user/revoke')
  );
};

axiosClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;

    if (status === 429) {
      error.message = 'Demasiadas solicitudes, intenta mas tarde.';
      const now = Date.now();
      if (now - lastRateLimitNoticeAt > 3000) {
        lastRateLimitNoticeAt = now;
        window.alert('Demasiadas solicitudes, intenta mas tarde.');
      }
      return Promise.reject(error);
    }

    if (status !== 401 || originalRequest._retry || isAuthPath(originalRequest.url)) {
      return Promise.reject(error);
    }

    const currentRefreshToken = tokenStorage.getRefreshToken();
    if (!currentRefreshToken) {
      tokenStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(`${BASE_URL}/User/refresh`, {
        refreshToken: currentRefreshToken,
      });

      const tokens = refreshResponse?.data?.data;
      const nextAccessToken = tokens?.accessToken;
      const nextRefreshToken = tokens?.refreshToken;

      if (!nextAccessToken || !nextRefreshToken) {
        throw new Error('No se recibieron tokens al refrescar la sesion.');
      }

      tokenStorage.setAccessToken(nextAccessToken);
      tokenStorage.setRefreshToken(nextRefreshToken);
      processQueue(null, nextAccessToken);

      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStorage.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;
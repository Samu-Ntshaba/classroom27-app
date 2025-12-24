import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { authStore } from '../store/auth.store';
import { storage } from './storage.service';

export const API_BASE_URL = 'http://localhost:4000/api';

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

const refreshTokens = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken } = authStore.getState();
      const stored = refreshToken ?? (await storage.getTokens()).refreshToken;
      if (!stored) {
        return null;
      }

      try {
        const response = await refreshClient.post('/auth/refresh', { refreshToken: stored });
        const access = response.data?.accessToken ?? response.data?.access_token;
        const refresh = response.data?.refreshToken ?? response.data?.refresh_token ?? stored;
        if (access && refresh) {
          await storage.setTokens(access, refresh);
          authStore.setState({ accessToken: access, refreshToken: refresh });
          return access;
        }
        return null;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const { accessToken } = authStore.getState();

  if (accessToken) {
    // ✅ Axios v1-safe: set header without replacing headers object
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryConfig | undefined;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await refreshTokens();
      if (newAccessToken) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };
        return api(originalRequest);
      }

      authStore.getState().clear();
      await storage.clearTokens();
    }

    return Promise.reject(error);
  }
);

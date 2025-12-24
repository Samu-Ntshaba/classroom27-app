import { api } from './api';
import { authStore, UserProfile } from '../store/auth.store';
import { storage } from './storage.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const extractTokens = (data: any): AuthTokens | null => {
  const accessToken = data?.accessToken ?? data?.access_token ?? data?.token;
  const refreshToken = data?.refreshToken ?? data?.refresh_token ?? data?.refresh;
  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }
  return null;
};

const extractUser = (data: any): UserProfile | null => {
  if (!data) return null;
  return data.user ?? data;
};

export const authService = {
  async login(payload: { email: string; password: string }) {
    const response = await api.post('/auth/login', payload);
    const tokens = extractTokens(response.data);
    if (tokens) {
      await storage.setTokens(tokens.accessToken, tokens.refreshToken);
      authStore.setState({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    }
    const me = await this.getMe();
    authStore.setState({ user: me });
    return me;
  },
  async register(payload: { name: string; email: string; password: string }) {
    const response = await api.post('/auth/register', payload);
    return extractUser(response.data);
  },
  async logout() {
    const { refreshToken } = authStore.getState();
    try {
      await api.post('/auth/logout', refreshToken ? { refreshToken } : undefined);
    } catch {
      // ignore
    }
    authStore.getState().clear();
    await storage.clearTokens();
  },
  async getMe() {
    const response = await api.get('/auth/me');
    return extractUser(response.data);
  },
  async updateMe(payload: { name?: string }) {
    const response = await api.patch('/auth/me', payload);
    const user = extractUser(response.data);
    authStore.setState({ user });
    return user;
  },
  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    const response = await api.post('/auth/change-password', payload);
    return response.data;
  },
  async requestVerification(payload: { email: string }) {
    const response = await api.post('/auth/request-verification', payload);
    return response.data;
  },
  async verifyEmail(payload: { token: string }) {
    const response = await api.post('/auth/verify-email', payload);
    return response.data;
  },
  async verifyEmailByQuery(token: string) {
    const response = await api.get('/auth/verify-email', { params: { token } });
    return response.data;
  },
  async requestPasswordReset(payload: { email: string }) {
    try {
      const response = await api.post('/auth/request-password-reset', payload);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const response = await api.post('/auth/forgot-password', payload);
        return response.data;
      }
      throw error;
    }
  },
  async resetPassword(payload: { token: string; password: string }) {
    const response = await api.post('/auth/reset-password', payload);
    return response.data;
  },
};

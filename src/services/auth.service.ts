import { authStore, UserProfile } from '../store/auth.store';
import { api } from './api';
import { userService } from './user.service';
import { storage } from './storage.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const extractTokens = (data: any): AuthTokens | null => {
  const accessToken =
    data?.accessToken ?? data?.access_token ?? data?.token ?? data?.data?.accessToken;

  const refreshToken =
    data?.refreshToken ?? data?.refresh_token ?? data?.refresh ?? data?.data?.refreshToken;

  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken };
};

const extractUser = (data: any): UserProfile | null => {
  if (!data) return null;

  // common shapes: { user: {...} } OR { data: { user: {...} } } OR user object directly
  const user = data?.user ?? data?.data?.user ?? data;

  if (!user || typeof user !== 'object') return null;

  // optional: minimal guard to avoid storing nonsense
  if (!('email' in user) && !('id' in user)) return user as UserProfile;

  return user as UserProfile;
};

export const authService = {
  async login(payload: { email: string; password: string }) {
    const response = await api.post('/auth/login', payload);
    const tokens = extractTokens(response.data);

    // ✅ HARD FAIL if no tokens (prevents /me call without Authorization header)
    if (!tokens) {
      throw new Error('Login did not return accessToken/refreshToken');
    }

    // ✅ persist first
    await storage.setTokens(tokens.accessToken, tokens.refreshToken);

    // ✅ set store BEFORE calling /me (so interceptor can attach Authorization)
    authStore.setState({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    let me = null;
    try {
      me = await userService.getMe();
    } catch {
      const meRes = await api.get('/auth/me');
      me = extractUser(meRes.data);
    }

    if (!me) {
      throw new Error('Could not load user profile from /me');
    }

    authStore.setState({ user: me });
    return me;
  },

  async register(payload: { name: string; email: string; password: string }) {
    const response = await api.post('/auth/register', payload);
    // Register may return {user} or message only
    const user = extractUser(response.data);

    return user; // can be null if backend returns only a message; UI should handle that
  },

  async logout() {
    const { refreshToken } = authStore.getState();

    try {
      // ✅ always send an object (avoid undefined body edge cases)
      await api.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch {
      // ignore server errors
    } finally {
      // ✅ always clear local state no matter what
      authStore.getState().clear();
      await storage.clearTokens();
    }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    const user = extractUser(response.data);

    if (!user) {
      throw new Error('Invalid /me response');
    }

    return user;
  },

  async updateMe(payload: { name?: string }) {
    const response = await api.patch('/auth/me', payload);
    const user = extractUser(response.data);

    if (!user) {
      throw new Error('Invalid updateMe response');
    }

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
    // If backend aliases exist, prefer trying the primary route first
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

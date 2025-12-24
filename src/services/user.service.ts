import { api } from './api';

export interface UserSummary {
  id: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface FollowPayload {
  targetUserId: string;
  [key: string]: any;
}

const normalizeUser = (data: any): UserSummary => {
  if (!data) return { id: '' };
  return {
    id: data.id ?? data._id ?? data.userId ?? '',
    name: data.name,
    email: data.email,
    avatarUrl: data.avatarUrl ?? data.avatar ?? data.photoUrl ?? data.photo,
    followersCount: data.followersCount ?? data.followers?.length,
    followingCount: data.followingCount ?? data.following?.length,
    isFollowing: data.isFollowing ?? data.following,
  };
};

const normalizeUsers = (data: any): UserSummary[] => {
  if (Array.isArray(data)) {
    return data.map(normalizeUser).filter((user) => user.id);
  }
  return [];
};

export const userService = {
  async getMe() {
    const response = await api.get('/users/me');
    return normalizeUser(response.data?.user ?? response.data);
  },
  async getSuggested(): Promise<UserSummary[]> {
    const response = await api.get('/users/suggested');
    return normalizeUsers(response.data?.users ?? response.data);
  },
  async getProfile(userId: string) {
    const response = await api.get(`/users/${userId}`);
    return normalizeUser(response.data?.user ?? response.data);
  },
  async listUsers() {
    const response = await api.get('/users');
    return normalizeUsers(response.data?.users ?? response.data);
  },
  async updateProfile(userId: string, payload: Record<string, any>) {
    const response = await api.patch(`/users/${userId}`, payload);
    return normalizeUser(response.data?.user ?? response.data);
  },
  async uploadAvatar(userId: string, file: { uri: string; name?: string; type?: string }) {
    const form = new FormData();
    form.append('avatar', {
      uri: file.uri,
      name: file.name ?? 'avatar.jpg',
      type: file.type ?? 'image/jpeg',
    } as any);
    const response = await api.post(`/users/${userId}/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeUser(response.data?.user ?? response.data);
  },
  async getFollowers(userId: string) {
    const response = await api.get(`/users/${userId}/followers`);
    return normalizeUsers(response.data?.followers ?? response.data);
  },
  async getFollowing(userId: string) {
    const response = await api.get(`/users/${userId}/following`);
    return normalizeUsers(response.data?.following ?? response.data);
  },
  async followUser(payload: FollowPayload) {
    const response = await api.post('/users/follow', payload);
    return response.data;
  },
  async unfollowUser(targetUserId: string) {
    const response = await api.delete(`/users/follow/${targetUserId}`);
    return response.data;
  },
};

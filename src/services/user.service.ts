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

const unwrapData = (responseData: any) => responseData?.data ?? responseData;

export const userService = {
  async getMe() {
    const response = await api.get('/users/me');
    const data = unwrapData(response.data);
    return normalizeUser(data?.user ?? data);
  },
  async getSuggested(): Promise<UserSummary[]> {
    const response = await api.get('/users/suggested');
    const data = unwrapData(response.data);
    return normalizeUsers(data?.items ?? data?.users ?? data);
  },
  async getProfile(userId: string) {
    const response = await api.get(`/users/${userId}`);
    const data = unwrapData(response.data);
    return normalizeUser(data?.user ?? data);
  },
  async listUsers() {
    const response = await api.get('/users');
    const data = unwrapData(response.data);
    return normalizeUsers(data?.items ?? data?.users ?? data);
  },
  async updateProfile(userId: string, payload: Record<string, any>) {
    const response = await api.patch(`/users/${userId}`, payload);
    const data = unwrapData(response.data);
    return normalizeUser(data?.user ?? data);
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
    const data = unwrapData(response.data);
    return normalizeUser(data?.user ?? data);
  },
  async getFollowers(userId: string) {
    const response = await api.get(`/users/${userId}/followers`);
    const data = unwrapData(response.data);
    return normalizeUsers(data?.items ?? data?.followers ?? data);
  },
  async getFollowing(userId: string) {
    const response = await api.get(`/users/${userId}/following`);
    const data = unwrapData(response.data);
    return normalizeUsers(data?.items ?? data?.following ?? data);
  },
  async followUser(payload: FollowPayload) {
    const response = await api.post('/users/follow', payload);
    const data = unwrapData(response.data);
    return normalizeUser(data?.user ?? data);
  },
  async unfollowUser(targetUserId: string) {
    const response = await api.delete(`/users/follow/${targetUserId}`);
    if (response.status === 204) {
      return true;
    }
    const data = unwrapData(response.data);
    return data?.success ?? true;
  },
};

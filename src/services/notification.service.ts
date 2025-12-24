import { api } from './api';

export interface NotificationItem {
  id: string;
  title?: string;
  body?: string;
  createdAt?: string;
  isRead?: boolean;
  type?: string;
}

export interface NotificationSettings {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  [key: string]: any;
}

const normalizeNotification = (data: any): NotificationItem => {
  if (!data) return { id: '' };
  return {
    id: data.id ?? data._id ?? '',
    title: data.title ?? data.subject,
    body: data.body ?? data.message,
    createdAt: data.createdAt ?? data.created_at,
    isRead: data.isRead ?? data.read ?? data.is_read,
    type: data.type,
  };
};

const normalizeNotifications = (data: any): NotificationItem[] => {
  if (Array.isArray(data)) {
    return data.map(normalizeNotification).filter((item) => item.id);
  }
  return [];
};

export const notificationService = {
  async list() {
    const response = await api.get('/notifications');
    return normalizeNotifications(response.data?.notifications ?? response.data);
  },
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data?.count ?? response.data?.unreadCount ?? 0;
  },
  async markRead(id: string) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
  async markAllRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
  async getSettings(): Promise<NotificationSettings> {
    const response = await api.get('/notifications/settings');
    return response.data?.settings ?? response.data ?? {};
  },
  async updateSettings(payload: NotificationSettings) {
    const response = await api.patch('/notifications/settings', payload);
    return response.data?.settings ?? response.data ?? {};
  },
};

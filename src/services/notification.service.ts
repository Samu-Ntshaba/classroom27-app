import { api } from './api';

export interface NotificationItem {
  id: string;
  title?: string;
  body?: string;
  createdAt?: string;
  isRead?: boolean;
  type?: string;
  actionUrl?: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
}

export interface NotificationSettings {
  emailOnFollow?: boolean;
  emailOnChatRequest?: boolean;
  emailOnChatRequestAccepted?: boolean;
  emailOnLike?: boolean;
  emailOnComment?: boolean;
  emailOnMessage?: boolean;
}

export interface NotificationSocketHandlers {
  onNotification?: (notification: NotificationItem) => void;
  onUnreadCount?: (count: number) => void;
  onClose?: () => void;
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
    actionUrl: data.actionUrl ?? data.action_url,
    actorId: data.actorId ?? data.actor_id,
    entityType: data.entityType ?? data.entity_type,
    entityId: data.entityId ?? data.entity_id,
  };
};

const normalizeNotifications = (data: any): NotificationItem[] => {
  if (Array.isArray(data)) {
    return data.map(normalizeNotification).filter((item) => item.id);
  }
  return [];
};

const unwrapData = (responseData: any) => responseData?.data ?? responseData;

const buildSocketUrl = (token: string) => {
  const baseUrl = new URL(api.defaults.baseURL ?? '');
  const protocol = baseUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${baseUrl.host}?token=${encodeURIComponent(token)}`;
};

export const notificationService = {
  async list() {
    const response = await api.get('/notifications');
    const data = unwrapData(response.data);
    return normalizeNotifications(data?.items ?? data?.notifications ?? data);
  },
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    const data = unwrapData(response.data);
    return data?.count ?? data?.unreadCount ?? 0;
  },
  async markRead(id: string) {
    const response = await api.patch(`/notifications/${id}/read`);
    return unwrapData(response.data);
  },
  async markAllRead() {
    const response = await api.patch('/notifications/read-all');
    return unwrapData(response.data);
  },
  async getSettings(): Promise<NotificationSettings> {
    const response = await api.get('/notifications/settings');
    const data = unwrapData(response.data);
    return data?.settings ?? data ?? {};
  },
  async updateSettings(payload: NotificationSettings) {
    const response = await api.patch('/notifications/settings', payload);
    const data = unwrapData(response.data);
    return data?.settings ?? data ?? {};
  },
  connectSocket(token: string, handlers: NotificationSocketHandlers) {
    const socket = new WebSocket(buildSocketUrl(token), token);

    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.event === 'notification:new') {
          const notification = normalizeNotification(data.payload);
          if (notification.id) {
            handlers.onNotification?.(notification);
          }
        }
        if (data?.event === 'notification:unreadCount') {
          handlers.onUnreadCount?.(data.payload?.count ?? 0);
        }
      } catch {
        // ignore malformed frames
      }
    });

    socket.addEventListener('close', () => handlers.onClose?.());
    socket.addEventListener('error', () => handlers.onClose?.());

    return socket;
  },
};

import { api } from './api';

export interface ClassroomHost {
  id?: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface Classroom {
  id: string;
  title: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  coverImageUrl?: string | null;
  subject?: string | null;
  tags?: string[];
  startsAt?: string | null;
  endsAt?: string | null;
  frequency?: string | null;
  status?: string | null;
  priceType?: 'FREE' | 'ONCE_OFF' | 'SUBSCRIPTION' | 'free' | 'paid' | string | null;
  price?: number | null;
  subscriptionType?: string | null;
  maxSeats?: number | null;
  minAge?: number | null;
  isLocked?: boolean;
  isAlwaysLiveDemo?: boolean;
  canGoLive?: boolean;
  canPublish?: boolean;
  shareUrl?: string | null;
  host?: ClassroomHost | null;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface CreateClassroomPayload {
  title: string;
  shortDescription?: string;
  tags?: string[];
  coverImageUrl?: string;
  priceType: 'FREE' | 'ONCE_OFF' | 'SUBSCRIPTION';
  price?: number;
  subscriptionType?: string;
  startsAt?: string;
  endsAt?: string;
  frequency?: string;
  maxSeats?: number;
}

const unwrapData = (responseData: any) => responseData?.data ?? responseData;

const normalizeHost = (data: any): ClassroomHost | null => {
  if (!data) return null;
  return {
    id: data.id ?? data._id ?? data.userId ?? undefined,
    name: data.name ?? data.fullName ?? data.username ?? null,
    avatarUrl: data.avatarUrl ?? data.avatar ?? data.photoUrl ?? null,
  };
};

const normalizeClassroom = (data: any): Classroom | null => {
  if (!data) return null;
  const id = data.id ?? data._id ?? data.classroomId ?? '';
  if (!id) return null;

  const rawPriceType = data.priceType ?? data.accessType ?? null;
  const normalizedPriceType =
    typeof rawPriceType === 'string' ? rawPriceType.toUpperCase().replace('-', '_') : rawPriceType;
  const allowedActions = Array.isArray(data.allowedActions) ? data.allowedActions : [];

  return {
    id,
    title: data.title ?? data.name ?? 'Untitled classroom',
    shortDescription: data.shortDescription ?? data.summary ?? null,
    fullDescription: data.fullDescription ?? data.description ?? null,
    coverImageUrl: data.coverImageUrl ?? data.coverImage ?? data.imageUrl ?? null,
    subject: data.subject ?? null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    startsAt: data.startsAt ?? data.startTime ?? null,
    endsAt: data.endsAt ?? data.endTime ?? null,
    frequency: data.frequency ?? null,
    status: data.status ?? null,
    priceType: normalizedPriceType ?? null,
    price: typeof data.price === 'number' ? data.price : data.price ? Number(data.price) : null,
    subscriptionType: data.subscriptionType ?? null,
    maxSeats: data.maxSeats ?? data.capacity ?? null,
    minAge: data.minAge ?? null,
    isLocked: Boolean(data.isLocked ?? data.locked),
    isAlwaysLiveDemo: Boolean(data.isAlwaysLiveDemo ?? data.alwaysLive),
    canGoLive: Boolean(data.canGoLive ?? data.can_go_live ?? allowedActions.includes('go-live')),
    canPublish: Boolean(data.canPublish ?? data.can_publish ?? allowedActions.includes('publish')),
    shareUrl: data.shareUrl ?? null,
    host: normalizeHost(data.host ?? data.teacher ?? data.creator ?? data.owner ?? data.user),
    isLiked: Boolean(data.isLiked ?? data.liked),
    isSaved: Boolean(data.isSaved ?? data.saved),
  };
};

const normalizeClassrooms = (data: any): Classroom[] => {
  if (Array.isArray(data)) {
    return data.map(normalizeClassroom).filter(Boolean) as Classroom[];
  }
  return [];
};

export const classroomsService = {
  async listClassrooms(params?: { type?: string }) {
    const response = await api.get('/classrooms', { params });
    const data = unwrapData(response.data);
    return normalizeClassrooms(data?.items ?? data?.classrooms ?? data);
  },
  async getClassroom(classroomId: string) {
    const response = await api.get(`/classrooms/${classroomId}`);
    const data = unwrapData(response.data);
    return normalizeClassroom(data?.classroom ?? data);
  },
  async getMine() {
    const response = await api.get('/classrooms/mine');
    const data = unwrapData(response.data);
    return normalizeClassrooms(data?.items ?? data?.classrooms ?? data);
  },
  async createClassroom(payload: CreateClassroomPayload) {
    const response = await api.post('/classrooms', payload);
    const data = unwrapData(response.data);
    return normalizeClassroom(data?.classroom ?? data);
  },
  async updateClassroom(classroomId: string, payload: Record<string, any>) {
    const response = await api.patch(`/classrooms/${classroomId}`, payload);
    const data = unwrapData(response.data);
    return normalizeClassroom(data?.classroom ?? data);
  },
  async deleteClassroom(classroomId: string) {
    const response = await api.delete(`/classrooms/${classroomId}`);
    return response.status === 204;
  },
  async toggleLike(classroomId: string) {
    const response = await api.post(`/classrooms/${classroomId}/like`);
    const data = unwrapData(response.data);
    return data?.liked ?? data?.isLiked ?? data;
  },
  async toggleSave(classroomId: string) {
    const response = await api.post(`/classrooms/${classroomId}/save`);
    const data = unwrapData(response.data);
    return data?.saved ?? data?.isSaved ?? data;
  },
  async subscribe(classroomId: string) {
    const response = await api.post(`/classrooms/${classroomId}/subscribe`);
    const data = unwrapData(response.data);
    return data;
  },
  async publishClassroom(classroomId: string) {
    const response = await api.post(`/classrooms/${classroomId}/publish`);
    const data = unwrapData(response.data);
    return normalizeClassroom(data?.classroom ?? data);
  },
  async goLiveClassroom(classroomId: string) {
    const response = await api.post(`/classrooms/${classroomId}/go-live`);
    const data = unwrapData(response.data);
    return normalizeClassroom(data?.classroom ?? data);
  },
  async endClassroom(classroomId: string) {
    const response = await api.post(`/classrooms/${classroomId}/end`);
    const data = unwrapData(response.data);
    return normalizeClassroom(data?.classroom ?? data);
  },
  async uploadCover(file: { uri: string; name?: string; type?: string }) {
    const form = new FormData();
    form.append('file', {
      uri: file.uri,
      name: file.name ?? 'classroom.jpg',
      type: file.type ?? 'image/jpeg',
    } as any);
    const response = await api.post('/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = unwrapData(response.data);
    return data?.url ?? data?.fileUrl ?? data?.location ?? data?.path ?? data;
  },
};

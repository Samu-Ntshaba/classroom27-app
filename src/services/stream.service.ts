import { api } from './api';

interface StreamUser {
  id: string;
  name: string;
  image: string | null;
}

export interface StreamBootstrapResponse {
  apiKey: string;
  callId: string;
  token: string;
  user: StreamUser;
  mode: 'host' | 'participant';
  permissions: {
    canPublishAudio: boolean;
    canPublishVideo: boolean;
    canScreenShare: boolean;
  };
}

export interface StreamTokenResponse {
  apiKey: string;
  token: string;
  user: StreamUser;
}

export const streamService = {
  getStreamToken: async () => {
    const response = await api.get<StreamTokenResponse>('/auth/stream/token');
    return response.data;
  },
  bootstrapLiveClassroom: async (payload: { classroomId: string; mode: 'host' | 'participant' }) => {
    const response = await api.post<StreamBootstrapResponse>('/auth/stream/live/bootstrap', payload);
    return response.data;
  },
};

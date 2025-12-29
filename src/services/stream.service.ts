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

const unwrapData = (responseData: any) => responseData?.data ?? responseData;

const normalizeUser = (data: any): StreamUser => ({
  id: String(data?.id ?? data?.userId ?? data?.user_id ?? data?._id ?? ''),
  name: data?.name ?? data?.fullName ?? data?.username ?? '',
  image: data?.image ?? data?.photoUrl ?? data?.avatar ?? null,
});

const normalizePermissions = (data: any) => ({
  canPublishAudio: Boolean(
    data?.canPublishAudio ?? data?.can_publish_audio ?? data?.publishAudio ?? data?.publish_audio
  ),
  canPublishVideo: Boolean(
    data?.canPublishVideo ?? data?.can_publish_video ?? data?.publishVideo ?? data?.publish_video
  ),
  canScreenShare: Boolean(
    data?.canScreenShare ?? data?.can_screen_share ?? data?.screenShare ?? data?.screen_share
  ),
});

const normalizeBootstrap = (data: any): StreamBootstrapResponse => ({
  apiKey: data?.apiKey ?? data?.api_key ?? '',
  callId: String(data?.callId ?? data?.call_id ?? ''),
  token: data?.token ?? '',
  user: normalizeUser(data?.user ?? data?.user_info ?? data?.member ?? data?.participant),
  mode: data?.mode === 'host' ? 'host' : 'participant',
  permissions: normalizePermissions(data?.permissions ?? data?.permission ?? data?.capabilities ?? data),
});

const normalizeToken = (data: any): StreamTokenResponse => ({
  apiKey: data?.apiKey ?? data?.api_key ?? '',
  token: data?.token ?? '',
  user: normalizeUser(data?.user ?? data?.user_info ?? data?.member ?? data?.participant),
});

export const streamService = {
  getStreamToken: async () => {
    const response = await api.get<StreamTokenResponse>('/auth/stream/token');
    return normalizeToken(unwrapData(response.data));
  },
  bootstrapLiveClassroom: async (payload: { classroomId: string; mode: 'host' | 'participant' }) => {
    const response = await api.post<StreamBootstrapResponse>('/auth/stream/live/bootstrap', payload);
    return normalizeBootstrap(unwrapData(response.data));
  },
};

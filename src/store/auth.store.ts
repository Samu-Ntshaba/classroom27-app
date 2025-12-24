import { create } from 'zustand';

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserProfile | null) => void;
  clear: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setUser: (user) => set({ user }),
  clear: () => set({ user: null, accessToken: null, refreshToken: null }),
  setHydrated: (value) => set({ hydrated: value }),
}));

export const authStore = {
  getState: useAuthStore.getState,
  setState: useAuthStore.setState,
};

import { create } from 'zustand';

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string | null;
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  pendingAction: (() => void) | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserProfile | null) => void;
  clear: () => void;
  setHydrated: (value: boolean) => void;
  setPendingAction: (action: (() => void) | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  pendingAction: null,
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setUser: (user) => set({ user }),
  clear: () => set({ user: null, accessToken: null, refreshToken: null, pendingAction: null }),
  setHydrated: (value) => set({ hydrated: value }),
  setPendingAction: (action) => set({ pendingAction: action }),
}));

export const authStore = {
  getState: useAuthStore.getState,
  setState: useAuthStore.setState,
};

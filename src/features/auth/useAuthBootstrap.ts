import { useEffect } from 'react';
import { authService } from '../../services/auth.service';
import { storage } from '../../services/storage.service';
import { useAuthStore } from '../../store/auth.store';

export const useAuthBootstrap = () => {
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const tokens = await storage.getTokens();
      if (tokens.accessToken && tokens.refreshToken) {
        if (active) {
          setTokens(tokens.accessToken, tokens.refreshToken);
        }
        try {
          const user = await authService.getMe();
          if (active) {
            setUser(user);
          }
        } catch {
          // ignore
        }
      }
      if (active) {
        setHydrated(true);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [setHydrated, setTokens, setUser]);
};

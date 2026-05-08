'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  COMMUNITY_IDENTITY_EVENT_NAME,
  COMMUNITY_IDENTITY_STORAGE_KEY,
  type CommunityIdentityMode,
  normalizeLegacyCommunityIdentity,
} from '@/app/user/lib/community-identity';

type AuthContextValue = {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  defaultCommunityIdentity: CommunityIdentityMode;
  setDefaultCommunityIdentity: (value: CommunityIdentityMode) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [defaultCommunityIdentity, setDefaultCommunityIdentityState] = useState<CommunityIdentityMode>(() => {
    if (typeof window === 'undefined') {
      return 'real';
    }

    return (
      normalizeLegacyCommunityIdentity(
        window.localStorage.getItem(COMMUNITY_IDENTITY_STORAGE_KEY),
      ) ?? 'real'
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleIdentityChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode?: string }>;
      const nextMode = normalizeLegacyCommunityIdentity(customEvent.detail?.mode);

      if (nextMode) {
        setDefaultCommunityIdentityState(nextMode);
      }
    };

    window.addEventListener(
      COMMUNITY_IDENTITY_EVENT_NAME,
      handleIdentityChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        COMMUNITY_IDENTITY_EVENT_NAME,
        handleIdentityChange as EventListener,
      );
    };
  }, []);

  const setDefaultCommunityIdentity = (value: CommunityIdentityMode) => {
    setDefaultCommunityIdentityState(value);

    if (typeof window === 'undefined') return;

    window.localStorage.setItem(COMMUNITY_IDENTITY_STORAGE_KEY, value);
    window.dispatchEvent(
      new CustomEvent(COMMUNITY_IDENTITY_EVENT_NAME, {
        detail: { mode: value },
      }),
    );
  };

  const value = useMemo(
    () => ({
      isLoggedIn,
      setIsLoggedIn,
      defaultCommunityIdentity,
      setDefaultCommunityIdentity,
    }),
    [defaultCommunityIdentity, isLoggedIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  COMMUNITY_IDENTITY_EVENT_NAME,
  COMMUNITY_IDENTITY_STORAGE_KEY,
  type CommunityIdentityMode,
  normalizeLegacyCommunityIdentity,
} from '@/app/user/lib/community-identity';
import usersData from '@/data/mock/users.json';
import type { UserAccount } from '@/types/user';

const DEFAULT_REAL_AVATAR = '/images/profiles/real-medium.png';
const AUTH_USER_STORAGE_KEY = 'orangepark:community-auth-account-id';
const DEFAULT_AUTH_ACCOUNT_ID = 'account-user-1';

export type AuthUserProfile = {
  accountId: string;
  name: string;
  nickname: string;
  avatar: string;
  company: string;
  position: string;
  postsCount: number;
  commentsCount: number;
};

const userAccounts = usersData as UserAccount[];
const selectableUserAccounts = userAccounts.filter(
  (user) => user.status === 'active' && !user.accountId.startsWith('admin'),
);

function mapAccountToAuthUser(account?: UserAccount): AuthUserProfile {
  return {
    accountId: account?.accountId ?? DEFAULT_AUTH_ACCOUNT_ID,
    name: account?.verification.realName ?? '박민수',
    nickname: account?.verification.realName ?? '박민수',
    avatar: account?.profile.avatar || DEFAULT_REAL_AVATAR,
    company: account?.profile.company ?? '',
    position: account?.profile.position ?? '',
    postsCount: 12,
    commentsCount: 45,
  };
}

function getStoredAccountId() {
  if (typeof window === 'undefined') return DEFAULT_AUTH_ACCOUNT_ID;
  return window.localStorage.getItem(AUTH_USER_STORAGE_KEY) ?? DEFAULT_AUTH_ACCOUNT_ID;
}

export const TEST_LOGIN_USERS = selectableUserAccounts.map(mapAccountToAuthUser);

type AuthContextValue = {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  currentUser: AuthUserProfile;
  setCurrentUserByAccountId: (accountId: string) => Promise<void>;
  logout: () => Promise<void>;
  defaultCommunityIdentity: CommunityIdentityMode;
  setDefaultCommunityIdentity: (value: CommunityIdentityMode) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUserProfile>(() => {
    const storedAccountId = getStoredAccountId();
    const storedAccount = selectableUserAccounts.find((user) => user.accountId === storedAccountId);
    const fallbackAccount = selectableUserAccounts.find((user) => user.accountId === DEFAULT_AUTH_ACCOUNT_ID);

    return mapAccountToAuthUser(storedAccount ?? fallbackAccount);
  });
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
    let isMounted = true;

    async function syncSession() {
      try {
        const response = await fetch('/api/mock/auth/session', {
          cache: 'no-store',
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          isLoggedIn?: boolean;
          currentUser?: AuthUserProfile | null;
        };

        if (!isMounted || !data.currentUser) return;

        setCurrentUser(data.currentUser);
        setIsLoggedIn(Boolean(data.isLoggedIn));

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(AUTH_USER_STORAGE_KEY, data.currentUser.accountId);
        }
      } catch {
        // The local fallback keeps the prototype usable even if the mock API is unavailable.
      }
    }

    void syncSession();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const setDefaultCommunityIdentity = useCallback((value: CommunityIdentityMode) => {
    setDefaultCommunityIdentityState(value);

    if (typeof window === 'undefined') return;

    window.localStorage.setItem(COMMUNITY_IDENTITY_STORAGE_KEY, value);
    window.dispatchEvent(
      new CustomEvent(COMMUNITY_IDENTITY_EVENT_NAME, {
        detail: { mode: value },
      }),
    );
  }, []);

  const setCurrentUserByAccountId = useCallback(async (accountId: string) => {
    const nextAccount = selectableUserAccounts.find((user) => user.accountId === accountId);

    if (!nextAccount) return;

    const fallbackUser = mapAccountToAuthUser(nextAccount);

    try {
      const response = await fetch('/api/mock/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId: nextAccount.accountId }),
      });
      const data = (await response.json().catch(() => null)) as {
        currentUser?: AuthUserProfile | null;
      } | null;

      setCurrentUser(data?.currentUser ?? fallbackUser);
    } catch {
      setCurrentUser(fallbackUser);
    }

    setIsLoggedIn(true);

    if (typeof window === 'undefined') return;

    window.localStorage.setItem(AUTH_USER_STORAGE_KEY, nextAccount.accountId);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/mock/auth/session', {
        method: 'DELETE',
      });
    } catch {
      // Logging out should still update the UI even if the mock endpoint is unavailable.
    }

    setIsLoggedIn(false);
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      setIsLoggedIn,
      currentUser,
      setCurrentUserByAccountId,
      logout,
      defaultCommunityIdentity,
      setDefaultCommunityIdentity,
    }),
    [currentUser, defaultCommunityIdentity, isLoggedIn, logout, setCurrentUserByAccountId, setDefaultCommunityIdentity],
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

import { NextRequest, NextResponse } from 'next/server';

import { readJsonFile } from '@/lib/mock-file';
import type { UserAccount } from '@/types/user';

const USERS_PATH = 'data/mock/users.json';

export const MOCK_AUTH_SESSION_COOKIE = 'orangepark_mock_session_account_id';
export const DEFAULT_MOCK_AUTH_ACCOUNT_ID = 'account-user-1';
export const DEFAULT_MOCK_AUTH_AVATAR = '/images/profiles/real-medium.png';

export type MockAuthUserProfile = {
  accountId: string;
  name: string;
  nickname: string;
  avatar: string;
  company: string;
  position: string;
  postsCount: number;
  commentsCount: number;
};

export async function readMockAuthUsers() {
  const users = await readJsonFile<UserAccount[]>(USERS_PATH);

  return users.filter((user) => user.status === 'active' && !user.accountId.startsWith('admin'));
}

export function mapUserAccountToMockAuthProfile(account: UserAccount): MockAuthUserProfile {
  return {
    accountId: account.accountId,
    name: account.verification.realName,
    nickname: account.verification.realName,
    avatar: account.profile.avatar || DEFAULT_MOCK_AUTH_AVATAR,
    company: account.profile.company ?? '',
    position: account.profile.position ?? '',
    postsCount: 12,
    commentsCount: 45,
  };
}

export function getRequestedMockAccountId(request: NextRequest, fallbackAccountId = '') {
  return (
    request.cookies.get(MOCK_AUTH_SESSION_COOKIE)?.value?.trim() ||
    fallbackAccountId.trim() ||
    request.nextUrl.searchParams.get('accountId')?.trim() ||
    request.nextUrl.searchParams.get('viewerAccountId')?.trim() ||
    request.nextUrl.searchParams.get('followerAccountId')?.trim() ||
    ''
  );
}

export async function resolveMockAuthAccount(
  request: NextRequest,
  fallbackAccountId = '',
  options: { allowDefaultFallback?: boolean } = {},
) {
  const users = await readMockAuthUsers();
  const requestedAccountId = getRequestedMockAccountId(request, fallbackAccountId);
  const requestedAccount = users.find((user) => user.accountId === requestedAccountId);
  const fallbackAccount = users.find((user) => user.accountId === DEFAULT_MOCK_AUTH_ACCOUNT_ID);

  if (requestedAccount) return requestedAccount;

  if (options.allowDefaultFallback) {
    return fallbackAccount ?? users[0] ?? null;
  }

  return null;
}

export async function resolveMockAuthAccountId(request: NextRequest, fallbackAccountId = '') {
  return (
    await resolveMockAuthAccount(request, fallbackAccountId, {
      allowDefaultFallback: false,
    })
  )?.accountId ?? '';
}

export function setMockAuthSessionCookie(response: NextResponse, accountId: string) {
  response.cookies.set(MOCK_AUTH_SESSION_COOKIE, accountId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  });
}

export function clearMockAuthSessionCookie(response: NextResponse) {
  response.cookies.set(MOCK_AUTH_SESSION_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
  });
}

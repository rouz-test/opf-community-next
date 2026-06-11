import { NextRequest, NextResponse } from 'next/server';

import { resolveMockAuthAccountId } from '@/app/api/mock/_utils/mock-auth-session';
import { readJsonFile, writeJsonFile } from '@/lib/mock-file';
import {
  DEFAULT_COMMUNITY_FILTER_PREFERENCES,
  normalizeCommunityFilterPreferences,
  type CommunityFilterPreferences,
  type UserCommunityPreferences,
} from '@/app/user/lib/community-filter-preferences';

const USER_PREFERENCES_PATH = 'data/mock/user-preferences.json';

type UserPreferenceRecord = UserCommunityPreferences;
type PatchUserPreferencesRequestBody = {
  accountId?: unknown;
  community?: Partial<CommunityFilterPreferences> | null;
};

async function readUserPreferences() {
  try {
    return await readJsonFile<UserPreferenceRecord[]>(USER_PREFERENCES_PATH);
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;

    if (code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

function createDefaultPreferences(accountId: string): UserPreferenceRecord {
  return {
    accountId,
    community: DEFAULT_COMMUNITY_FILTER_PREFERENCES,
    updatedAt: new Date().toISOString(),
  };
}

async function getAccountId(request: NextRequest, fallbackAccountId = '') {
  return resolveMockAuthAccountId(
    request,
    fallbackAccountId || request.nextUrl.searchParams.get('accountId')?.trim() || '',
  );
}

export async function GET(request: NextRequest) {
  try {
    const accountId = await getAccountId(request);

    if (!accountId) {
      return NextResponse.json({ message: 'accountId가 필요합니다.' }, { status: 400 });
    }

    const preferences = await readUserPreferences();
    const currentPreferences =
      preferences.find((preference) => preference.accountId === accountId) ?? createDefaultPreferences(accountId);

    return NextResponse.json({
      ...currentPreferences,
      community: normalizeCommunityFilterPreferences(currentPreferences.community),
    });
  } catch (error) {
    console.error('[mock/user-preferences] failed to read preferences:', error);
    return NextResponse.json({ message: '사용자 설정을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as PatchUserPreferencesRequestBody | null;
    const accountId = await getAccountId(
      request,
      typeof body?.accountId === 'string' ? body.accountId.trim() : '',
    );

    if (!accountId) {
      return NextResponse.json({ message: 'accountId가 필요합니다.' }, { status: 400 });
    }

    const preferences = await readUserPreferences();
    const currentPreferences =
      preferences.find((preference) => preference.accountId === accountId) ?? createDefaultPreferences(accountId);
    const nextPreferences: UserPreferenceRecord = {
      ...currentPreferences,
      community: normalizeCommunityFilterPreferences({
        ...currentPreferences.community,
        ...(body?.community ?? {}),
      }),
      updatedAt: new Date().toISOString(),
    };
    const nextPreferencesList = preferences.some((preference) => preference.accountId === accountId)
      ? preferences.map((preference) => (preference.accountId === accountId ? nextPreferences : preference))
      : [...preferences, nextPreferences];

    await writeJsonFile<UserPreferenceRecord[]>(USER_PREFERENCES_PATH, nextPreferencesList);

    return NextResponse.json(nextPreferences);
  } catch (error) {
    console.error('[mock/user-preferences] failed to update preferences:', error);
    return NextResponse.json({ message: '사용자 설정을 저장하지 못했습니다.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

import { readJsonFile, writeJsonFile } from '@/lib/mock-file';
import type { UserCommunityProfile } from '@/types/user';

const USER_COMMUNITY_PROFILES_PATH = 'data/mock/user-community-profiles.json';

type RouteContext = {
  params: Promise<{
    accountId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { accountId } = await context.params;
    const body = (await request.json().catch(() => null)) as
      | { isSuspended?: boolean; suspendedByAdminId?: string; suspensionReason?: string | null }
      | null;

    if (!accountId?.trim()) {
      return NextResponse.json({ message: '회원 ID는 필수입니다.' }, { status: 400 });
    }

    if (typeof body?.isSuspended !== 'boolean') {
      return NextResponse.json({ message: '정지 여부가 올바르지 않습니다.' }, { status: 400 });
    }

    const profiles = await readJsonFile<UserCommunityProfile[]>(USER_COMMUNITY_PROFILES_PATH);
    const targetIndex = profiles.findIndex((profile) => profile.accountId === accountId);

    if (targetIndex < 0) {
      return NextResponse.json({ message: '커뮤니티 프로필을 찾을 수 없습니다.' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const currentProfile = profiles[targetIndex];
    const nextProfile: UserCommunityProfile = {
      ...currentProfile,
      moderation: {
        isSuspended: body.isSuspended,
        suspendedAt: body.isSuspended ? now : null,
        suspendedByAdminId: body.isSuspended ? body.suspendedByAdminId || 'admin-1' : null,
        suspensionReason: body.isSuspended ? body.suspensionReason ?? null : null,
      },
      updatedAt: now,
    };

    const nextProfiles = [...profiles];
    nextProfiles[targetIndex] = nextProfile;

    await writeJsonFile<UserCommunityProfile[]>(USER_COMMUNITY_PROFILES_PATH, nextProfiles);

    return NextResponse.json(nextProfile, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/mock/users/[accountId]/community-suspension] failed:', error);
    return NextResponse.json({ message: '커뮤니티 활동 정지 상태를 저장하지 못했습니다.' }, { status: 500 });
  }
}

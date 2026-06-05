import { NextRequest, NextResponse } from 'next/server';

import {
  getCommunityFollowState,
  readCommunityFollows,
  writeCommunityFollows,
  type CommunityFollowRelation,
} from '@/lib/community-follows';
import { readJsonFile } from '@/lib/mock-file';
import type { UserAccount } from '@/types/user';

type FollowRequestBody = Partial<CommunityFollowRelation>;

const USERS_PATH = 'data/mock/users.json';
const DEFAULT_PROFILE_AVATAR = '/images/profiles/real-medium.png';

type CommunityFollowListItem = {
  accountId: string;
  name: string;
  avatar: string;
  company: string;
  position: string;
  isFollowing: boolean;
};

function normalizeAccountId(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function readUsers() {
  return readJsonFile<UserAccount[]>(USERS_PATH);
}

function mapFollowListItems({
  users,
  relations,
  accountIds,
  viewerAccountId,
}: {
  users: UserAccount[];
  relations: CommunityFollowRelation[];
  accountIds: string[];
  viewerAccountId: string;
}): CommunityFollowListItem[] {
  const userMap = new Map(users.map((user) => [user.accountId, user]));

  return accountIds.flatMap((accountId) => {
    const user = userMap.get(accountId);
    if (!user) return [];

    return [
      {
        accountId: user.accountId,
        name: user.verification.realName,
        avatar: user.profile.avatar || DEFAULT_PROFILE_AVATAR,
        company: user.profile.company,
        position: user.profile.position,
        isFollowing: relations.some(
          (relation) =>
            relation.followerAccountId === viewerAccountId &&
            relation.followingAccountId === user.accountId,
        ),
      },
    ];
  });
}

export async function GET(request: NextRequest) {
  try {
    const viewerAccountId =
      request.nextUrl.searchParams.get('viewerAccountId')?.trim() ??
      request.nextUrl.searchParams.get('followerAccountId')?.trim() ??
      '';
    const targetAccountId = request.nextUrl.searchParams.get('targetAccountId')?.trim() ?? '';
    const accountId = request.nextUrl.searchParams.get('accountId')?.trim() ?? targetAccountId;
    const listType = request.nextUrl.searchParams.get('listType')?.trim() ?? '';

    if (!targetAccountId && !accountId) {
      return NextResponse.json({ message: '대상 회원 정보가 필요합니다.' }, { status: 400 });
    }

    const relations = await readCommunityFollows();

    if (listType === 'followers' || listType === 'following') {
      const users = await readUsers();
      const followerIds = relations
        .filter((relation) => relation.followingAccountId === accountId)
        .map((relation) => relation.followerAccountId);
      const followingIds = relations
        .filter((relation) => relation.followerAccountId === accountId)
        .map((relation) => relation.followingAccountId);
      const targetIds = listType === 'followers' ? followerIds : followingIds;

      return NextResponse.json(
        {
          accountId,
          followerCount: followerIds.length,
          followingCount: followingIds.length,
          items: mapFollowListItems({
            users,
            relations,
            accountIds: targetIds,
            viewerAccountId: viewerAccountId || accountId,
          }),
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      getCommunityFollowState({ relations, viewerAccountId, targetAccountId: targetAccountId || accountId }),
      { status: 200 },
    );
  } catch (error) {
    console.error('[GET /api/mock/community-follows] failed:', error);
    return NextResponse.json({ message: '팔로우 정보를 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as FollowRequestBody;
    const followerAccountId = normalizeAccountId(body.followerAccountId);
    const followingAccountId = normalizeAccountId(body.followingAccountId);

    if (!followerAccountId || !followingAccountId) {
      return NextResponse.json({ message: '팔로우 회원 정보가 필요합니다.' }, { status: 400 });
    }

    if (followerAccountId === followingAccountId) {
      return NextResponse.json({ message: '자기 자신은 팔로우할 수 없습니다.' }, { status: 400 });
    }

    const relations = await readCommunityFollows();
    const exists = relations.some(
      (relation) =>
        relation.followerAccountId === followerAccountId &&
        relation.followingAccountId === followingAccountId,
    );

    if (!exists) {
      const nextRelations = [...relations, { followerAccountId, followingAccountId }];

      await writeCommunityFollows(nextRelations);

      return NextResponse.json(
        getCommunityFollowState({
          relations: nextRelations,
          viewerAccountId: followerAccountId,
          targetAccountId: followingAccountId,
        }),
        { status: 200 },
      );
    }

    return NextResponse.json(
      getCommunityFollowState({
        relations,
        viewerAccountId: followerAccountId,
        targetAccountId: followingAccountId,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error('[POST /api/mock/community-follows] failed:', error);
    return NextResponse.json({ message: '팔로우를 처리하지 못했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const followerAccountId = request.nextUrl.searchParams.get('followerAccountId')?.trim() ?? '';
    const followingAccountId = request.nextUrl.searchParams.get('followingAccountId')?.trim() ?? '';

    if (!followerAccountId || !followingAccountId) {
      return NextResponse.json({ message: '팔로우 회원 정보가 필요합니다.' }, { status: 400 });
    }

    const relations = await readCommunityFollows();
    const nextRelations = relations.filter(
      (relation) =>
        !(
          relation.followerAccountId === followerAccountId &&
          relation.followingAccountId === followingAccountId
        ),
    );
    const didRemove = nextRelations.length !== relations.length;

    if (didRemove) {
      await writeCommunityFollows(nextRelations);

      return NextResponse.json(
        getCommunityFollowState({
          relations: nextRelations,
          viewerAccountId: followerAccountId,
          targetAccountId: followingAccountId,
        }),
        { status: 200 },
      );
    }

    return NextResponse.json(
      getCommunityFollowState({
        relations,
        viewerAccountId: followerAccountId,
        targetAccountId: followingAccountId,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error('[DELETE /api/mock/community-follows] failed:', error);
    return NextResponse.json({ message: '팔로우 취소를 처리하지 못했습니다.' }, { status: 500 });
  }
}

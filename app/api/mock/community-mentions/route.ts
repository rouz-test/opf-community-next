import { NextRequest, NextResponse } from 'next/server';

import { resolveMockAuthAccountId } from '@/app/api/mock/_utils/mock-auth-session';
import { readCommunityFollows } from '@/lib/community-follows';
import { readJsonFile } from '@/lib/mock-file';
import type { UserAccount } from '@/types/user';

const USERS_PATH = 'data/mock/users.json';
const DEFAULT_PROFILE_AVATAR = '/images/profiles/real-medium.png';

type MentionListItem = {
  accountId: string;
  name: string;
  avatar: string;
  company: string;
  position: string;
  relation: 'mutual' | 'following' | 'search';
};

async function readUsers() {
  return readJsonFile<UserAccount[]>(USERS_PATH);
}

function normalizeKeyword(value: string | null) {
  return (value ?? '').trim().toLowerCase();
}

function compareByName(left: MentionListItem, right: MentionListItem) {
  return left.name.localeCompare(right.name, ['ko-KR', 'en-US']);
}

function mapUserToMentionItem(
  user: UserAccount,
  relation: MentionListItem['relation'],
): MentionListItem {
  return {
    accountId: user.accountId,
    name: user.verification.realName,
    avatar: user.profile.avatar || DEFAULT_PROFILE_AVATAR,
    company: user.profile.company,
    position: user.profile.position,
    relation,
  };
}

export async function GET(request: NextRequest) {
  try {
    const viewerAccountId = await resolveMockAuthAccountId(
      request,
      request.nextUrl.searchParams.get('viewerAccountId')?.trim() ?? '',
    );
    const query = normalizeKeyword(request.nextUrl.searchParams.get('query'));
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? 8);

    if (!viewerAccountId) {
      return NextResponse.json({ message: '사용자 정보가 필요합니다.' }, { status: 400 });
    }

    const [users, follows] = await Promise.all([readUsers(), readCommunityFollows()]);
    const activeUsers = users.filter((user) => user.status === 'active' && user.accountId !== viewerAccountId);
    const followingIds = new Set(
      follows
        .filter((relation) => relation.followerAccountId === viewerAccountId)
        .map((relation) => relation.followingAccountId),
    );
    const followerIds = new Set(
      follows
        .filter((relation) => relation.followingAccountId === viewerAccountId)
        .map((relation) => relation.followerAccountId),
    );
    const getRelation = (accountId: string): MentionListItem['relation'] => {
      if (followingIds.has(accountId) && followerIds.has(accountId)) return 'mutual';
      if (followingIds.has(accountId)) return 'following';
      return 'search';
    };
    const relationRank = { mutual: 0, following: 1, search: 2 } as const;

    const sourceUsers =
      query.length === 0
        ? activeUsers.filter((user) => followingIds.has(user.accountId))
        : activeUsers.filter((user) =>
            user.verification.realName.toLowerCase().includes(query),
          );

    const items = sourceUsers
      .map((user) => mapUserToMentionItem(user, getRelation(user.accountId)))
      .sort((left, right) => {
        const rankDiff = relationRank[left.relation] - relationRank[right.relation];
        if (rankDiff !== 0) return rankDiff;
        return compareByName(left, right);
      })
      .slice(0, Number.isFinite(limit) && limit > 0 ? limit : 8);

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/mock/community-mentions] failed:', error);
    return NextResponse.json({ message: '멘션 후보를 불러오지 못했습니다.' }, { status: 500 });
  }
}

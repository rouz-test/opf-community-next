import { NextRequest, NextResponse } from 'next/server';

import { resolveMockAuthAccountId } from '@/app/api/mock/_utils/mock-auth-session';
import { readJsonFile, writeJsonFile } from '@/lib/mock-file';
import type { CommunityContent } from '@/types/community-content';
import type { CommunityContentReaction } from '@/types/community-content-reaction';

const COMMUNITY_CONTENTS_PATH = 'data/mock/community-contents.json';
const COMMUNITY_CONTENT_REACTIONS_PATH = 'data/mock/community-content-reactions.json';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getAccountId(request: NextRequest, body?: unknown) {
  const queryAccountId = request.nextUrl.searchParams.get('accountId')?.trim();
  const bodyAccountId =
    body && typeof body === 'object' && 'accountId' in body && typeof body.accountId === 'string'
      ? body.accountId.trim()
      : '';

  return resolveMockAuthAccountId(request, queryAccountId || bodyAccountId);
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as { accountId?: string } | null;
    const accountId = await getAccountId(request, body);

    if (!accountId) {
      return NextResponse.json({ message: '계정 정보가 필요합니다.' }, { status: 400 });
    }

    const [contents, reactions] = await Promise.all([
      readJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH),
      readJsonFile<CommunityContentReaction[]>(COMMUNITY_CONTENT_REACTIONS_PATH),
    ]);

    const targetIndex = contents.findIndex((content) => content.id === id);
    if (targetIndex === -1) {
      return NextResponse.json({ message: '콘텐츠를 찾을 수 없습니다.' }, { status: 404 });
    }

    const alreadyLiked = reactions.some(
      (reaction) =>
        reaction.type === 'like' &&
        reaction.contentId === id &&
        reaction.accountId === accountId,
    );

    if (!alreadyLiked) {
      const now = new Date().toISOString();
      reactions.push({
        id: `content-like-${Date.now()}`,
        contentId: id,
        accountId,
        type: 'like',
        createdAt: now,
      });

      contents[targetIndex] = {
        ...contents[targetIndex],
        stats: {
          ...contents[targetIndex].stats,
          likeCount: contents[targetIndex].stats.likeCount + 1,
        },
        updatedAt: now,
      };

      await Promise.all([
        writeJsonFile<CommunityContentReaction[]>(COMMUNITY_CONTENT_REACTIONS_PATH, reactions),
        writeJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH, contents),
      ]);
    }

    return NextResponse.json({
      content: contents[targetIndex],
      liked: true,
    });
  } catch (error) {
    console.error('[POST /api/mock/community-contents/[id]/like] failed:', error);
    return NextResponse.json({ message: '좋아요를 저장하지 못했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const accountId = await getAccountId(request);

    if (!accountId) {
      return NextResponse.json({ message: '계정 정보가 필요합니다.' }, { status: 400 });
    }

    const [contents, reactions] = await Promise.all([
      readJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH),
      readJsonFile<CommunityContentReaction[]>(COMMUNITY_CONTENT_REACTIONS_PATH),
    ]);

    const targetIndex = contents.findIndex((content) => content.id === id);
    if (targetIndex === -1) {
      return NextResponse.json({ message: '콘텐츠를 찾을 수 없습니다.' }, { status: 404 });
    }

    const reactionIndex = reactions.findIndex(
      (reaction) =>
        reaction.type === 'like' &&
        reaction.contentId === id &&
        reaction.accountId === accountId,
    );

    if (reactionIndex !== -1) {
      reactions.splice(reactionIndex, 1);
      contents[targetIndex] = {
        ...contents[targetIndex],
        stats: {
          ...contents[targetIndex].stats,
          likeCount: Math.max(0, contents[targetIndex].stats.likeCount - 1),
        },
        updatedAt: new Date().toISOString(),
      };

      await Promise.all([
        writeJsonFile<CommunityContentReaction[]>(COMMUNITY_CONTENT_REACTIONS_PATH, reactions),
        writeJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH, contents),
      ]);
    }

    return NextResponse.json({
      content: contents[targetIndex],
      liked: false,
    });
  } catch (error) {
    console.error('[DELETE /api/mock/community-contents/[id]/like] failed:', error);
    return NextResponse.json({ message: '좋아요를 취소하지 못했습니다.' }, { status: 500 });
  }
}

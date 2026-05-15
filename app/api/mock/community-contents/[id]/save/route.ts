import { NextRequest, NextResponse } from 'next/server';

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

function getAccountId(request: NextRequest, body?: unknown) {
  const queryAccountId = request.nextUrl.searchParams.get('accountId')?.trim();
  if (queryAccountId) return queryAccountId;

  if (body && typeof body === 'object' && 'accountId' in body && typeof body.accountId === 'string') {
    return body.accountId.trim();
  }

  return '';
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as { accountId?: string } | null;
    const accountId = getAccountId(request, body);

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

    const alreadySaved = reactions.some(
      (reaction) =>
        reaction.type === 'save' &&
        reaction.contentId === id &&
        reaction.accountId === accountId,
    );

    if (!alreadySaved) {
      const now = new Date().toISOString();
      reactions.push({
        id: `content-save-${Date.now()}`,
        contentId: id,
        accountId,
        type: 'save',
        createdAt: now,
      });

      contents[targetIndex] = {
        ...contents[targetIndex],
        stats: {
          ...contents[targetIndex].stats,
          saveCount: contents[targetIndex].stats.saveCount + 1,
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
      saved: true,
    });
  } catch (error) {
    console.error('[POST /api/mock/community-contents/[id]/save] failed:', error);
    return NextResponse.json({ message: '저장을 처리하지 못했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const accountId = getAccountId(request);

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
        reaction.type === 'save' &&
        reaction.contentId === id &&
        reaction.accountId === accountId,
    );

    if (reactionIndex !== -1) {
      reactions.splice(reactionIndex, 1);
      contents[targetIndex] = {
        ...contents[targetIndex],
        stats: {
          ...contents[targetIndex].stats,
          saveCount: Math.max(0, contents[targetIndex].stats.saveCount - 1),
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
      saved: false,
    });
  } catch (error) {
    console.error('[DELETE /api/mock/community-contents/[id]/save] failed:', error);
    return NextResponse.json({ message: '저장 취소를 처리하지 못했습니다.' }, { status: 500 });
  }
}

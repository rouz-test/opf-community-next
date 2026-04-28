import { NextRequest, NextResponse } from 'next/server';

import { readBlockedWordsFromStore } from '@/lib/blocked-word-store';
import { findMatchedBlockedWords } from '@/lib/blocked-word-validator';
import {
  calculateCommunityCommentStats,
  readCommunityComments,
  syncCommunityContentCommentStats,
  writeCommunityComments,
} from '@/lib/community-comments';
import type {
  CommunityCommentActionActor,
  CommunityCommentUpdatePayload,
} from '@/types/community-comment';

const MAX_COMMENT_LENGTH = 1000;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Partial<CommunityCommentUpdatePayload>;
    const content = body.content?.trim();
    const nextStatus = body.status;
    const actionActor: CommunityCommentActionActor =
      body.actionActor === 'author' ? 'author' : 'admin';

    if (nextStatus !== undefined && !['published', 'archived', 'deleted'].includes(nextStatus)) {
      return NextResponse.json({ message: '유효하지 않은 댓글 상태입니다.' }, { status: 400 });
    }

    if (body.content !== undefined && !content) {
      return NextResponse.json({ message: '수정할 댓글 내용을 입력해주세요.' }, { status: 400 });
    }

    if (content && content.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { message: `댓글은 ${MAX_COMMENT_LENGTH}자 이하로 입력해주세요.` },
        { status: 400 },
      );
    }

    if (content) {
      const blockedWords = await readBlockedWordsFromStore();
      const matchResult = findMatchedBlockedWords(content, blockedWords);

      if (matchResult.hasBlockedWords) {
        return NextResponse.json(
          {
            message: '금지 키워드가 포함되어 댓글을 수정할 수 없습니다.',
            matchedKeywords: matchResult.matchedKeywords,
          },
          { status: 400 },
        );
      }
    }

    const comments = await readCommunityComments();
    const targetIndex = comments.findIndex((comment) => comment.id === id);

    if (targetIndex === -1) {
      return NextResponse.json({ message: '수정할 댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (comments[targetIndex].status === 'deleted') {
      return NextResponse.json({ message: '삭제된 댓글은 변경할 수 없습니다.' }, { status: 400 });
    }

    if (body.content === undefined && nextStatus === undefined) {
      return NextResponse.json({ message: '변경할 댓글 정보가 없습니다.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const nextComments = [...comments];
    nextComments[targetIndex] = {
      ...nextComments[targetIndex],
      content: content ?? nextComments[targetIndex].content,
      status: nextStatus ?? nextComments[targetIndex].status,
      updatedAt: now,
      archivedAt:
        nextStatus === 'archived'
          ? now
          : nextStatus === 'published'
            ? null
            : nextComments[targetIndex].archivedAt,
      archivedBy:
        nextStatus === 'archived'
          ? actionActor
          : nextStatus === 'published'
            ? null
            : nextComments[targetIndex].archivedBy ?? null,
    };

    await writeCommunityComments(nextComments);

    return NextResponse.json(
      {
        item: nextComments[targetIndex],
        stats: calculateCommunityCommentStats(nextComments, nextComments[targetIndex].contentId),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[PATCH /api/mock/community-comments/[id]] failed:', error);
    return NextResponse.json({ message: '댓글을 수정하지 못했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as
      | Partial<CommunityCommentUpdatePayload>
      | null;
    const actionActor: CommunityCommentActionActor =
      body?.actionActor === 'author' ? 'author' : 'admin';
    const comments = await readCommunityComments();
    const targetIndex = comments.findIndex((comment) => comment.id === id);

    if (targetIndex === -1) {
      return NextResponse.json({ message: '삭제할 댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const nextComments = [...comments];
    nextComments[targetIndex] = {
      ...nextComments[targetIndex],
      status: 'deleted',
      updatedAt: now,
      archivedAt: nextComments[targetIndex].archivedAt,
      archivedBy: nextComments[targetIndex].archivedBy ?? null,
      deletedAt: now,
      deletedBy: actionActor,
    };

    await writeCommunityComments(nextComments);
    const syncResult = await syncCommunityContentCommentStats(
      nextComments[targetIndex].contentId,
      nextComments,
    );

    return NextResponse.json(
      {
        item: nextComments[targetIndex],
        stats: syncResult?.stats ??
          calculateCommunityCommentStats(nextComments, nextComments[targetIndex].contentId),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[DELETE /api/mock/community-comments/[id]] failed:', error);
    return NextResponse.json({ message: '댓글을 삭제하지 못했습니다.' }, { status: 500 });
  }
}

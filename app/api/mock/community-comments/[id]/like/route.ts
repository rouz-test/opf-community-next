import { NextRequest, NextResponse } from 'next/server';

import {
  readCommunityCommentReactions,
  readCommunityComments,
  writeCommunityCommentReactions,
  writeCommunityComments,
} from '@/lib/community-comments';
import type { CommunityCommentReaction } from '@/types/community-comment-reaction';

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

    const [comments, reactions] = await Promise.all([
      readCommunityComments(),
      readCommunityCommentReactions(),
    ]);
    const targetIndex = comments.findIndex((comment) => comment.id === id);

    if (targetIndex === -1) {
      return NextResponse.json({ message: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (comments[targetIndex].status !== 'published') {
      return NextResponse.json({ message: '노출 중인 댓글에만 좋아요를 누를 수 있습니다.' }, { status: 400 });
    }

    const alreadyLiked = reactions.some(
      (reaction) =>
        reaction.type === 'like' &&
        reaction.commentId === id &&
        reaction.accountId === accountId,
    );

    if (!alreadyLiked) {
      const now = new Date().toISOString();
      const nextReaction: CommunityCommentReaction = {
        id: `comment-like-${Date.now()}`,
        commentId: id,
        accountId,
        type: 'like',
        createdAt: now,
      };

      reactions.push(nextReaction);
      comments[targetIndex] = {
        ...comments[targetIndex],
        likeCount: comments[targetIndex].likeCount + 1,
        isLikedByMe: true,
        updatedAt: now,
      };

      await Promise.all([
        writeCommunityCommentReactions(reactions),
        writeCommunityComments(comments),
      ]);
    }

    return NextResponse.json({
      item: {
        ...comments[targetIndex],
        isLikedByMe: true,
      },
      liked: true,
    });
  } catch (error) {
    console.error('[POST /api/mock/community-comments/[id]/like] failed:', error);
    return NextResponse.json({ message: '댓글 좋아요를 저장하지 못했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const accountId = getAccountId(request);

    if (!accountId) {
      return NextResponse.json({ message: '계정 정보가 필요합니다.' }, { status: 400 });
    }

    const [comments, reactions] = await Promise.all([
      readCommunityComments(),
      readCommunityCommentReactions(),
    ]);
    const targetIndex = comments.findIndex((comment) => comment.id === id);

    if (targetIndex === -1) {
      return NextResponse.json({ message: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const reactionIndex = reactions.findIndex(
      (reaction) =>
        reaction.type === 'like' &&
        reaction.commentId === id &&
        reaction.accountId === accountId,
    );

    if (reactionIndex !== -1) {
      reactions.splice(reactionIndex, 1);
      comments[targetIndex] = {
        ...comments[targetIndex],
        likeCount: Math.max(0, comments[targetIndex].likeCount - 1),
        isLikedByMe: false,
        updatedAt: new Date().toISOString(),
      };

      await Promise.all([
        writeCommunityCommentReactions(reactions),
        writeCommunityComments(comments),
      ]);
    }

    return NextResponse.json({
      item: {
        ...comments[targetIndex],
        isLikedByMe: false,
      },
      liked: false,
    });
  } catch (error) {
    console.error('[DELETE /api/mock/community-comments/[id]/like] failed:', error);
    return NextResponse.json({ message: '댓글 좋아요를 취소하지 못했습니다.' }, { status: 500 });
  }
}

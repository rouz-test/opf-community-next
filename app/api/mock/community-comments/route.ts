import { NextRequest, NextResponse } from 'next/server';

import { readBlockedWordsFromStore } from '@/lib/blocked-word-store';
import { findMatchedBlockedWords } from '@/lib/blocked-word-validator';
import {
  buildCommunityCommentThreads,
  calculateCommunityCommentStats,
  DEFAULT_ADMIN_COMMENT_AUTHOR,
  readCommunityComments,
  readCommunityContents,
  syncCommunityContentCommentStats,
  writeCommunityComments,
} from '@/lib/community-comments';
import type {
  CommunityCommentAuthor,
  CommunityCommentEntity,
  CommunityCommentPayload,
} from '@/types/community-comment';

const MAX_COMMENT_LENGTH = 1000;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function GET(request: NextRequest) {
  try {
    const contentId = request.nextUrl.searchParams.get('contentId')?.trim();
    if (!contentId) {
      return NextResponse.json({ message: '콘텐츠 ID는 필수입니다.' }, { status: 400 });
    }

    const comments = await readCommunityComments();

    return NextResponse.json(
      {
        items: buildCommunityCommentThreads(comments, contentId),
        stats: calculateCommunityCommentStats(comments, contentId),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[GET /api/mock/community-comments] failed:', error);
    return NextResponse.json({ message: '댓글 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CommunityCommentPayload>;
    const contentId = body.contentId?.trim();
    const content = body.content?.trim();
    const parentId = body.parentId?.trim() || null;

    if (!contentId) {
      return NextResponse.json({ message: '콘텐츠 ID는 필수입니다.' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ message: '댓글 내용을 입력해주세요.' }, { status: 400 });
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { message: `댓글은 ${MAX_COMMENT_LENGTH}자 이하로 입력해주세요.` },
        { status: 400 },
      );
    }

    const blockedWords = await readBlockedWordsFromStore();
    const matchResult = findMatchedBlockedWords(content, blockedWords);

    if (matchResult.hasBlockedWords) {
      return NextResponse.json(
        {
          message: '금지 키워드가 포함되어 댓글을 등록할 수 없습니다.',
          matchedKeywords: matchResult.matchedKeywords,
        },
        { status: 400 },
      );
    }

    const [contents, comments] = await Promise.all([
      readCommunityContents(),
      readCommunityComments(),
    ]);

    const targetContent = contents.find((item) => item.id === contentId);
    if (!targetContent) {
      return NextResponse.json({ message: '대상 콘텐츠를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (parentId) {
      const parentComment = comments.find((comment) => comment.id === parentId);
      if (!parentComment || parentComment.contentId !== contentId) {
        return NextResponse.json({ message: '답글 대상 댓글을 찾을 수 없습니다.' }, { status: 404 });
      }

      if (parentComment.parentId !== null) {
        return NextResponse.json({ message: '답글에는 다시 답글을 작성할 수 없습니다.' }, { status: 400 });
      }
    }

    const author: CommunityCommentAuthor =
      body.author && isObject(body.author)
        ? {
            type: body.author.type === 'user' ? 'user' : 'admin',
            id:
              typeof body.author.id === 'string' && body.author.id.trim()
                ? body.author.id.trim()
                : DEFAULT_ADMIN_COMMENT_AUTHOR.id,
            visibility: body.author.visibility === 'anonymous' ? 'anonymous' : 'public',
            displayName:
              typeof body.author.displayName === 'string' && body.author.displayName.trim()
                ? body.author.displayName.trim()
                : DEFAULT_ADMIN_COMMENT_AUTHOR.displayName,
            identifierType: body.author.identifierType === 'name' ? 'name' : 'email',
            identifierValue:
              typeof body.author.identifierValue === 'string' && body.author.identifierValue.trim()
                ? body.author.identifierValue.trim()
                : DEFAULT_ADMIN_COMMENT_AUTHOR.identifierValue,
            avatar: typeof body.author.avatar === 'string' ? body.author.avatar : '',
          }
        : DEFAULT_ADMIN_COMMENT_AUTHOR;

    const now = new Date().toISOString();
    const nextComment: CommunityCommentEntity = {
      id: `${parentId ? 'community-reply' : 'community-comment'}-${Date.now()}`,
      contentId,
      parentId,
      author,
      content,
      status: 'published' as const,
      likeCount: 0,
      isLikedByMe: false,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
      archivedBy: null,
      deletedAt: null,
      deletedBy: null,
    };

    const nextComments = [...comments, nextComment];
    await writeCommunityComments(nextComments);
    const syncResult = await syncCommunityContentCommentStats(contentId, nextComments);

    return NextResponse.json(
      {
        item: nextComment,
        stats: syncResult?.stats ?? calculateCommunityCommentStats(nextComments, contentId),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/mock/community-comments] failed:', error);
    return NextResponse.json({ message: '댓글을 저장하지 못했습니다.' }, { status: 500 });
  }
}

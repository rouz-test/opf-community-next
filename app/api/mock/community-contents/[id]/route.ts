import { NextRequest, NextResponse } from 'next/server';

import { readJsonFile, writeJsonFile } from '@/lib/mock-file';
import type {
  CommunityContent,
  CommunityContentPayload,
} from '@/types/community-content';

const COMMUNITY_CONTENTS_PATH = 'data/mock/community-contents.json';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateCommunityContentRequestBody = Partial<CommunityContentPayload>;

function isValidContentStatus(
  status: unknown,
): status is CommunityContent['status'] {
  return status === 'draft' || status === 'published' || status === 'archived';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const contents = await readJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH);
    const content = contents.find((item) => item.id === id);

    if (!content) {
      return NextResponse.json(
        { message: '콘텐츠를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    console.error('[GET /api/mock/community-contents/[id]] failed:', error);
    return NextResponse.json(
      { message: '콘텐츠 상세 정보를 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as UpdateCommunityContentRequestBody;
    const contents = await readJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH);
    const targetIndex = contents.findIndex((item) => item.id === id);

    if (targetIndex === -1) {
      return NextResponse.json(
        { message: '수정할 콘텐츠를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const currentContent = contents[targetIndex];

    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json(
          { message: '제목은 비워둘 수 없습니다.' },
          { status: 400 },
        );
      }
    }

    if (body.status !== undefined && !isValidContentStatus(body.status)) {
      return NextResponse.json(
        { message: '유효하지 않은 콘텐츠 상태입니다.' },
        { status: 400 },
      );
    }

    if (body.tagIds !== undefined) {
      if (!Array.isArray(body.tagIds) || !body.tagIds.every((tagId) => typeof tagId === 'string')) {
        return NextResponse.json(
          { message: '태그 정보가 올바르지 않습니다.' },
          { status: 400 },
        );
      }
    }

    if (body.author !== undefined && !isObject(body.author)) {
      return NextResponse.json(
        { message: '작성자 정보가 올바르지 않습니다.' },
        { status: 400 },
      );
    }

    if (body.flags !== undefined && !isObject(body.flags)) {
      return NextResponse.json(
        { message: '콘텐츠 옵션 정보가 올바르지 않습니다.' },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const nextStatus = body.status ?? currentContent.status;

    const nextContent: CommunityContent = {
      ...currentContent,
      title: body.title !== undefined ? body.title.trim() : currentContent.title,
      content:
        body.content !== undefined && isObject(body.content)
          ? body.content
          : currentContent.content,
      tagIds: body.tagIds ?? currentContent.tagIds,
      status: nextStatus,
      author: body.author
        ? {
            type: body.author.type === 'admin' ? 'admin' : 'user',
            id:
              typeof body.author.id === 'string' && body.author.id.trim()
                ? body.author.id.trim()
                : currentContent.author.id,
            visibility:
              body.author.visibility === 'anonymous' ? 'anonymous' : 'public',
            displayName:
              typeof body.author.displayName === 'string' && body.author.displayName.trim()
                ? body.author.displayName.trim()
                : currentContent.author.displayName,
            identifierType: body.author.identifierType === 'name' ? 'name' : 'email',
            identifierValue:
              typeof body.author.identifierValue === 'string'
                ? body.author.identifierValue.trim()
                : currentContent.author.identifierValue,
          }
        : currentContent.author,
      flags: body.flags
        ? {
            isPinned:
              body.flags.isPinned !== undefined
                ? Boolean(body.flags.isPinned)
                : currentContent.flags.isPinned,
            isNotice:
              body.flags.isNotice !== undefined
                ? Boolean(body.flags.isNotice)
                : currentContent.flags.isNotice,
            isPromoted:
              body.flags.isPromoted !== undefined
                ? Boolean(body.flags.isPromoted)
                : currentContent.flags.isPromoted,
          }
        : currentContent.flags,
      updatedAt: now,
      publishedAt:
        nextStatus === 'published' || nextStatus === 'archived'
          ? currentContent.publishedAt ?? now
          : null,
    };

    const nextContents = [...contents];
    nextContents[targetIndex] = nextContent;

    await writeJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH, nextContents);

    return NextResponse.json(nextContent, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/mock/community-contents/[id]] failed:', error);
    return NextResponse.json(
      { message: '콘텐츠를 수정하지 못했습니다.' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const contents = await readJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH);
    const targetContent = contents.find((item) => item.id === id);

    if (!targetContent) {
      return NextResponse.json(
        { message: '삭제할 콘텐츠를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const nextContents = contents.filter((item) => item.id !== id);
    await writeJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH, nextContents);

    return NextResponse.json(
      { message: '콘텐츠가 삭제되었습니다.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('[DELETE /api/mock/community-contents/[id]] failed:', error);
    return NextResponse.json(
      { message: '콘텐츠를 삭제하지 못했습니다.' },
      { status: 500 },
    );
  }
}

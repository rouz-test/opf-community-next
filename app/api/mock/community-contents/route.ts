import { NextRequest, NextResponse } from 'next/server';

import { readBlockedWordsFromStore } from '@/lib/blocked-word-store';
import {
  isCommunityContentListSortDirection,
  isCommunityContentListSortKey,
  parseCommunityContentListQuery,
} from '@/lib/community-content-list';
import { extractTextFromContentBody, findMatchedBlockedWords } from '@/lib/blocked-word-validator';
import { readJsonFile, writeJsonFile } from '@/lib/mock-file';
import { normalizeTagIds, resolveTags } from '@/lib/tags';
import type {
  CommunityContent,
  CommunityContentListResponse,
  CommunityContentPayload,
  CommunityContentStats,
} from '@/types/community-content';
import type { Tag } from '@/types/tag';

const COMMUNITY_CONTENTS_PATH = 'data/mock/community-contents.json';
const TAGS_PATH = 'data/mock/tags.json';

type CreateCommunityContentRequestBody = Partial<CommunityContentPayload>;

const DEFAULT_STATS: CommunityContentStats = {
  viewCount: 0,
  likeCount: 0,
  saveCount: 0,
  commentCount: 0,
  replyCount: 0,
};

function isValidContentStatus(
  status: unknown,
): status is CommunityContent['status'] {
  return status === 'draft' || status === 'published' || status === 'archived';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function createDefaultContent() {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
  };
}

function getContentTypeLabel(content: CommunityContent) {
  if (content.author.type === 'admin') {
    return '관리자';
  }

  return content.author.visibility === 'anonymous' ? '익명' : '실명';
}

function getAuthorDisplay(content: CommunityContent) {
  if (content.author.visibility === 'anonymous') {
    return content.author.identifierValue || content.author.id;
  }

  return content.author.displayName || content.author.identifierValue || content.author.id;
}

function getContentReferenceDate(content: CommunityContent) {
  const candidate = content.publishedAt ?? content.createdAt;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function normalizeStoredContents(contents: CommunityContent[]) {
  const tags = await readJsonFile<Tag[]>(TAGS_PATH);

  const normalizedContents = contents.map((content) => {
    const normalizedTagIds = normalizeTagIds(content.tagIds, tags);

    if (
      normalizedTagIds.length === content.tagIds.length &&
      normalizedTagIds.every((tagId, index) => tagId === content.tagIds[index])
    ) {
      return content;
    }

    return {
      ...content,
      tagIds: normalizedTagIds,
      updatedAt: new Date().toISOString(),
    };
  });

  const hasChanges = normalizedContents.some((content, index) => content !== contents[index]);

  if (hasChanges) {
    await writeJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH, normalizedContents);
  }

  return { normalizedContents, tags };
}

export async function GET(request: NextRequest) {
  try {
    const contents = await readJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH);
    const { normalizedContents, tags } = await normalizeStoredContents(contents);
    const query = parseCommunityContentListQuery(request.nextUrl.searchParams);

    let filteredItems = isValidContentStatus(query.status)
      ? normalizedContents.filter((item) => item.status === query.status)
      : normalizedContents;

    filteredItems = filteredItems.filter((content) => {
      const referenceDate = getContentReferenceDate(content);
      const resolvedTags = resolveTags(content.tagIds, tags);

      if (query.startDate) {
        if (!referenceDate) return false;
        const start = new Date(query.startDate);
        start.setHours(0, 0, 0, 0);
        if (referenceDate < start) return false;
      }

      if (query.endDate) {
        if (!referenceDate) return false;
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        if (referenceDate > end) return false;
      }

      if (query.tags.length > 0) {
        const hasSelectedTag = resolvedTags.some((tag) => query.tags.includes(tag.name));
        if (!hasSelectedTag) return false;
      }

      if (query.flags.length > 0) {
        const matches: boolean[] = [];

        if (query.flags.includes('promoted')) matches.push(content.flags.isPromoted);
        if (query.flags.includes('notice')) matches.push(content.flags.isNotice);
        if (query.flags.includes('pinned')) matches.push(content.flags.isPinned);

        if (!matches.some(Boolean)) return false;
      }

      if (query.search) {
        const searchTarget = [
          content.title,
          extractTextFromContentBody(content.content),
          getAuthorDisplay(content),
          getContentTypeLabel(content),
          ...resolvedTags.map((tag) => tag.name),
        ]
          .join(' ')
          .toLowerCase();

        if (!searchTarget.includes(query.search.toLowerCase())) {
          return false;
        }
      }

      if (query.authorType !== 'all' && content.author.type !== query.authorType) {
        return false;
      }

      return true;
    });

    if (isCommunityContentListSortKey(query.sortKey)) {
      filteredItems = [...filteredItems].sort((a, b) => {
        let aValue = 0;
        let bValue = 0;

        if (query.sortKey === 'date') {
          aValue = getContentReferenceDate(a)?.getTime() ?? 0;
          bValue = getContentReferenceDate(b)?.getTime() ?? 0;
        } else if (query.sortKey === 'view') {
          aValue = a.stats.viewCount;
          bValue = b.stats.viewCount;
        } else if (query.sortKey === 'comment') {
          aValue = a.stats.commentCount + a.stats.replyCount;
          bValue = b.stats.commentCount + b.stats.replyCount;
        } else if (query.sortKey === 'like') {
          aValue = a.stats.likeCount;
          bValue = b.stats.likeCount;
        }

        if (isCommunityContentListSortDirection(query.sortDirection) && query.sortDirection === 'asc') {
          return aValue - bValue;
        }

        return bValue - aValue;
      });
    }

    const totalCount = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / query.pageSize));
    const currentPage = Math.min(query.page, totalPages);
    const pagedItems = filteredItems.slice(
      (currentPage - 1) * query.pageSize,
      currentPage * query.pageSize,
    );

    const response: CommunityContentListResponse = {
      items: pagedItems,
      meta: {
        totalCount,
        page: currentPage,
        pageSize: query.pageSize,
        totalPages,
      },
      query: {
        ...query,
        page: currentPage,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[GET /api/mock/community-contents] failed:', error);
    return NextResponse.json(
      { message: '콘텐츠 목록을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateCommunityContentRequestBody;

    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json(
        { message: '제목은 필수입니다.' },
        { status: 400 },
      );
    }

    if (!isValidContentStatus(body.status)) {
      return NextResponse.json(
        { message: '유효하지 않은 콘텐츠 상태입니다.' },
        { status: 400 },
      );
    }

    if (!body.author || !isObject(body.author)) {
      return NextResponse.json(
        { message: '작성자 정보는 필수입니다.' },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(body.tagIds) ||
      !body.tagIds.every((tagId) => typeof tagId === 'string')
    ) {
      return NextResponse.json(
        { message: '태그 정보가 올바르지 않습니다.' },
        { status: 400 },
      );
    }

    if (!body.flags || !isObject(body.flags)) {
      return NextResponse.json(
        { message: '콘텐츠 옵션 정보가 올바르지 않습니다.' },
        { status: 400 },
      );
    }

    if (body.status === 'published' || body.status === 'archived') {
      const blockedWords = await readBlockedWordsFromStore();
      const matchResult = findMatchedBlockedWords(
        [title, body.content && isObject(body.content) ? extractTextFromContentBody(body.content as CommunityContent['content']) : '']
          .filter(Boolean)
          .join(' '),
        blockedWords,
      );

      if (matchResult.hasBlockedWords) {
        return NextResponse.json(
          {
            message: '금지 키워드가 포함되어 발행할 수 없습니다.',
            matchedKeywords: matchResult.matchedKeywords,
          },
          { status: 400 },
        );
      }
    }

    const contents = await readJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH);
    const { normalizedContents, tags } = await normalizeStoredContents(contents);
    const now = new Date().toISOString();
    const nextTagIds = normalizeTagIds(body.tagIds, tags);

    const newContent: CommunityContent = {
      id: `content-${Date.now()}`,
      title,
      content: body.content && isObject(body.content) ? body.content : createDefaultContent(),
      tagIds: nextTagIds,
      status: body.status,
      author: {
        type: body.author.type === 'admin' ? 'admin' : 'user',
        id: typeof body.author.id === 'string' ? body.author.id : `author-${Date.now()}`,
        visibility: body.author.visibility === 'anonymous' ? 'anonymous' : 'public',
        displayName:
          typeof body.author.displayName === 'string' && body.author.displayName.trim()
            ? body.author.displayName.trim()
            : '익명',
        identifierType: body.author.identifierType === 'name' ? 'name' : 'email',
        identifierValue:
          typeof body.author.identifierValue === 'string'
            ? body.author.identifierValue.trim()
            : '',
      },
      flags: {
        isPinned: Boolean(body.flags.isPinned),
        isNotice: Boolean(body.flags.isNotice),
        isPromoted: Boolean(body.flags.isPromoted),
      },
      stats: DEFAULT_STATS,
      createdAt: now,
      updatedAt: now,
      publishedAt: body.status === 'published' || body.status === 'archived' ? now : null,
    };

    const nextContents = [newContent, ...normalizedContents];
    await writeJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH, nextContents);

    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error('[POST /api/mock/community-contents] failed:', error);
    return NextResponse.json(
      { message: '콘텐츠를 저장하지 못했습니다.' },
      { status: 500 },
    );
  }
}

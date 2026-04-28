import { NextRequest, NextResponse } from 'next/server';

import { parseBlockedWordsListQuery } from '@/lib/blocked-word-list';
import { writeJsonFile } from '@/lib/mock-file';
import { readBlockedWordsFromStore } from '@/lib/blocked-word-store';
import type { BlockedWord, BlockedWordsListResponse } from '@/types/blocked-word';

const BLOCKED_WORDS_PATH = 'data/mock/blocked-words.json';

type CreateBlockedWordRequestBody = Partial<{
  keyword: string;
  createdBy: string;
}>;

export async function GET(request: NextRequest) {
  try {
    const blockedWords = await readBlockedWordsFromStore();
    const hasListQuery =
      request.nextUrl.searchParams.has('page') ||
      request.nextUrl.searchParams.has('pageSize') ||
      request.nextUrl.searchParams.has('search');

    if (!hasListQuery) {
      return NextResponse.json(blockedWords, { status: 200 });
    }

    const query = parseBlockedWordsListQuery(request.nextUrl.searchParams);
    const normalizedSearch = query.search.toLowerCase();
    const filteredItems = blockedWords.filter((item) =>
      normalizedSearch ? item.keyword.toLowerCase().includes(normalizedSearch) : true,
    );

    const totalCount = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / query.pageSize));
    const currentPage = Math.min(query.page, totalPages);
    const pagedItems = filteredItems.slice(
      (currentPage - 1) * query.pageSize,
      currentPage * query.pageSize,
    );

    const response: BlockedWordsListResponse = {
      items: pagedItems,
      meta: {
        totalCount,
        totalPages,
        page: currentPage,
        pageSize: query.pageSize,
      },
      query: {
        ...query,
        page: currentPage,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[GET /api/mock/blocked-words] failed:', error);
    return NextResponse.json(
      { message: '금지 키워드 목록을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBlockedWordRequestBody;
    const keyword = body.keyword?.trim();

    if (!keyword) {
      return NextResponse.json(
        { message: '키워드는 필수입니다.' },
        { status: 400 },
      );
    }

    const blockedWords = await readBlockedWordsFromStore();
    const normalizedKeyword = keyword.toLowerCase();
    const hasDuplicate = blockedWords.some(
      (item) => item.keyword.trim().toLowerCase() === normalizedKeyword,
    );

    if (hasDuplicate) {
      return NextResponse.json(
        { message: '이미 등록된 키워드입니다.' },
        { status: 409 },
      );
    }

    const today = new Date();
    const createdAt = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`;

    const newBlockedWord: BlockedWord = {
      id: `blocked_word_${Date.now()}`,
      keyword,
      createdAt,
      createdBy: body.createdBy?.trim() || 'admin01',
    };

    const nextBlockedWords = [newBlockedWord, ...blockedWords];
    await writeJsonFile<BlockedWord[]>(BLOCKED_WORDS_PATH, nextBlockedWords);

    return NextResponse.json(newBlockedWord, { status: 201 });
  } catch (error) {
    console.error('[POST /api/mock/blocked-words] failed:', error);
    return NextResponse.json(
      { message: '금지 키워드를 등록하지 못했습니다.' },
      { status: 500 },
    );
  }
}

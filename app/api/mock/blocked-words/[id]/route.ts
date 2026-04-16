import { NextRequest, NextResponse } from 'next/server';

import { readJsonFile, writeJsonFile } from '@/lib/mock-file';
import type { BlockedWord } from '@/types/blocked-word';

const BLOCKED_WORDS_PATH = 'data/mock/blocked-words.json';

async function readBlockedWordsSafely(): Promise<BlockedWord[]> {
  try {
    return await readJsonFile<BlockedWord[]>(BLOCKED_WORDS_PATH);
  } catch (error) {
    const isFileSystemError =
      error instanceof Error &&
      ('code' in error || error.message.includes('Unexpected end of JSON input'));

    if (!isFileSystemError) {
      throw error;
    }

    const emptyList: BlockedWord[] = [];
    await writeJsonFile<BlockedWord[]>(BLOCKED_WORDS_PATH, emptyList);
    return emptyList;
  }
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const blockedWords = await readBlockedWordsSafely();

    const targetWord = blockedWords.find((item) => item.id === id);
    if (!targetWord) {
      return NextResponse.json(
        { message: '삭제할 키워드를 찾지 못했습니다.' },
        { status: 404 },
      );
    }

    const nextBlockedWords = blockedWords.filter((item) => item.id !== id);
    await writeJsonFile<BlockedWord[]>(BLOCKED_WORDS_PATH, nextBlockedWords);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/mock/blocked-words/[id]] failed:', error);
    return NextResponse.json(
      { message: '키워드를 삭제하지 못했습니다.' },
      { status: 500 },
    );
  }
}

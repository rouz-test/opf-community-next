import { readJsonFile, writeJsonFile } from '@/lib/mock-file';
import type { BlockedWord } from '@/types/blocked-word';

const BLOCKED_WORDS_PATH = 'data/mock/blocked-words.json';

export async function readBlockedWordsFromStore(): Promise<BlockedWord[]> {
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

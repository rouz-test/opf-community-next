import type { BlockedWord } from '@/types/blocked-word';

export type CreateBlockedWordPayload = {
  keyword: string;
  createdBy?: string;
};

export async function getBlockedWords(): Promise<BlockedWord[]> {
  const response = await fetch('/api/mock/blocked-words', {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('금지 키워드 목록을 불러오지 못했습니다.');
  }

  return response.json() as Promise<BlockedWord[]>;
}

export async function createBlockedWord(payload: CreateBlockedWordPayload): Promise<BlockedWord> {
  const response = await fetch('/api/mock/blocked-words', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(errorBody?.message || '금지 키워드를 등록하지 못했습니다.');
  }

  return response.json() as Promise<BlockedWord>;
}

export async function deleteBlockedWord(id: string): Promise<void> {
  const response = await fetch(`/api/mock/blocked-words/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(errorBody?.message || '금지 키워드를 삭제하지 못했습니다.');
  }
}

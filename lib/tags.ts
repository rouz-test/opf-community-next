import type { Tag } from '@/types/tag';

export type CreateTagPayload = {
  name: string;
  textColor: string;
  bgColor: string;
};

export type UpdateTagPayload = {
  id: string;
  name: string;
  textColor: string;
  bgColor: string;
  status?: Tag['status'];
  sortOrder?: number;
};

export async function getTags(): Promise<Tag[]> {
  const response = await fetch('/api/mock/tags', {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('태그 목록을 불러오지 못했습니다.');
  }

  return response.json() as Promise<Tag[]>;
}

export async function createTag(payload: CreateTagPayload): Promise<Tag> {
  const response = await fetch('/api/mock/tags', {
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

    throw new Error(errorBody?.message || '태그를 저장하지 못했습니다.');
  }

  return response.json() as Promise<Tag>;
}

export async function updateTag(payload: UpdateTagPayload): Promise<Tag> {
  const response = await fetch(`/api/mock/tags/${payload.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: payload.name,
      textColor: payload.textColor,
      bgColor: payload.bgColor,
      status: payload.status,
      sortOrder: payload.sortOrder,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(errorBody?.message || '태그를 수정하지 못했습니다.');
  }

  return response.json() as Promise<Tag>;
}

export async function deleteTag(id: string): Promise<void> {
  const response = await fetch(`/api/mock/tags/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(errorBody?.message || '태그를 삭제하지 못했습니다.');
  }
}

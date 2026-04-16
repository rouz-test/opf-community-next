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

export interface ResolvedTag {
  id: string;
  name: string;
  textColor: string;
  bgColor: string;
  isDefault: boolean;
  status: Tag['status'];
  sortOrder: number;
}

type ResolveTagsOptions = {
  includeInactive?: boolean;
};

export function resolveTags(
  tagIds: string[],
  tags: Tag[],
  options: ResolveTagsOptions = {},
): ResolvedTag[] {
  const { includeInactive = true } = options;
  const tagMap = new Map(tags.map((tag) => [tag.id, tag]));

  return tagIds
    .map((tagId) => tagMap.get(tagId))
    .filter((tag): tag is Tag => {
      if (!tag) return false;
      if (!includeInactive && tag.status === 'inactive') return false;
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      textColor: tag.style.textColor,
      bgColor: tag.style.bgColor,
      isDefault: tag.isDefault,
      status: tag.status,
      sortOrder: tag.sortOrder,
    }));
}

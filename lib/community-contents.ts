import { buildCommunityContentListSearchParams } from '@/lib/community-content-list';
import type {
  CommunityContentListQuery,
  CommunityContentListResponse,
} from '@/types/community-content';

export async function fetchCommunityContentList(
  query: CommunityContentListQuery,
): Promise<CommunityContentListResponse> {
  const searchParams = buildCommunityContentListSearchParams(query);
  const response = await fetch(`/api/mock/community-contents?${searchParams.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(errorBody?.message || '콘텐츠 목록을 불러오지 못했습니다.');
  }

  return response.json() as Promise<CommunityContentListResponse>;
}

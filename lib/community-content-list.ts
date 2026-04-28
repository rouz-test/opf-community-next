import type {
  CommunityContentListAuthorFilter,
  CommunityContentListFlagFilter,
  CommunityContentListQuery,
  CommunityContentListQueryInput,
  CommunityContentListResolvedQuery,
  CommunityContentListSortDirection,
  CommunityContentListSortKey,
  CommunityContentStatus,
} from '@/types/community-content';

export const COMMUNITY_CONTENT_DEFAULT_PAGE_SIZE = 13;

function parsePositiveInt(value: number | string | null | undefined, fallback: number) {
  const parsed =
    typeof value === 'number'
      ? value
      : Number.parseInt(typeof value === 'string' ? value : '', 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function isCommunityContentStatus(value: unknown): value is CommunityContentStatus {
  return value === 'draft' || value === 'published' || value === 'archived';
}

export function isCommunityContentListSortKey(
  value: unknown,
): value is CommunityContentListSortKey {
  return value === 'date' || value === 'view' || value === 'comment' || value === 'like';
}

export function isCommunityContentListSortDirection(
  value: unknown,
): value is CommunityContentListSortDirection {
  return value === 'asc' || value === 'desc';
}

export function isCommunityContentListFlagFilter(
  value: unknown,
): value is CommunityContentListFlagFilter {
  return value === 'promoted' || value === 'notice' || value === 'pinned';
}

export function isCommunityContentListAuthorFilter(
  value: unknown,
): value is CommunityContentListAuthorFilter {
  return value === 'all' || value === 'admin' || value === 'user';
}

function normalizeStringArray(values: string[] | undefined) {
  return values
    ?.map((value) => value.trim())
    .filter(Boolean) ?? [];
}

export function normalizeCommunityContentListQuery(
  query: CommunityContentListQuery | CommunityContentListQueryInput,
): CommunityContentListResolvedQuery {
  return {
    page: parsePositiveInt(query.page, 1),
    pageSize: parsePositiveInt(query.pageSize, COMMUNITY_CONTENT_DEFAULT_PAGE_SIZE),
    status: isCommunityContentStatus(query.status) ? query.status : undefined,
    authorType: isCommunityContentListAuthorFilter(query.authorType) ? query.authorType : 'all',
    startDate: query.startDate?.trim() ?? '',
    endDate: query.endDate?.trim() ?? '',
    search: query.search?.trim() ?? '',
    tags: normalizeStringArray(query.tags),
    flags: (query.flags ?? []).filter(isCommunityContentListFlagFilter),
    sortKey: isCommunityContentListSortKey(query.sortKey) ? query.sortKey : null,
    sortDirection: isCommunityContentListSortDirection(query.sortDirection)
      ? query.sortDirection
      : 'desc',
  };
}

export function parseCommunityContentListQuery(
  searchParams: URLSearchParams,
): CommunityContentListResolvedQuery {
  const rawQuery: CommunityContentListQueryInput = {
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
    status: searchParams.get('status') ?? undefined,
    authorType: searchParams.get('authorType') ?? undefined,
    startDate: searchParams.get('startDate') ?? undefined,
    endDate: searchParams.get('endDate') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    tags: searchParams.getAll('tag'),
    flags: searchParams.getAll('flag'),
    sortKey: searchParams.get('sortKey') ?? undefined,
    sortDirection: searchParams.get('sortDirection') ?? undefined,
  };

  return normalizeCommunityContentListQuery(rawQuery);
}

export function buildCommunityContentListSearchParams(
  query: CommunityContentListQuery,
): URLSearchParams {
  const normalizedQuery = normalizeCommunityContentListQuery(query);
  const searchParams = new URLSearchParams();

  searchParams.set('page', String(normalizedQuery.page));
  searchParams.set('pageSize', String(normalizedQuery.pageSize));

  if (normalizedQuery.status) {
    searchParams.set('status', normalizedQuery.status);
  }

  if (normalizedQuery.authorType !== 'all') {
    searchParams.set('authorType', normalizedQuery.authorType);
  }

  if (normalizedQuery.startDate) {
    searchParams.set('startDate', normalizedQuery.startDate);
  }

  if (normalizedQuery.endDate) {
    searchParams.set('endDate', normalizedQuery.endDate);
  }

  if (normalizedQuery.search) {
    searchParams.set('search', normalizedQuery.search);
  }

  for (const tag of normalizedQuery.tags) {
    searchParams.append('tag', tag);
  }

  for (const flag of normalizedQuery.flags) {
    searchParams.append('flag', flag);
  }

  if (normalizedQuery.sortKey) {
    searchParams.set('sortKey', normalizedQuery.sortKey);
    searchParams.set('sortDirection', normalizedQuery.sortDirection);
  }

  return searchParams;
}

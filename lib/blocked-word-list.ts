import type {
  BlockedWordsListQuery,
  BlockedWordsListQueryInput,
  BlockedWordsListResolvedQuery,
} from '@/types/blocked-word';

export const BLOCKED_WORD_DEFAULT_PAGE_SIZE = 13;

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

export function normalizeBlockedWordsListQuery(
  query: BlockedWordsListQuery | BlockedWordsListQueryInput,
): BlockedWordsListResolvedQuery {
  return {
    page: parsePositiveInt(query.page, 1),
    pageSize: parsePositiveInt(query.pageSize, BLOCKED_WORD_DEFAULT_PAGE_SIZE),
    search: query.search?.trim() ?? '',
  };
}

export function parseBlockedWordsListQuery(
  searchParams: URLSearchParams,
): BlockedWordsListResolvedQuery {
  return normalizeBlockedWordsListQuery({
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
    search: searchParams.get('search'),
  });
}

export function buildBlockedWordsListSearchParams(
  query: BlockedWordsListQuery,
): URLSearchParams {
  const normalizedQuery = normalizeBlockedWordsListQuery(query);
  const searchParams = new URLSearchParams();

  searchParams.set('page', String(normalizedQuery.page));
  searchParams.set('pageSize', String(normalizedQuery.pageSize));

  if (normalizedQuery.search) {
    searchParams.set('search', normalizedQuery.search);
  }

  return searchParams;
}

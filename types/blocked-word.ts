export interface BlockedWord {
  id: string;
  keyword: string;
  createdAt: string;
  createdBy: string;
}

export type BlockedWordsListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type BlockedWordsListQueryInput = {
  page?: number | string | null;
  pageSize?: number | string | null;
  search?: string | null;
};

export type BlockedWordsListResolvedQuery = {
  page: number;
  pageSize: number;
  search: string;
};

export type BlockedWordsListMeta = {
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export interface BlockedWordsListResponse {
  items: BlockedWord[];
  meta: BlockedWordsListMeta;
  query: BlockedWordsListResolvedQuery;
}

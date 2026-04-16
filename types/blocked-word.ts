export interface BlockedWord {
  id: string;
  keyword: string;
  createdAt: string;
  createdBy: string;
}

export interface BlockedWordsListResponse {
  items: BlockedWord[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

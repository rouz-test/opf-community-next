// =============================
// 커뮤니티 콘텐츠 타입 정의
// =============================


export type CommunityContentStatus = 'draft' | 'published' | 'archived';

export type CommunityContentAuthorType = 'admin' | 'user';

export type CommunityContentAuthorVisibility = 'public' | 'anonymous';

export type CommunityContentAuthorIdentifierType = 'name' | 'email';

export type CommunityContentAuthor = {
  type: CommunityContentAuthorType;
  id: string;
  visibility: CommunityContentAuthorVisibility;
  displayName: string;
  identifierType: CommunityContentAuthorIdentifierType;
  identifierValue: string;
};

export type CommunityContentFlags = {
  isPinned: boolean;
  isNotice: boolean;
  isPromoted: boolean;
};

export type CommunityContentStats = {
  viewCount: number;
  likeCount: number;
  saveCount: number;
  commentCount: number;
  replyCount: number;
};

export type CommunityContentBody = {
  type: string;
  content?: CommunityContentBody[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
};

export type CommunityContent = {
  id: string;
  title: string;
  content: CommunityContentBody;
  tagIds: string[];
  status: CommunityContentStatus;
  author: CommunityContentAuthor;
  flags: CommunityContentFlags;
  stats: CommunityContentStats;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

// =============================
// 생성/수정 요청용 타입
// =============================

export type CommunityContentPayload = {
  title: string;
  content: CommunityContentBody;
  tagIds: string[];
  status: CommunityContentStatus;
  author: CommunityContentAuthor;
  flags: CommunityContentFlags;
};

// =============================
// API 응답 타입 (확장 대비)
// =============================

export type CommunityContentListResponse = {
  items: CommunityContent[];
};

export type CommunityContentDetailResponse = CommunityContent;

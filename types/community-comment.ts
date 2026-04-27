import type {
  CommunityContentAuthorIdentifierType,
  CommunityContentAuthorType,
  CommunityContentAuthorVisibility,
} from '@/types/community-content';

export type CommunityCommentStatus = 'published' | 'deleted';

export type CommunityCommentAuthor = {
  type: CommunityContentAuthorType;
  id: string;
  visibility: CommunityContentAuthorVisibility;
  displayName: string;
  identifierType: CommunityContentAuthorIdentifierType;
  identifierValue: string;
  avatar?: string;
};

export type CommunityCommentEntity = {
  id: string;
  contentId: string;
  parentId: string | null;
  author: CommunityCommentAuthor;
  content: string;
  status: CommunityCommentStatus;
  likeCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CommunityComment = CommunityCommentEntity & {
  replies: CommunityComment[];
  replyCount: number;
};

export type CommunityCommentPayload = {
  contentId: string;
  parentId?: string | null;
  author?: CommunityCommentAuthor;
  content: string;
};

export type CommunityCommentUpdatePayload = {
  content: string;
};

export type CommunityContentCommentStats = {
  commentCount: number;
  replyCount: number;
  totalCount: number;
};

export type CommunityCommentListResponse = {
  items: CommunityComment[];
  stats: CommunityContentCommentStats;
};

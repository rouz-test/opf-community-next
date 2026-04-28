import type {
  CommunityContentAuthorIdentifierType,
  CommunityContentAuthorType,
  CommunityContentAuthorVisibility,
} from '@/types/community-content';

export type CommunityCommentStatus = 'published' | 'archived' | 'deleted';
export type CommunityCommentActionActor = 'admin' | 'author';

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
  archivedAt: string | null;
  archivedBy: CommunityCommentActionActor | null;
  deletedAt: string | null;
  deletedBy: CommunityCommentActionActor | null;
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
  content?: string;
  status?: CommunityCommentStatus;
  actionActor?: CommunityCommentActionActor;
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

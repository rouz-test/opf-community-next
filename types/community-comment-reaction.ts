export type CommunityCommentReactionType = 'like';

export type CommunityCommentReaction = {
  id: string;
  commentId: string;
  accountId: string;
  type: CommunityCommentReactionType;
  createdAt: string;
};

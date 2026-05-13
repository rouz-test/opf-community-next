export type CommunityContentReactionType = 'like';

export type CommunityContentReaction = {
  id: string;
  contentId: string;
  accountId: string;
  type: CommunityContentReactionType;
  createdAt: string;
};

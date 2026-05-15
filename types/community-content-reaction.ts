export type CommunityContentReactionType = 'like' | 'save';

export type CommunityContentReaction = {
  id: string;
  contentId: string;
  accountId: string;
  type: CommunityContentReactionType;
  createdAt: string;
};

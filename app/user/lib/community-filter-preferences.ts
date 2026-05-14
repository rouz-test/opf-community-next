export type CommunityViewMode = 'feed' | 'board';
export type CommunitySortMode = 'recommended' | 'latest';

export type CommunityFilterPreferences = {
  viewMode: CommunityViewMode;
  sortBy: CommunitySortMode;
  showFollowingOnly: boolean;
  selectedTags: string[];
};

export type UserCommunityPreferences = {
  accountId: string;
  community: CommunityFilterPreferences;
  updatedAt: string;
};

export const DEFAULT_COMMUNITY_FILTER_PREFERENCES: CommunityFilterPreferences = {
  viewMode: 'feed',
  sortBy: 'recommended',
  showFollowingOnly: false,
  selectedTags: [],
};

export function normalizeCommunityFilterPreferences(
  value: Partial<CommunityFilterPreferences> | null | undefined,
): CommunityFilterPreferences {
  return {
    viewMode: value?.viewMode === 'board' ? 'board' : DEFAULT_COMMUNITY_FILTER_PREFERENCES.viewMode,
    sortBy: value?.sortBy === 'latest' ? 'latest' : DEFAULT_COMMUNITY_FILTER_PREFERENCES.sortBy,
    showFollowingOnly: Boolean(value?.showFollowingOnly),
    selectedTags: Array.isArray(value?.selectedTags)
      ? value.selectedTags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      : [],
  };
}

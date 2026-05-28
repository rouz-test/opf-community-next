import { readJsonFile } from '@/lib/mock-file';
import type { UserCommunityProfile } from '@/types/user';

export const COMMUNITY_ACTIVITY_SUSPENDED_MESSAGE = '관리자에 의해 활동이 정지된 계정입니다';

const USER_COMMUNITY_PROFILES_PATH = 'data/mock/user-community-profiles.json';

export async function isAccountCommunitySuspended(accountId: string) {
  if (!accountId.trim()) return false;

  const profiles = await readJsonFile<UserCommunityProfile[]>(USER_COMMUNITY_PROFILES_PATH);
  const profile = profiles.find((item) => item.accountId === accountId);

  return Boolean(profile?.moderation?.isSuspended);
}

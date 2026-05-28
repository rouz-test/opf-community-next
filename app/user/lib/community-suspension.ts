export const COMMUNITY_ACTIVITY_SUSPENDED_MESSAGE = '관리자에 의해 활동이 정지된 계정입니다';

export async function fetchCommunitySuspensionStatus(accountId: string) {
  const response = await fetch(
    `/api/mock/users?accountId=${encodeURIComponent(accountId)}`,
    { cache: 'no-store' },
  );
  const data = (await response.json().catch(() => null)) as
    | { communityProfile?: { moderation?: { isSuspended?: boolean } | null } | null; message?: string }
    | null;

  if (!response.ok) {
    throw new Error(data?.message || '회원 정보를 확인하지 못했습니다.');
  }

  return Boolean(data?.communityProfile?.moderation?.isSuspended);
}

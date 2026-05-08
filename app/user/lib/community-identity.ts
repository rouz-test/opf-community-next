'use client';

export type CommunityIdentityMode = 'real' | 'anonymous';

export const COMMUNITY_IDENTITY_STORAGE_KEY = 'community-default-identity';
export const COMMUNITY_IDENTITY_EVENT_NAME = 'community-default-identity-change';

export function isCommunityIdentityMode(value: string | null | undefined): value is CommunityIdentityMode {
  return value === 'real' || value === 'anonymous';
}

export function normalizeLegacyCommunityIdentity(
  value: string | null | undefined,
): CommunityIdentityMode | null {
  if (value === 'nickname') {
    return 'anonymous';
  }

  return isCommunityIdentityMode(value) ? value : null;
}

export function getCommunityIdentityLabel(mode: CommunityIdentityMode) {
  return mode === 'real' ? '실명' : '익명';
}

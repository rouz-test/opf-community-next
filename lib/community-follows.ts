import { readJsonFile, writeJsonFile } from '@/lib/mock-file';

const COMMUNITY_FOLLOWS_PATH = 'data/mock/community-follows.json';

export type CommunityFollowRelation = {
  followerAccountId: string;
  followingAccountId: string;
};

export type CommunityFollowState = {
  targetAccountId: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
};

export async function readCommunityFollows() {
  try {
    return await readJsonFile<CommunityFollowRelation[]>(COMMUNITY_FOLLOWS_PATH);
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;

    if (code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

export async function writeCommunityFollows(relations: CommunityFollowRelation[]) {
  await writeJsonFile<CommunityFollowRelation[]>(COMMUNITY_FOLLOWS_PATH, relations);
}

export function getCommunityFollowState({
  relations,
  viewerAccountId,
  targetAccountId,
}: {
  relations: CommunityFollowRelation[];
  viewerAccountId: string;
  targetAccountId: string;
}): CommunityFollowState {
  return {
    targetAccountId,
    followerCount: relations.filter((relation) => relation.followingAccountId === targetAccountId).length,
    followingCount: relations.filter((relation) => relation.followerAccountId === targetAccountId).length,
    isFollowing: viewerAccountId
      ? relations.some(
          (relation) =>
            relation.followerAccountId === viewerAccountId &&
            relation.followingAccountId === targetAccountId,
        )
      : false,
  };
}

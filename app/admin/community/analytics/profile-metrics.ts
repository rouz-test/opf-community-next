import type { CommunityContent } from '@/types/community-content';
import type { CommunityCommentEntity } from '@/types/community-comment';
import type { CommunityFollowRelation } from '@/lib/community-follows';

export type CommunityProfileVisibilityCounts = {
  total: number;
  real: number;
  anonymous: number;
};

export type CommunityProfileDashboardMetric = CommunityProfileVisibilityCounts & {
  title: string;
};

export type CommunityProfileMetricMaps = {
  postMetricMap: Map<string, number>;
  commentMetricMap: Map<string, number>;
  followerMetricMap: Map<string, number>;
  followingMetricMap: Map<string, number>;
  mentionMetricMap: Map<string, number>;
};

function incrementMetric(map: Map<string, number>, accountId: string, amount = 1) {
  if (!accountId) return;

  map.set(accountId, (map.get(accountId) ?? 0) + amount);
}

function countByVisibility<T extends { author: { visibility: string } }>(items: T[]): CommunityProfileVisibilityCounts {
  const anonymous = items.filter((item) => item.author.visibility === 'anonymous').length;
  const real = items.length - anonymous;

  return {
    total: items.length,
    real,
    anonymous,
  };
}

export function getMentionedAccountIdsFromContentBody(content: CommunityContent['content']) {
  const mentionedIds = new Set<string>();

  function visit(node: CommunityContent['content']) {
    node.marks?.forEach((mark) => {
      const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '';
      const accountId = href.match(/\/user\/community\/author\/([^/?#]+)/)?.[1];

      if (accountId) {
        mentionedIds.add(accountId);
      }
    });

    node.content?.forEach(visit);
  }

  visit(content);

  return mentionedIds;
}

export function hasTextMention(content: string, displayName: string) {
  if (!displayName.trim()) return false;

  return Array.from(content.matchAll(/@([가-힣A-Za-z0-9_]{1,30})/g)).some(
    (match) => match[1]?.trim() === displayName,
  );
}

export function buildCommunityProfileMetricMaps({
  accountNameMap,
  contents,
  comments,
  commentContentIds,
  follows = [],
}: {
  accountNameMap: Map<string, string>;
  contents: CommunityContent[];
  comments: CommunityCommentEntity[];
  commentContentIds?: Iterable<string>;
  follows?: CommunityFollowRelation[];
}): CommunityProfileMetricMaps {
  const validContentIds = new Set(commentContentIds ?? contents.map((content) => content.id));
  const postMetricMap = new Map<string, number>();
  const commentMetricMap = new Map<string, number>();
  const followerMetricMap = new Map<string, number>();
  const followingMetricMap = new Map<string, number>();
  const mentionMetricMap = new Map<string, number>();

  contents.forEach((content) => {
    if (content.author.type === 'user') {
      incrementMetric(postMetricMap, content.author.id);
    }

    getMentionedAccountIdsFromContentBody(content.content).forEach((mentionedAccountId) => {
      if (mentionedAccountId !== content.author.id && accountNameMap.has(mentionedAccountId)) {
        incrementMetric(mentionMetricMap, mentionedAccountId);
      }
    });
  });

  comments.forEach((comment) => {
    if (comment.status === 'deleted') return;
    if (!validContentIds.has(comment.contentId)) return;

    if (comment.author.type === 'user') {
      incrementMetric(commentMetricMap, comment.author.id);
    }

    accountNameMap.forEach((displayName, accountId) => {
      if (accountId === comment.author.id) return;

      if (hasTextMention(comment.content, displayName)) {
        incrementMetric(mentionMetricMap, accountId);
      }
    });
  });

  follows.forEach((relation) => {
    incrementMetric(followerMetricMap, relation.followingAccountId);
    incrementMetric(followingMetricMap, relation.followerAccountId);
  });

  return {
    postMetricMap,
    commentMetricMap,
    followerMetricMap,
    followingMetricMap,
    mentionMetricMap,
  };
}

export function buildCommunityProfileDashboardMetrics({
  accountId,
  displayName,
  contents,
  comments,
}: {
  accountId: string;
  displayName: string;
  contents: CommunityContent[];
  comments: CommunityCommentEntity[];
}): CommunityProfileDashboardMetric[] {
  const visibleContentIds = new Set(contents.map((content) => content.id));
  const authoredContents = contents.filter((content) => content.author.id === accountId);
  const authoredComments = comments.filter(
    (comment) =>
      comment.author.id === accountId &&
      comment.status !== 'deleted' &&
      visibleContentIds.has(comment.contentId),
  );
  const contentMentionSources = contents.filter((content) => {
    if (content.author.id === accountId) return false;

    return getMentionedAccountIdsFromContentBody(content.content).has(accountId);
  });
  const commentMentionSources = comments.filter((comment) => {
    if (comment.author.id === accountId) return false;
    if (comment.status === 'deleted') return false;
    if (!visibleContentIds.has(comment.contentId)) return false;

    return hasTextMention(comment.content, displayName);
  });
  const mentionCounts = countByVisibility([
    ...contentMentionSources,
    ...commentMentionSources,
  ]);

  return [
    {
      title: '게시글 수',
      ...countByVisibility(authoredContents),
    },
    {
      title: '댓글 수',
      ...countByVisibility(authoredComments),
    },
    {
      title: '멘션 받은 수',
      ...mentionCounts,
    },
  ];
}

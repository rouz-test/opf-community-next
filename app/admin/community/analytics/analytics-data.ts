import communityCommentsData from '@/data/mock/community-comments.json';
import communityContentsData from '@/data/mock/community-contents.json';
import tagsData from '@/data/mock/tags.json';
import { resolveTags } from '@/lib/tags';
import type { CommunityContent } from '@/types/community-content';
import type { CommunityCommentEntity } from '@/types/community-comment';
import type { Tag } from '@/types/tag';

export type AnalyticsDateRangeKey = 'today' | '7days' | '30days' | '90days' | 'all';

export type AnalyticsSummaryCardItem = {
  title: string;
  total: string;
  realName: string;
  nickname: string;
  showIndicators?: boolean;
  children?: AnalyticsSummaryCardItem[];
};

export type AnalyticsOverviewPanel = {
  title: string;
  description: string;
  cards: AnalyticsSummaryCardItem[];
  tagItems: Array<{ label: string; count: number }>;
};

export type AnalyticsRankingItem = {
  rank: number;
  label: string;
  value: string;
  badge?: string;
};

export type AnalyticsRankingCardItem = {
  title: string;
  items: AnalyticsRankingItem[];
};

export type AnalyticsRankingSection = {
  title: string;
  description: string;
  cards: AnalyticsRankingCardItem[];
};

const contents = communityContentsData as CommunityContent[];
const comments = communityCommentsData as CommunityCommentEntity[];
const tags = tagsData as Tag[];

const NOW = new Date('2026-04-30T23:59:59+09:00');

function formatNumber(value: number) {
  return value.toLocaleString('ko-KR');
}

function formatValue(value: number, unit: '개' | '회' | '명') {
  return `${formatNumber(value)}${unit}`;
}

function isAnonymous(visibility: string) {
  return visibility === 'anonymous';
}

function isAnalyticsTargetContent(content: CommunityContent) {
  return content.status !== 'draft';
}

function getContentDate(content: CommunityContent) {
  const rawDate = content.publishedAt ?? content.createdAt;
  const parsedDate = new Date(rawDate);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function getRangeStart(dateRange: AnalyticsDateRangeKey) {
  const end = new Date(NOW);

  if (dateRange === 'today') {
    const start = new Date(end);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (dateRange === '7days') {
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (dateRange === '30days') {
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (dateRange === '90days') {
    const start = new Date(end);
    start.setDate(start.getDate() - 89);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  return null;
}

function isWithinRange(date: Date | null, dateRange: AnalyticsDateRangeKey) {
  if (!date) return false;
  const start = getRangeStart(dateRange);
  if (!start) return true;
  return date >= start && date <= NOW;
}

function getFilteredContents(dateRange: AnalyticsDateRangeKey) {
  return contents.filter(
    (content) => isAnalyticsTargetContent(content) && isWithinRange(getContentDate(content), dateRange),
  );
}

function getFilteredComments(dateRange: AnalyticsDateRangeKey) {
  const validContentIds = new Set(
    contents.filter(isAnalyticsTargetContent).map((content) => content.id),
  );

  return comments.filter((comment) => {
    if (!validContentIds.has(comment.contentId)) return false;
    if (comment.status === 'deleted') return false;

    const createdAt = new Date(comment.createdAt);
    if (Number.isNaN(createdAt.getTime())) return false;

    return isWithinRange(createdAt, dateRange);
  });
}

function splitByVisibility<T extends { author: { visibility: string } }>(items: T[]) {
  return items.reduce(
    (acc, item) => {
      if (isAnonymous(item.author.visibility)) {
        acc.anonymous.push(item);
      } else {
        acc.real.push(item);
      }
      return acc;
    },
    { real: [] as T[], anonymous: [] as T[] },
  );
}

function getOverviewTitle(dateRange: AnalyticsDateRangeKey) {
  if (dateRange === 'today') return '오늘 기준 현황';
  if (dateRange === '7days') return '최근 7일 기준 현황';
  if (dateRange === '30days') return '최근 30일 기준 현황';
  if (dateRange === '90days') return '최근 90일 기준 현황';
  return '전체 기준 현황';
}

function getOverviewDescription(dateRange: AnalyticsDateRangeKey) {
  if (dateRange === 'all') {
    return '서비스 전체 기준으로 집계된 데이터입니다.';
  }

  if (dateRange === 'today') {
    return '오늘 기준으로 집계된 데이터입니다.';
  }

  return `${getOverviewTitle(dateRange).replace(' 기준 현황', '')} 기준으로 집계된 데이터입니다.`;
}

function buildTagItems(filteredContents: CommunityContent[]) {
  const tagCountMap = new Map<string, number>();

  for (const content of filteredContents) {
    const resolvedTags = resolveTags(content.tagIds, tags, { includeInactive: true });

    for (const tag of resolvedTags) {
      tagCountMap.set(tag.name, (tagCountMap.get(tag.name) ?? 0) + 1);
    }
  }

  const sortedItems = Array.from(tagCountMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ko-KR'));

  if (sortedItems.length <= 9) {
    return sortedItems;
  }

  const primaryItems = sortedItems.slice(0, 9);
  const otherCount = sortedItems
    .slice(9)
    .reduce((sum, item) => sum + item.count, 0);

  return [...primaryItems, { label: '기타', count: otherCount }];
}

export function buildAnalyticsOverviewPanel(
  dateRange: AnalyticsDateRangeKey,
): AnalyticsOverviewPanel {
  const filteredContents = getFilteredContents(dateRange);
  const filteredComments = getFilteredComments(dateRange);
  const splitContents = splitByVisibility(filteredContents);
  const splitComments = splitByVisibility(filteredComments);

  const postTotal = filteredContents.length;
  const postReal = splitContents.real.length;
  const postAnonymous = splitContents.anonymous.length;

  const viewTotal = filteredContents.reduce((sum, content) => sum + content.stats.viewCount, 0);
  const viewReal = splitContents.real.reduce((sum, content) => sum + content.stats.viewCount, 0);
  const viewAnonymous = splitContents.anonymous.reduce(
    (sum, content) => sum + content.stats.viewCount,
    0,
  );

  const archivedContents = filteredContents.filter((content) => content.status === 'archived');
  const archivedSplit = splitByVisibility(archivedContents);

  const commentTotal = filteredComments.length;
  const commentReal = splitComments.real.length;
  const commentAnonymous = splitComments.anonymous.length;

  const rootComments = filteredComments.filter((comment) => comment.parentId === null);
  const rootSplit = splitByVisibility(rootComments);
  const replies = filteredComments.filter((comment) => comment.parentId !== null);
  const replySplit = splitByVisibility(replies);

  const likeTotal = filteredContents.reduce((sum, content) => sum + content.stats.likeCount, 0);
  const likeReal = splitContents.real.reduce((sum, content) => sum + content.stats.likeCount, 0);
  const likeAnonymous = splitContents.anonymous.reduce(
    (sum, content) => sum + content.stats.likeCount,
    0,
  );

  const saveTotal = filteredContents.reduce((sum, content) => sum + content.stats.saveCount, 0);
  const saveReal = splitContents.real.reduce((sum, content) => sum + content.stats.saveCount, 0);
  const saveAnonymous = splitContents.anonymous.reduce(
    (sum, content) => sum + content.stats.saveCount,
    0,
  );

  const pausedItems = [
    ...filteredContents.filter((content) => content.status === 'archived'),
    ...filteredComments.filter((comment) => comment.status === 'archived'),
  ];
  const pausedReal = pausedItems.filter((item) => !isAnonymous(item.author.visibility)).length;
  const pausedAnonymous = pausedItems.filter((item) => isAnonymous(item.author.visibility)).length;

  return {
    title: getOverviewTitle(dateRange),
    description: getOverviewDescription(dateRange),
    cards: [
      {
        title: '게시글',
        total: formatValue(postTotal, '개'),
        realName: formatValue(postReal, '개'),
        nickname: formatValue(postAnonymous, '개'),
        children: [
          {
            title: '조회 수',
            total: formatValue(viewTotal, '회'),
            realName: formatValue(viewReal, '회'),
            nickname: formatValue(viewAnonymous, '회'),
          },
          {
            title: '보관 게시글',
            total: formatValue(archivedContents.length, '개'),
            realName: formatValue(archivedSplit.real.length, '개'),
            nickname: formatValue(archivedSplit.anonymous.length, '개'),
          },
        ],
      },
      {
        title: '댓글 · 대댓글',
        total: formatValue(commentTotal, '개'),
        realName: formatValue(commentReal, '개'),
        nickname: formatValue(commentAnonymous, '개'),
        children: [
          {
            title: '일반 댓글',
            total: formatValue(rootComments.length, '개'),
            realName: formatValue(rootSplit.real.length, '개'),
            nickname: formatValue(rootSplit.anonymous.length, '개'),
          },
          {
            title: '대댓글',
            total: formatValue(replies.length, '개'),
            realName: formatValue(replySplit.real.length, '개'),
            nickname: formatValue(replySplit.anonymous.length, '개'),
          },
        ],
      },
      {
        title: '전체 반응 수',
        total: formatValue(likeTotal + saveTotal, '개'),
        realName: formatValue(likeReal + saveReal, '개'),
        nickname: formatValue(likeAnonymous + saveAnonymous, '개'),
        showIndicators: false,
        children: [
          {
            title: '좋아요 수',
            total: formatValue(likeTotal, '개'),
            realName: formatValue(likeReal, '개'),
            nickname: formatValue(likeAnonymous, '개'),
            showIndicators: false,
          },
          {
            title: '저장 수',
            total: formatValue(saveTotal, '개'),
            realName: formatValue(saveReal, '개'),
            nickname: formatValue(saveAnonymous, '개'),
            showIndicators: false,
          },
        ],
      },
      {
        title: '활동 정지',
        total: formatValue(pausedItems.length, '개'),
        realName: formatValue(pausedReal, '개'),
        nickname: formatValue(pausedAnonymous, '개'),
      },
    ],
    tagItems: buildTagItems(filteredContents),
  };
}

function createRankingItems(
  filteredContents: CommunityContent[],
  metric: (content: CommunityContent) => number,
  unit: '개' | '회',
  includeBadge: boolean,
): AnalyticsRankingItem[] {
  return [...filteredContents]
    .sort((a, b) => metric(b) - metric(a))
    .slice(0, 10)
    .map((content, index) => ({
      rank: index + 1,
      label: content.title,
      value: formatValue(metric(content), unit),
      badge: includeBadge ? (isAnonymous(content.author.visibility) ? '익명' : '실명') : undefined,
    }));
}

export function buildContentRankingSections(
  dateRange: AnalyticsDateRangeKey,
): AnalyticsRankingSection[] {
  const filteredContents = getFilteredContents(dateRange);
  const splitContents = splitByVisibility(filteredContents);

  const createCards = (
    metric: (content: CommunityContent) => number,
    unit: '개' | '회',
  ): AnalyticsRankingCardItem[] => [
    {
      title: '전체',
      items: createRankingItems(filteredContents, metric, unit, true),
    },
    {
      title: '실명',
      items: createRankingItems(splitContents.real, metric, unit, false),
    },
    {
      title: '익명',
      items: createRankingItems(splitContents.anonymous, metric, unit, false),
    },
  ];

  return [
    {
      title: '최다 조회 게시글',
      description: '조회 수 기준 상위 게시글입니다.',
      cards: createCards((content) => content.stats.viewCount, '회'),
    },
    {
      title: '최다 댓글 · 대댓글 등록 게시글',
      description: '댓글 및 대댓글 수 기준 상위 게시글입니다.',
      cards: createCards(
        (content) => content.stats.commentCount + content.stats.replyCount,
        '개',
      ),
    },
    {
      title: '최다 좋아요 게시글',
      description: '좋아요 수 기준 상위 게시글입니다.',
      cards: createCards((content) => content.stats.likeCount, '개'),
    },
    {
      title: '최다 저장 게시글',
      description: '저장 수 기준 상위 게시글입니다.',
      cards: createCards((content) => content.stats.saveCount, '개'),
    },
  ];
}

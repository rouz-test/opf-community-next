import communityCommentsData from '@/data/mock/community-comments.json';
import communityContentReactionsData from '@/data/mock/community-content-reactions.json';
import communityContentsData from '@/data/mock/community-contents.json';
import tagsData from '@/data/mock/tags.json';
import { orangePickArticles } from '@/data/mockCommunityPosts';
import { resolveTags } from '@/lib/tags';
import type { CommunityContent, CommunityContentBody } from '@/types/community-content';
import type { CommunityComment, CommunityCommentEntity } from '@/types/community-comment';
import type { CommunityContentReaction } from '@/types/community-content-reaction';
import type { Tag } from '@/types/tag';

export type CommunityProfileMode = 'real' | 'anonymous';

export interface CommunityIdentity {
  id: string;
  accountId?: string;
  profileId?: string;
  mode?: CommunityProfileMode;
}

export interface CommunityProfile extends CommunityIdentity {
  name: string;
  nickname: string;
  avatar: string;
  position?: string;
}

export interface CommunityInteractionAuthor extends CommunityProfile {
  isFollowing?: boolean;
}

export interface HighlightedComment {
  id: string;
  author: CommunityInteractionAuthor;
  content: string;
  createdAt: string;
  likes: number;
  replyCount: number;
}

export interface CommunityPost {
  id: string;
  type: 'study' | 'community' | 'notice';
  studyId?: string;
  studyTitle?: string;
  title: string;
  content: string;
  author: CommunityProfile;
  createdAt: string;
  updatedAt?: string;
  views: number;
  likes: number;
  saves: number;
  commentCount: number;
  isLikedByMe: boolean;
  isSavedByMe: boolean;
  tags?: string[];
  images?: string[];
  isNotice?: boolean;
  isPinned?: boolean;
  isHighlight?: boolean;
  isPromotion?: boolean;
  isRealName?: boolean;
  isHiddenByAuthor?: boolean;
  highlightedComment?: HighlightedComment;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  author: CommunityInteractionAuthor;
  content: string;
  createdAt: string;
  likes: number;
  isLikedByMe: boolean;
  replies?: Comment[];
}

const contents = communityContentsData as CommunityContent[];
const commentEntities = communityCommentsData as CommunityCommentEntity[];
const contentReactions = communityContentReactionsData as CommunityContentReaction[];
const tags = tagsData as Tag[];

const DEFAULT_REAL_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';

const ANONYMOUS_AVATAR = '';

export const COMMUNITY_CURRENT_USER = {
  accountId: 'account-user-1',
  name: '박민수',
  nickname: 'StartupHero',
  avatar:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  position: '스타트업 개발자',
  postsCount: 12,
  commentsCount: 45,
};

const publishedContents = contents.filter(
  (content) => content.status === 'published' && !content.flags?.isHiddenByAuthor,
);

function extractTextFromContentBody(node?: CommunityContentBody | null): string {
  if (!node) return '';

  const parts: string[] = [];

  const visit = (currentNode?: CommunityContentBody | null) => {
    if (!currentNode) return;

    if (typeof currentNode.text === 'string' && currentNode.text.trim()) {
      parts.push(currentNode.text);
    }

    currentNode.content?.forEach((childNode) => visit(childNode));
  };

  visit(node);

  return parts.join(' ').trim();
}

function sortByCreatedAtAsc<T extends { createdAt: string }>(left: T, right: T) {
  return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
}

function buildCommunityCommentThreads(
  comments: CommunityCommentEntity[],
  contentId: string,
): CommunityComment[] {
  const scopedComments = comments
    .filter((comment) => comment.contentId === contentId)
    .sort(sortByCreatedAtAsc);

  const nodeMap = new Map<string, CommunityComment>();
  const rootNodes: CommunityComment[] = [];

  for (const comment of scopedComments) {
    nodeMap.set(comment.id, {
      ...comment,
      replies: [],
      replyCount: 0,
    });
  }

  for (const comment of scopedComments) {
    const node = nodeMap.get(comment.id);
    if (!node) continue;

    if (comment.parentId) {
      const parentNode = nodeMap.get(comment.parentId);
      if (parentNode) {
        parentNode.replies.push(node);
        continue;
      }
    }

    rootNodes.push(node);
  }

  for (const node of nodeMap.values()) {
    node.replies.sort(sortByCreatedAtAsc);
    node.replyCount = node.replies.length;
  }

  rootNodes.sort(sortByCreatedAtAsc);
  return rootNodes;
}

function getAuthorMode(visibility: CommunityContent['author']['visibility']): CommunityProfileMode {
  return visibility === 'anonymous' ? 'anonymous' : 'real';
}

function getDisplayName(contentAuthor: CommunityContent['author']) {
  if (contentAuthor.type === 'admin') {
    return '관리자';
  }

  if (contentAuthor.visibility === 'anonymous') {
    return '익명';
  }

  return contentAuthor.displayName;
}

function getNickname(contentAuthor: CommunityContent['author']) {
  if (contentAuthor.visibility === 'anonymous') {
    return '익명';
  }

  return contentAuthor.identifierValue || contentAuthor.displayName;
}

function extractImageSources(node?: CommunityContentBody | null): string[] {
  if (!node) return [];

  const foundSources: string[] = [];

  const visit = (currentNode: CommunityContentBody) => {
    if (currentNode.type === 'image' && typeof currentNode.attrs?.src === 'string') {
      foundSources.push(currentNode.attrs.src);
    }

    currentNode.content?.forEach(visit);
  };

  visit(node);
  return foundSources;
}

function mapContentAuthor(author: CommunityContent['author']): CommunityProfile {
  const mode = getAuthorMode(author.visibility);

  return {
    id: author.id,
    accountId: author.id,
    profileId: author.id,
    mode,
    name: getDisplayName(author),
    nickname: getNickname(author),
    avatar: mode === 'real' ? DEFAULT_REAL_AVATAR : ANONYMOUS_AVATAR,
    position: author.type === 'admin' ? '커뮤니티 관리자' : undefined,
  };
}

function mapCommentAuthor(author: CommunityCommentEntity['author']): CommunityInteractionAuthor {
  const mode = getAuthorMode(author.visibility);

  return {
    id: author.id,
    accountId: author.id,
    profileId: author.id,
    mode,
    name: author.visibility === 'anonymous' ? '익명' : author.displayName,
    nickname: author.visibility === 'anonymous' ? '익명' : author.identifierValue || author.displayName,
    avatar: mode === 'real' ? author.avatar || DEFAULT_REAL_AVATAR : ANONYMOUS_AVATAR,
    isFollowing: false,
  };
}

function mapThreadComment(comment: CommunityComment): Comment {
  return {
    id: comment.id,
    postId: comment.contentId,
    parentId: comment.parentId ?? undefined,
    author: mapCommentAuthor(comment.author),
    content: comment.content,
    createdAt: comment.createdAt,
    likes: comment.likeCount,
    isLikedByMe: comment.isLikedByMe,
    replies: comment.replies.map(mapThreadComment),
  };
}

function buildHighlightedComment(contentId: string): HighlightedComment | undefined {
  const threads = buildCommunityCommentThreads(commentEntities, contentId);
  const scoped = threads.flatMap((thread) => [thread, ...thread.replies]);

  if (scoped.length === 0) {
    return undefined;
  }

  const selected = [...scoped].sort((left, right) => {
    if (right.likeCount !== left.likeCount) {
      return right.likeCount - left.likeCount;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  })[0];

  return {
    id: selected.id,
    author: mapCommentAuthor(selected.author),
    content: selected.content,
    createdAt: selected.createdAt,
    likes: selected.likeCount,
    replyCount: selected.replies.length,
  };
}

function isLikedByCurrentUser(contentId: string) {
  return contentReactions.some(
    (reaction) =>
      reaction.type === 'like' &&
      reaction.contentId === contentId &&
      reaction.accountId === COMMUNITY_CURRENT_USER.accountId,
  );
}

function isSavedByCurrentUser(contentId: string) {
  return contentReactions.some(
    (reaction) =>
      reaction.type === 'save' &&
      reaction.contentId === contentId &&
      reaction.accountId === COMMUNITY_CURRENT_USER.accountId,
  );
}

export function mapCommunityContentToPost(content: CommunityContent): CommunityPost {
  const resolvedTags = resolveTags(content.tagIds, tags).map((tag) => tag.name);
  const mappedType = content.flags.isNotice ? 'notice' : 'community';
  const author = mapContentAuthor(content.author);

  return {
    id: content.id,
    type: mappedType,
    title: content.title,
    content: extractTextFromContentBody(content.content).trim(),
    author,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
    views: content.stats.viewCount,
    likes: content.stats.likeCount,
    saves: content.stats.saveCount,
    commentCount: content.stats.commentCount + content.stats.replyCount,
    isLikedByMe: content.viewerState?.isLikedByMe ?? isLikedByCurrentUser(content.id),
    isSavedByMe: content.viewerState?.isSavedByMe ?? isSavedByCurrentUser(content.id),
    tags: resolvedTags,
    images: extractImageSources(content.content),
    isNotice: content.flags.isNotice,
    isPinned: content.flags.isPinned,
    isHighlight: content.flags.isNotice || content.flags.isPinned,
    isPromotion: content.flags.isPromoted,
    isRealName: author.mode === 'real',
    isHiddenByAuthor: Boolean(content.flags.isHiddenByAuthor),
    highlightedComment: buildHighlightedComment(content.id),
  };
}

function sortByCreatedAtDesc<T extends { createdAt: string }>(left: T, right: T) {
  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}

const mappedPosts = publishedContents.map(mapCommunityContentToPost).sort(sortByCreatedAtDesc);

export const mockNotices = mappedPosts.filter((post) => post.type === 'notice');
export const mockCommunityPosts = mappedPosts.filter((post) => post.type !== 'notice');

export const mockComments = publishedContents.flatMap((content) =>
  buildCommunityCommentThreads(commentEntities, content.id).map(mapThreadComment),
);

export function getCommunityPostById(postId: string) {
  return [...mockNotices, ...mockCommunityPosts].find((post) => post.id === postId);
}

export function getCommentsByPostId(postId: string) {
  return mockComments.filter((comment) => comment.postId === postId);
}

export { orangePickArticles };

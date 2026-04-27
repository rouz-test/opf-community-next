import { readJsonFile, writeJsonFile } from '@/lib/mock-file';
import type { CommunityContent } from '@/types/community-content';
import type {
  CommunityComment,
  CommunityCommentAuthor,
  CommunityCommentEntity,
  CommunityContentCommentStats,
} from '@/types/community-comment';

const COMMUNITY_CONTENTS_PATH = 'data/mock/community-contents.json';
const COMMUNITY_COMMENTS_PATH = 'data/mock/community-comments.json';

export const DEFAULT_ADMIN_COMMENT_AUTHOR: CommunityCommentAuthor = {
  type: 'admin',
  id: 'admin-1',
  visibility: 'public',
  displayName: '관리자',
  identifierType: 'email',
  identifierValue: 'admin@comasoft.io',
};

function sortByCreatedAtAsc<T extends { createdAt: string }>(a: T, b: T) {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

export async function readCommunityComments() {
  return readJsonFile<CommunityCommentEntity[]>(COMMUNITY_COMMENTS_PATH);
}

export async function writeCommunityComments(comments: CommunityCommentEntity[]) {
  await writeJsonFile(COMMUNITY_COMMENTS_PATH, comments);
}

export async function readCommunityContents() {
  return readJsonFile<CommunityContent[]>(COMMUNITY_CONTENTS_PATH);
}

export function calculateCommunityCommentStats(
  comments: CommunityCommentEntity[],
  contentId: string,
): CommunityContentCommentStats {
  const scopedComments = comments.filter((comment) => comment.contentId === contentId);
  const commentCount = scopedComments.filter((comment) => comment.parentId === null).length;
  const replyCount = scopedComments.filter((comment) => comment.parentId !== null).length;

  return {
    commentCount,
    replyCount,
    totalCount: commentCount + replyCount,
  };
}

export function buildCommunityCommentThreads(
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

export async function syncCommunityContentCommentStats(
  contentId: string,
  comments?: CommunityCommentEntity[],
) {
  const [contents, nextComments] = await Promise.all([
    readCommunityContents(),
    comments ? Promise.resolve(comments) : readCommunityComments(),
  ]);

  const targetIndex = contents.findIndex((content) => content.id === contentId);
  if (targetIndex === -1) return null;

  const stats = calculateCommunityCommentStats(nextComments, contentId);
  const nextContents = [...contents];
  nextContents[targetIndex] = {
    ...nextContents[targetIndex],
    stats: {
      ...nextContents[targetIndex].stats,
      commentCount: stats.commentCount,
      replyCount: stats.replyCount,
    },
  };

  await writeJsonFile(COMMUNITY_CONTENTS_PATH, nextContents);

  return {
    content: nextContents[targetIndex],
    stats,
  };
}

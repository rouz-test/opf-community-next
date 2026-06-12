import { readJsonFile, writeJsonFile } from '@/lib/mock-file';
import type { CommunityContent, CommunityContentAuthor } from '@/types/community-content';
import type { CommunityCommentAuthor } from '@/types/community-comment';
import type { UserAccount } from '@/types/user';

const NOTIFICATIONS_PATH = 'data/mock/community-notifications.json';
const USERS_PATH = 'data/mock/users.json';
const DEFAULT_REAL_AVATAR = '/images/profiles/real-medium.png';
const DEFAULT_ANONYMOUS_AVATAR = '/images/profiles/anonymous-medium.png';

export type CommunityNotificationType = 'comment' | 'reply' | 'mention' | 'follow' | 'notice';

export type CommunityNotificationActor = {
  accountId: string | null;
  name: string;
  profileType: 'real' | 'anonymous' | 'system';
  avatar: string;
};

export type CommunityNotificationTarget = {
  contentId?: string;
  commentId?: string;
  href?: string;
};

export type CommunityNotification = {
  id: string;
  receiverAccountId: string;
  type: CommunityNotificationType;
  actor: CommunityNotificationActor;
  title: string;
  summary: string;
  target: CommunityNotificationTarget | null;
  createdAt: string;
  readAt: string | null;
};

export type CreateNotificationInput = {
  receiverAccountId: string;
  type: CommunityNotificationType;
  actor: CommunityNotificationActor;
  title: string;
  summary: string;
  target: CommunityNotificationTarget | null;
  createdAt?: string;
  dedupeKey?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function readCommunityNotifications() {
  try {
    return await readJsonFile<CommunityNotification[]>(NOTIFICATIONS_PATH);
  } catch (error) {
    const code = isObject(error) && 'code' in error ? error.code : null;

    if (code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

export async function writeCommunityNotifications(notifications: CommunityNotification[]) {
  await writeJsonFile<CommunityNotification[]>(NOTIFICATIONS_PATH, notifications);
}

export async function readNotificationUsers() {
  try {
    return await readJsonFile<UserAccount[]>(USERS_PATH);
  } catch {
    return [];
  }
}

export function createInitialNotifications(accountId: string): CommunityNotification[] {
  const now = new Date();
  const toIso = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();

  return [
    {
      id: `community-notification-${accountId}-comment-1`,
      receiverAccountId: accountId,
      type: 'comment',
      actor: {
        accountId: 'account-user-1',
        name: '박민수',
        profileType: 'real',
        avatar: DEFAULT_REAL_AVATAR,
      },
      title: '박민수님이 회원님의 게시글에 댓글을 남겼습니다.',
      summary: '작성자 동일 체크입니다',
      target: {
        contentId: 'community-content-001',
        href: '/user/community/post/community-content-001',
      },
      createdAt: toIso(3),
      readAt: null,
    },
    {
      id: `community-notification-${accountId}-mention-1`,
      receiverAccountId: accountId,
      type: 'mention',
      actor: {
        accountId: 'user-11',
        name: '김민준',
        profileType: 'real',
        avatar: DEFAULT_REAL_AVATAR,
      },
      title: '김민준님이 댓글에서 회원님을 멘션했습니다.',
      summary: '@회원님 의견이 궁금해요.',
      target: {
        contentId: 'community-content-002',
        commentId: 'community-comment-002',
        href: '/user/community/post/community-content-002',
      },
      createdAt: toIso(15),
      readAt: null,
    },
    {
      id: `community-notification-${accountId}-follow-1`,
      receiverAccountId: accountId,
      type: 'follow',
      actor: {
        accountId: 'user-22',
        name: '최지훈',
        profileType: 'real',
        avatar: DEFAULT_REAL_AVATAR,
      },
      title: '최지훈님이 회원님을 팔로우했습니다.',
      summary: '새로운 팔로워가 생겼습니다.',
      target: null,
      createdAt: toIso(62),
      readAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
    },
  ];
}

export function createNotificationActor(author: CommunityCommentAuthor): CommunityNotificationActor {
  if (author.visibility === 'anonymous') {
    return {
      accountId: author.id || null,
      name: '익명',
      profileType: 'anonymous',
      avatar: DEFAULT_ANONYMOUS_AVATAR,
    };
  }

  return {
    accountId: author.id || null,
    name: author.displayName,
    profileType: author.type === 'admin' ? 'system' : 'real',
    avatar: author.avatar || DEFAULT_REAL_AVATAR,
  };
}

export function createUserNotificationActor(account: UserAccount): CommunityNotificationActor {
  return {
    accountId: account.accountId,
    name: account.verification.realName,
    profileType: 'real',
    avatar: account.profile.avatar || DEFAULT_REAL_AVATAR,
  };
}

export function createContentNotificationActor(
  author: CommunityContentAuthor,
  users: UserAccount[] = [],
): CommunityNotificationActor {
  if (author.visibility === 'anonymous') {
    return {
      accountId: author.id || null,
      name: '익명',
      profileType: 'anonymous',
      avatar: DEFAULT_ANONYMOUS_AVATAR,
    };
  }

  if (author.type === 'admin') {
    return {
      accountId: author.id || null,
      name: author.displayName || '오렌지파크',
      profileType: 'system',
      avatar: DEFAULT_REAL_AVATAR,
    };
  }

  const account = users.find((user) => user.accountId === author.id);

  return {
    accountId: author.id || null,
    name: account?.verification.realName ?? author.displayName,
    profileType: 'real',
    avatar: account?.profile.avatar || DEFAULT_REAL_AVATAR,
  };
}

export function getNotificationTarget(contentId: string, commentId?: string): CommunityNotificationTarget {
  return {
    contentId,
    ...(commentId ? { commentId } : {}),
    href: `/user/community/post/${contentId}${commentId ? `#${commentId}` : ''}`,
  };
}

export function getMentionedAccountIdsFromText(content: string, users: UserAccount[]) {
  const mentionedNames = new Set(
    Array.from(content.matchAll(/@([가-힣A-Za-z0-9_]{1,30})/g))
      .map((match) => match[1]?.trim())
      .filter(Boolean),
  );

  if (mentionedNames.size === 0) return [];

  return users
    .filter((user) => user.status === 'active' && mentionedNames.has(user.verification.realName))
    .map((user) => user.accountId);
}

export function getMentionedAccountIdsFromContent(content: CommunityContent['content'], users: UserAccount[]) {
  const mentionedIds = new Set<string>();
  const userIds = new Set(users.filter((user) => user.status === 'active').map((user) => user.accountId));

  function visit(node: CommunityContent['content']) {
    node.marks?.forEach((mark) => {
      const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '';
      const accountId = href.match(/\/user\/community\/author\/([^/?#]+)/)?.[1];

      if (accountId && userIds.has(accountId)) {
        mentionedIds.add(accountId);
      }
    });

    node.content?.forEach(visit);
  }

  visit(content);

  return Array.from(mentionedIds);
}

export async function appendCommunityNotifications(inputs: CreateNotificationInput[]) {
  if (inputs.length === 0) return;

  const notifications = await readCommunityNotifications();
  const existingDedupeKeys = new Set(notifications.map((notification) => notification.id));
  const nextItems = inputs.flatMap((input) => {
    if (!input.receiverAccountId || input.receiverAccountId === input.actor.accountId) return [];

    const id = input.dedupeKey ?? `community-notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (existingDedupeKeys.has(id)) return [];

    existingDedupeKeys.add(id);

    return [
      {
        id,
        receiverAccountId: input.receiverAccountId,
        type: input.type,
        actor: input.actor,
        title: input.title,
        summary: input.summary,
        target: input.target,
        createdAt: input.createdAt ?? new Date().toISOString(),
        readAt: null,
      },
    ];
  });

  if (nextItems.length === 0) return;

  await writeCommunityNotifications([...notifications, ...nextItems]);
}

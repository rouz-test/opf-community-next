import { NextRequest, NextResponse } from 'next/server';

import { resolveMockAuthAccountId } from '@/app/api/mock/_utils/mock-auth-session';
import {
  type CommunityNotification,
  readCommunityNotifications,
  writeCommunityNotifications,
} from '@/app/api/mock/_utils/community-notifications';
import { readJsonFile } from '@/lib/mock-file';
import type { CommunityContent } from '@/types/community-content';

type CommunityNotificationPatchBody = {
  notificationId?: unknown;
  notificationIds?: unknown;
  markAllAsRead?: unknown;
};

async function readCommunityContentIds() {
  try {
    const contents = await readJsonFile<CommunityContent[]>('data/mock/community-contents.json');

    return new Set(contents.map((content) => content.id));
  } catch {
    // 콘텐츠 목록을 확인할 수 없는 경우 알림 조회 자체를 막지는 않습니다.
    return null;
  }
}

async function getReachableNotifications(notifications: CommunityNotification[]) {
  const contentIds = await readCommunityContentIds();

  if (!contentIds) return notifications;

  return notifications.filter((notification) => {
    const contentId = notification.target?.contentId;

    return !contentId || contentIds.has(contentId);
  });
}

function getNotificationIds(body: CommunityNotificationPatchBody | null) {
  const ids = new Set<string>();

  if (typeof body?.notificationId === 'string' && body.notificationId.trim()) {
    ids.add(body.notificationId.trim());
  }

  if (Array.isArray(body?.notificationIds)) {
    body.notificationIds.forEach((value) => {
      if (typeof value === 'string' && value.trim()) {
        ids.add(value.trim());
      }
    });
  }

  return ids;
}

export async function GET(request: NextRequest) {
  try {
    const accountId = await resolveMockAuthAccountId(
      request,
      request.nextUrl.searchParams.get('accountId')?.trim() ?? '',
    );

    if (!accountId) {
      return NextResponse.json({ message: '회원 정보가 필요합니다.' }, { status: 401 });
    }

    const notifications = await getReachableNotifications(await readCommunityNotifications());
    const scopedNotifications = notifications
      .filter((notification) => notification.receiverAccountId === accountId)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
    const items = scopedNotifications;
    const unreadCount = items.filter((notification) => !notification.readAt).length;

    return NextResponse.json(
      {
        items,
        unreadCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[GET /api/mock/community-notifications] failed:', error);
    return NextResponse.json({ message: '알림을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const accountId = await resolveMockAuthAccountId(
      request,
      request.nextUrl.searchParams.get('accountId')?.trim() ?? '',
    );

    if (!accountId) {
      return NextResponse.json({ message: '회원 정보가 필요합니다.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as CommunityNotificationPatchBody | null;
    const notificationIds = getNotificationIds(body);
    const shouldMarkAllAsRead = body?.markAllAsRead === true;

    if (!shouldMarkAllAsRead && notificationIds.size === 0) {
      return NextResponse.json({ message: '읽음 처리할 알림 정보가 필요합니다.' }, { status: 400 });
    }

    const initialNotifications = await readCommunityNotifications();
    const now = new Date().toISOString();
    const nextNotifications = initialNotifications.map((notification) => {
      const shouldMark =
        notification.receiverAccountId === accountId &&
        (shouldMarkAllAsRead || notificationIds.has(notification.id));

      if (!shouldMark || notification.readAt) {
        return notification;
      }

      return {
        ...notification,
        readAt: now,
      };
    });

    await writeCommunityNotifications(nextNotifications);

    const items = (await getReachableNotifications(nextNotifications))
      .filter((notification) => notification.receiverAccountId === accountId)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

    return NextResponse.json(
      {
        items,
        unreadCount: items.filter((notification) => !notification.readAt).length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[PATCH /api/mock/community-notifications] failed:', error);
    return NextResponse.json({ message: '알림을 읽음 처리하지 못했습니다.' }, { status: 500 });
  }
}

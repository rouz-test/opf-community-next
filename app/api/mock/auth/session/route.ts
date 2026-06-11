import { NextRequest, NextResponse } from 'next/server';

import {
  clearMockAuthSessionCookie,
  mapUserAccountToMockAuthProfile,
  MOCK_AUTH_SESSION_COOKIE,
  readMockAuthUsers,
  resolveMockAuthAccount,
  setMockAuthSessionCookie,
} from '@/app/api/mock/_utils/mock-auth-session';

type LoginRequestBody = {
  accountId?: unknown;
};

function createSessionPayload({
  isLoggedIn,
  currentAccount,
}: {
  isLoggedIn: boolean;
  currentAccount: Awaited<ReturnType<typeof resolveMockAuthAccount>>;
}) {
  return {
    isLoggedIn,
    currentUser: currentAccount ? mapUserAccountToMockAuthProfile(currentAccount) : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const currentAccount = await resolveMockAuthAccount(request, '', {
      allowDefaultFallback: true,
    });
    const hasSessionCookie = Boolean(request.cookies.get(MOCK_AUTH_SESSION_COOKIE)?.value);

    return NextResponse.json(createSessionPayload({ isLoggedIn: hasSessionCookie, currentAccount }), {
      status: 200,
    });
  } catch (error) {
    console.error('[GET /api/mock/auth/session] failed:', error);
    return NextResponse.json({ message: '로그인 세션을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as LoginRequestBody | null;
    const accountId = typeof body?.accountId === 'string' ? body.accountId.trim() : '';

    if (!accountId) {
      return NextResponse.json({ message: '로그인할 계정 정보가 필요합니다.' }, { status: 400 });
    }

    const users = await readMockAuthUsers();
    const currentAccount = users.find((user) => user.accountId === accountId);

    if (!currentAccount) {
      return NextResponse.json({ message: '로그인할 수 없는 계정입니다.' }, { status: 404 });
    }

    const response = NextResponse.json(
      createSessionPayload({ isLoggedIn: true, currentAccount }),
      { status: 200 },
    );
    setMockAuthSessionCookie(response, currentAccount.accountId);

    return response;
  } catch (error) {
    console.error('[POST /api/mock/auth/session] failed:', error);
    return NextResponse.json({ message: '로그인 세션을 저장하지 못했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentAccount = await resolveMockAuthAccount(request, '', {
      allowDefaultFallback: true,
    });
    const response = NextResponse.json(
      createSessionPayload({ isLoggedIn: false, currentAccount }),
      { status: 200 },
    );
    clearMockAuthSessionCookie(response);

    return response;
  } catch (error) {
    console.error('[DELETE /api/mock/auth/session] failed:', error);
    return NextResponse.json({ message: '로그아웃을 처리하지 못했습니다.' }, { status: 500 });
  }
}

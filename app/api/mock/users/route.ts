import { NextRequest, NextResponse } from 'next/server';

import { resolveMockAuthAccountId } from '@/app/api/mock/_utils/mock-auth-session';
import { readCommunityFollows, type CommunityFollowRelation } from '@/lib/community-follows';
import { readJsonFile, writeJsonFile } from '@/lib/mock-file';
import type {
  UserAccount,
  UserAdminNote,
  UserCampusProfile,
  UserCommunityProfile,
  UserProduct,
  UserProfileBundle,
} from '@/types/user';

const USERS_PATH = 'data/mock/users.json';
const USER_PRODUCTS_PATH = 'data/mock/user-products.json';
const USER_COMMUNITY_PROFILES_PATH = 'data/mock/user-community-profiles.json';
const USER_CAMPUS_PROFILES_PATH = 'data/mock/user-campus-profiles.json';
const USER_ADMIN_NOTES_PATH = 'data/mock/user-admin-notes.json';

async function readMockList<T>(path: string) {
  try {
    return await readJsonFile<T[]>(path);
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;

    if (code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

function getAccountId(request: NextRequest) {
  return request.nextUrl.searchParams.get('accountId')?.trim() ?? '';
}

type UpdateUserProfileRequestBody = {
  accountId?: unknown;
  profile?: {
    avatar?: unknown;
    company?: unknown;
    position?: unknown;
  };
};

function canIncludeAdminNotes(request: NextRequest) {
  return (
    request.nextUrl.searchParams.get('includeAdminNotes') === 'true' &&
    request.nextUrl.searchParams.get('viewerRole') === 'admin'
  );
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

function getSearchKeyword(request: NextRequest) {
  return request.nextUrl.searchParams.get('search')?.trim().toLowerCase() ?? '';
}

function matchesUserSearch(account: UserAccount, searchKeyword: string) {
  if (!searchKeyword) return true;

  return [
    account.verification.realName,
    account.verification.phoneNumber,
    account.auth.socialEmail,
    account.profile.company,
    account.profile.position,
  ]
    .join(' ')
    .toLowerCase()
    .includes(searchKeyword);
}

function sortProductsByRecent(products: UserProduct[]) {
  return [...products].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function resolveCommunityProfileStats(
  profile: UserCommunityProfile | null,
  follows: CommunityFollowRelation[],
) {
  if (!profile) return null;

  return {
    ...profile,
    stats: {
      ...profile.stats,
      followerCount: follows.filter((relation) => relation.followingAccountId === profile.accountId).length,
      followingCount: follows.filter((relation) => relation.followerAccountId === profile.accountId).length,
    },
  };
}

function createUserProfileBundle({
  account,
  products,
  communityProfiles,
  campusProfiles,
  adminNotes,
  follows,
  includeAdminNotes,
}: {
  account: UserAccount;
  products: UserProduct[];
  communityProfiles: UserCommunityProfile[];
  campusProfiles: UserCampusProfile[];
  adminNotes: UserAdminNote[];
  follows: CommunityFollowRelation[];
  includeAdminNotes: boolean;
}): UserProfileBundle {
  const scopedProducts = sortProductsByRecent(
    products.filter((product) => product.ownerAccountId === account.accountId),
  );
  const communityProfile =
    communityProfiles.find((profile) => profile.accountId === account.accountId) ?? null;

  return {
    account,
    products: scopedProducts,
    primaryProduct: scopedProducts.find((product) => product.status === 'published') ?? scopedProducts[0] ?? null,
    communityProfile: resolveCommunityProfileStats(communityProfile, follows),
    campusProfile:
      campusProfiles.find((profile) => profile.accountId === account.accountId) ?? null,
    ...(includeAdminNotes
      ? {
          adminNotes: adminNotes.filter((note) => note.accountId === account.accountId),
        }
      : {}),
  };
}

export async function GET(request: NextRequest) {
  try {
    const accountId = getAccountId(request);
    const includeAdminNotes = canIncludeAdminNotes(request);
    const searchKeyword = getSearchKeyword(request);
    const requestedPage = parsePositiveInteger(request.nextUrl.searchParams.get('page'), 1);
    const requestedPageSize = parsePositiveInteger(request.nextUrl.searchParams.get('pageSize'), 10);

    const [accounts, products, communityProfiles, campusProfiles, adminNotes, follows] = await Promise.all([
      readMockList<UserAccount>(USERS_PATH),
      readMockList<UserProduct>(USER_PRODUCTS_PATH),
      readMockList<UserCommunityProfile>(USER_COMMUNITY_PROFILES_PATH),
      readMockList<UserCampusProfile>(USER_CAMPUS_PROFILES_PATH),
      includeAdminNotes ? readMockList<UserAdminNote>(USER_ADMIN_NOTES_PATH) : Promise.resolve([]),
      readCommunityFollows(),
    ]);

    const activeAccounts = accounts.filter((account) => account.status !== 'withdrawn');

    if (accountId) {
      const account = activeAccounts.find((item) => item.accountId === accountId);

      if (!account) {
        return NextResponse.json({ message: '회원을 찾을 수 없습니다.' }, { status: 404 });
      }

      return NextResponse.json(
        createUserProfileBundle({
          account,
          products,
          communityProfiles,
          campusProfiles,
          adminNotes,
          follows,
          includeAdminNotes,
        }),
        { status: 200 },
      );
    }

    const filteredAccounts = activeAccounts.filter((account) =>
      matchesUserSearch(account, searchKeyword),
    );
    const totalCount = filteredAccounts.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / requestedPageSize));
    const page = Math.min(requestedPage, totalPages);
    const startIndex = (page - 1) * requestedPageSize;
    const pagedAccounts = filteredAccounts.slice(startIndex, startIndex + requestedPageSize);

    const items = pagedAccounts.map((account) =>
      createUserProfileBundle({
        account,
        products,
        communityProfiles,
        campusProfiles,
        adminNotes,
        follows,
        includeAdminNotes,
      }),
    );

    return NextResponse.json(
      {
        items,
        meta: {
          totalCount,
          totalPages,
          page,
          pageSize: requestedPageSize,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[GET /api/mock/users] failed:', error);
    return NextResponse.json({ message: '회원 정보를 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as UpdateUserProfileRequestBody | null;
    const requestedAccountId =
      typeof body?.accountId === 'string' && body.accountId.trim()
        ? body.accountId.trim()
        : getAccountId(request);
    const accountId = await resolveMockAuthAccountId(request, requestedAccountId);

    if (!accountId) {
      return NextResponse.json({ message: '회원 정보가 필요합니다.' }, { status: 400 });
    }

    const accounts = await readMockList<UserAccount>(USERS_PATH);
    const targetIndex = accounts.findIndex((account) => account.accountId === accountId);

    if (targetIndex < 0) {
      return NextResponse.json({ message: '회원을 찾을 수 없습니다.' }, { status: 404 });
    }

    const currentAccount = accounts[targetIndex];
    const nextAvatar =
      typeof body?.profile?.avatar === 'string'
        ? body.profile.avatar.trim()
        : currentAccount.profile.avatar;
    const nextCompany =
      typeof body?.profile?.company === 'string'
        ? body.profile.company.trim()
        : currentAccount.profile.company;
    const nextPosition =
      typeof body?.profile?.position === 'string'
        ? body.profile.position.trim()
        : currentAccount.profile.position;

    const nextAccount: UserAccount = {
      ...currentAccount,
      profile: {
        ...currentAccount.profile,
        avatar: nextAvatar,
        company: nextCompany,
        position: nextPosition,
      },
      updatedAt: new Date().toISOString(),
    };
    const nextAccounts = [...accounts];
    nextAccounts[targetIndex] = nextAccount;

    await writeJsonFile<UserAccount[]>(USERS_PATH, nextAccounts);

    return NextResponse.json(nextAccount, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/mock/users] failed:', error);
    return NextResponse.json({ message: '회원 정보를 저장하지 못했습니다.' }, { status: 500 });
  }
}

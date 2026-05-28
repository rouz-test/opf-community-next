import { NextRequest, NextResponse } from 'next/server';

import { readJsonFile } from '@/lib/mock-file';
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

function canIncludeAdminNotes(request: NextRequest) {
  return (
    request.nextUrl.searchParams.get('includeAdminNotes') === 'true' &&
    request.nextUrl.searchParams.get('viewerRole') === 'admin'
  );
}

function sortProductsByRecent(products: UserProduct[]) {
  return [...products].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function createUserProfileBundle({
  account,
  products,
  communityProfiles,
  campusProfiles,
  adminNotes,
  includeAdminNotes,
}: {
  account: UserAccount;
  products: UserProduct[];
  communityProfiles: UserCommunityProfile[];
  campusProfiles: UserCampusProfile[];
  adminNotes: UserAdminNote[];
  includeAdminNotes: boolean;
}): UserProfileBundle {
  const scopedProducts = sortProductsByRecent(
    products.filter((product) => product.ownerAccountId === account.accountId),
  );

  return {
    account,
    products: scopedProducts,
    primaryProduct: scopedProducts.find((product) => product.status === 'published') ?? scopedProducts[0] ?? null,
    communityProfile:
      communityProfiles.find((profile) => profile.accountId === account.accountId) ?? null,
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

    const [accounts, products, communityProfiles, campusProfiles, adminNotes] = await Promise.all([
      readMockList<UserAccount>(USERS_PATH),
      readMockList<UserProduct>(USER_PRODUCTS_PATH),
      readMockList<UserCommunityProfile>(USER_COMMUNITY_PROFILES_PATH),
      readMockList<UserCampusProfile>(USER_CAMPUS_PROFILES_PATH),
      includeAdminNotes ? readMockList<UserAdminNote>(USER_ADMIN_NOTES_PATH) : Promise.resolve([]),
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
          includeAdminNotes,
        }),
        { status: 200 },
      );
    }

    const items = activeAccounts.map((account) =>
      createUserProfileBundle({
        account,
        products,
        communityProfiles,
        campusProfiles,
        adminNotes,
        includeAdminNotes,
      }),
    );

    return NextResponse.json(
      {
        items,
        meta: {
          totalCount: items.length,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[GET /api/mock/users] failed:', error);
    return NextResponse.json({ message: '회원 정보를 불러오지 못했습니다.' }, { status: 500 });
  }
}

'use client';

import Link from 'next/link';

export type AuthorProfileCardProps = {
  author: {
    id: string;
    name: string;
    nickname: string;
    avatar: string;
    position?: string;
  };
  displayMode?: 'real' | 'nickname';
  followerCount?: number;
  followingCount?: number;
  followLabel?: string;
  variant?: 'mobile' | 'sidebar';
};

export function AuthorProfileCard({
  author,
  displayMode = 'nickname',
  followerCount = 892,
  followingCount = 124,
  followLabel = '팔로우',
  variant = 'sidebar',
}: AuthorProfileCardProps) {
  const displayName = displayMode === 'real' ? author.name : author.nickname;

  if (variant === 'mobile') {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-3">
          <Link href={`/user/community/author/${author.id}`}>
            <img
              src={author.avatar}
              alt={displayName}
              className="h-12 w-12 cursor-pointer rounded-full object-cover"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            {author.position ? <p className="text-xs text-gray-500">{author.position}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            {followLabel}
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">팔로워</span>
            <span className="font-semibold text-gray-900">{followerCount}</span>
          </div>
          <div className="h-3 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">팔로잉</span>
            <span className="font-semibold text-gray-900">{followingCount}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">👤</span>
        <h3 className="text-base font-bold text-gray-900">작성자 정보</h3>
      </div>

      <div className="mb-4 flex justify-center">
        <Link href={`/user/community/author/${author.id}`}>
          <img
            src={author.avatar}
            alt={displayName}
            className="h-20 w-20 cursor-pointer rounded-full object-cover"
          />
        </Link>
      </div>

      <div className="mb-1 text-center">
        <p className="font-bold text-gray-900">{displayName}</p>
      </div>

      {author.position ? (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600">{author.position}</p>
        </div>
      ) : null}

      <div className="mb-4 grid grid-cols-2 gap-4 border-y border-gray-200 py-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{followerCount}</p>
          <p className="text-xs uppercase text-gray-500">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{followingCount}</p>
          <p className="text-xs uppercase text-gray-500">Following</p>
        </div>
      </div>

      <button
        type="button"
        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        {followLabel}
      </button>
    </section>
  );
}
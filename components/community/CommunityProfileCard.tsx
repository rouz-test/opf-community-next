import { BadgeCheck, RefreshCw } from 'lucide-react';

export type CommunityProfileCardProps = {
  profileMode: 'real' | 'nickname';
  onToggleProfileMode: () => void;
  variant?: 'sidebar' | 'header';
  currentUser: {
    name: string;
    nickname: string;
    avatar: string;
    position: string;
    postsCount: number;
    commentsCount: number;
  };
};

export function CommunityProfileCard({
  profileMode,
  onToggleProfileMode,
  currentUser,
  variant = 'sidebar',
}: CommunityProfileCardProps) {
  return variant === 'header' ? (
    <div className="flex min-w-0 items-center gap-2">
      <img
        src={currentUser.avatar}
        alt={profileMode === 'real' ? currentUser.name : currentUser.nickname}
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-gray-200"
      />

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="max-w-[84px] truncate text-sm font-semibold text-gray-900">
            {profileMode === 'real' ? currentUser.name : currentUser.nickname}
          </p>
          {profileMode === 'real' ? (
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />
          ) : null}
        </div>
        <p className="text-[11px] font-medium text-gray-500">
          {profileMode === 'real' ? '실명 프로필' : '닉네임 프로필'}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggleProfileMode}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-100"
        aria-label="계정 전환"
        title="계정 전환"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
    </div>
  ) : (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="relative h-24 bg-gradient-to-br from-orange-400 to-orange-500">
        <div className="absolute right-3 top-3 rounded-full border px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
          {profileMode === 'real' ? (
            <span className="text-blue-700">✓ 실명 인증</span>
          ) : (
            <span className="text-gray-700">닉네임</span>
          )}
        </div>
      </div>

      <div className="relative px-6">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <img
            src={currentUser.avatar}
            alt={profileMode === 'real' ? currentUser.name : currentUser.nickname}
            className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
          />
        </div>
      </div>

      <div className="px-6 pb-5 pt-14 text-center">
        <div className="mb-1 flex items-center justify-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">
            {profileMode === 'real' ? currentUser.name : currentUser.nickname}
          </h2>
          {profileMode === 'real' && <BadgeCheck className="h-4 w-4 text-blue-500" />}
        </div>
        <p className="text-sm text-gray-600">{currentUser.position}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-sm">
          <div>
            <p className="font-semibold text-gray-900">{currentUser.postsCount}</p>
            <p className="text-xs text-gray-500">작성 글</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{currentUser.commentsCount}</p>
            <p className="text-xs text-gray-500">댓글</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleProfileMode}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-100"
        >
          <RefreshCw className="h-4 w-4" />
          <span>계정 전환</span>
        </button>
      </div>
    </section>
  );
}
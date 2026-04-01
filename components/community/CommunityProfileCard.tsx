import { BadgeCheck, RefreshCw } from 'lucide-react';
import { CommunityWriteAction } from '@/components/community/CommunityWriteAction';

export type CommunityProfileCardProps = {
  profileMode: 'real' | 'nickname';
  onToggleProfileMode: () => void;
  onProfileClick?: () => void;
  onWriteClick?: () => void;
  showWriteButton?: boolean;
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
  onProfileClick,
  onWriteClick,
  showWriteButton = false,
  currentUser,
  variant = 'sidebar',
}: CommunityProfileCardProps) {
  return variant === 'header' ? (
    <button
      type="button"
      onClick={onProfileClick}
      className="relative shrink-0"
      aria-label="프로필 메뉴 열기"
      title="프로필 메뉴"
    >
      <img
        src={currentUser.avatar}
        alt={profileMode === 'real' ? currentUser.name : currentUser.nickname}
        className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
      />

      {profileMode === 'real' ? (
        <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
          <BadgeCheck className="h-3 w-3 text-blue-500" />
        </span>
      ) : (
        <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gray-900 px-1 text-[9px] font-semibold leading-none text-white shadow-sm ring-1 ring-white">
          N
        </span>
      )}
    </button>
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
          <button
            type="button"
            onClick={onProfileClick}
            aria-label="프로필 메뉴 열기"
            title="프로필 메뉴"
          >
            <img
              src={currentUser.avatar}
              alt={profileMode === 'real' ? currentUser.name : currentUser.nickname}
              className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
            />
          </button>
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

        {showWriteButton && onWriteClick ? (
          <>
            <CommunityWriteAction variant="sidebar" onClick={onWriteClick} />

            <button
              type="button"
              onClick={onToggleProfileMode}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-100"
            >
              <RefreshCw className="h-4 w-4" />
              <span>계정 전환</span>
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </section>
  );
}
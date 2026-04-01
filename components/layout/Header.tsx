'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fragment, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import { CommunityProfileCard } from '@/components/community/CommunityProfileCard';
import { useAuth } from '@/components/providers/AuthProvider';
import { useMobileNav } from '@/components/providers/MobileNavProvider';
import { useProfileMenu } from '@/components/providers/ProfileMenuProvider';
import { communityAuthors } from '@/data/mockCommunityPosts';

export default function Header() {
  const [communityProfileMode, setCommunityProfileMode] = useState<'real' | 'nickname'>('nickname');
  const [profileModeToast, setProfileModeToast] = useState<string | null>(null);
  const pathname = usePathname();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const { openNav } = useMobileNav();
  const { openProfileMenu } = useProfileMenu();
  const COMMUNITY_PROFILE_MODE_STORAGE_KEY = 'community-profile-mode';

  const mobileCommunityProfileTriggerRef = useRef<HTMLDivElement | null>(null);
  const desktopProfileTriggerRef = useRef<HTMLButtonElement | null>(null);
  const hasInitializedProfileModeRef = useRef(false);

  const isCommunityRoute = pathname.startsWith('/community');

  const syncCommunityProfileMode = (nextMode: 'real' | 'nickname') => {
    setCommunityProfileMode(nextMode);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COMMUNITY_PROFILE_MODE_STORAGE_KEY, nextMode);
      window.dispatchEvent(
        new CustomEvent('community-profile-mode-change', {
          detail: { mode: nextMode },
        }),
      );
    }
  };

  const switchCommunityProfileMode = (nextMode: 'real' | 'nickname') => {
    syncCommunityProfileMode(nextMode);
  };

  const accountUser1RealProfile = communityAuthors.startupDreamerReal;
  const accountUser1NicknameProfile = communityAuthors.startupDreamer;

  const mobileCommunityHeaderProfileUser = {
    ...(communityProfileMode === 'real' ? accountUser1RealProfile : accountUser1NicknameProfile),
    postsCount: 12,
    commentsCount: 45,
  };

  const headerProfileAvatar = accountUser1NicknameProfile.avatar;

  const getProfileMenuAnchor = (element: HTMLElement | null) => {
    if (!element) return undefined;

    const rect = element.getBoundingClientRect();

    return {
      top: rect.bottom + 8,
      left: rect.right,
    };
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedMode = window.localStorage.getItem(COMMUNITY_PROFILE_MODE_STORAGE_KEY);
    if (savedMode === 'real' || savedMode === 'nickname') {
      setCommunityProfileMode(savedMode);
    }

    const handleProfileModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode?: 'real' | 'nickname' }>;
      const nextMode = customEvent.detail?.mode;

      if (nextMode === 'real' || nextMode === 'nickname') {
        setCommunityProfileMode(nextMode);
      }
    };

    window.addEventListener('community-profile-mode-change', handleProfileModeChange as EventListener);

    return () => {
      window.removeEventListener(
        'community-profile-mode-change',
        handleProfileModeChange as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    if (!isCommunityRoute) return;

    if (!hasInitializedProfileModeRef.current) {
      hasInitializedProfileModeRef.current = true;
      return;
    }

    setProfileModeToast(
      communityProfileMode === 'real'
        ? '실명 계정으로 전환되었습니다.'
        : '닉네임 계정으로 전환되었습니다.',
    );
  }, [communityProfileMode, isCommunityRoute]);

  useEffect(() => {
    if (!profileModeToast) return;

    const toastTimer = window.setTimeout(() => {
      setProfileModeToast(null);
    }, 1800);

    return () => {
      window.clearTimeout(toastTimer);
    };
  }, [profileModeToast]);


  return (
    <Fragment>
      {profileModeToast ? (
        <div className="pointer-events-none fixed bottom-6 right-4 z-[140] flex max-w-[calc(100vw-2rem)] justify-end">
          <div className="rounded-2xl bg-gray-900/92 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur">
            {profileModeToast}
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-40 w-full overflow-hidden border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="relative mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
          {/* Left: Mobile menu / Desktop logo */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openNav}
              className="inline-flex h-9 w-9 items-center justify-center text-gray-600 transition-colors hover:text-gray-900 lg:hidden"
              aria-label="메뉴 열기"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="hidden items-center sm:flex">
              <Image
                src="/logo.webp"
                alt="Orange Park"
                width={140}
                height={40}
                className="h-9 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Center: Nav */}
          <nav className="hidden items-center gap-6 text-sm text-gray-700 md:flex">
            <Link href="/community" className="font-medium text-gray-900 hover:text-orange-600">
              커뮤니티
            </Link>
            <button className="inline-flex items-center gap-1 hover:text-orange-600">
              캠퍼스
              <span className="text-xs">▾</span>
            </button>
            <Link href="/article" className="hover:text-orange-600">
              아티클
            </Link>
          </nav>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 sm:hidden">
            <Image
              src="/logo-mobile.webp"
              alt="Orange Park"
              width={40}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Right: Auth */}
          <div className="relative flex items-center gap-2">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                  aria-label="알림"
                  title="알림 기능 예정"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
                </button>

                {isCommunityRoute ? (
                  <div ref={mobileCommunityProfileTriggerRef} className="lg:hidden">
                    <CommunityProfileCard
                      variant="header"
                      profileMode={communityProfileMode}
                      onToggleProfileMode={() =>
                        switchCommunityProfileMode(
                          communityProfileMode === 'real' ? 'nickname' : 'real',
                        )
                      }
                      onProfileClick={() =>
                        openProfileMenu({
                          showCommunitySwitch: true,
                          onToggleProfileMode: () =>
                            switchCommunityProfileMode(
                              communityProfileMode === 'real' ? 'nickname' : 'real',
                            ),
                          anchor: getProfileMenuAnchor(mobileCommunityProfileTriggerRef.current),
                        })
                      }
                      currentUser={mobileCommunityHeaderProfileUser}
                    />
                  </div>
                ) : null}

                {!isCommunityRoute ? (
                  <button
                    ref={desktopProfileTriggerRef}
                    type="button"
                    onClick={() =>
                      openProfileMenu({
                        anchor: getProfileMenuAnchor(desktopProfileTriggerRef.current),
                      })
                    }
                    className="inline-flex cursor-pointer items-center transition-transform hover:scale-105"
                    aria-label="마이페이지로 이동"
                    title="마이페이지 진입 예정"
                  >
                    <img
                      src={headerProfileAvatar}
                      alt="사용자 프로필"
                      className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
                    />
                  </button>
                ) : (
                  <button
                    ref={desktopProfileTriggerRef}
                    type="button"
                    onClick={() =>
                      openProfileMenu({
                        anchor: getProfileMenuAnchor(desktopProfileTriggerRef.current),
                      })
                    }
                    className="hidden cursor-pointer items-center transition-transform hover:scale-105 lg:inline-flex"
                    aria-label="마이페이지로 이동"
                    title="마이페이지 진입 예정"
                  >
                    <img
                      src={headerProfileAvatar}
                      alt="사용자 프로필"
                      className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
                    />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoggedIn(true)}
                  className="text-sm font-medium text-orange-600 hover:underline"
                >
                  로그인
                </button>
              </div>
            )}

          </div>
        </div>
      </header>
    </Fragment>
  );
}
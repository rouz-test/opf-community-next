'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import { CommunityProfileCard } from '@/components/community/CommunityProfileCard';
import { useAuth } from '@/components/providers/AuthProvider';
import { useMobileNav } from '@/components/providers/MobileNavProvider';
import { useProfileMenu } from '@/components/providers/ProfileMenuProvider';

export default function Header() {
  const [communityProfileMode, setCommunityProfileMode] = useState<'real' | 'nickname'>('nickname');
  const pathname = usePathname();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const { openNav } = useMobileNav();
  const { openProfileMenu } = useProfileMenu();
  const COMMUNITY_PROFILE_MODE_STORAGE_KEY = 'community-profile-mode';


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


  const mobileCommunityHeaderProfileUser = {
    name: '박민수',
    nickname: 'StartupHero',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    position: '스타트업 개발자',
    postsCount: 12,
    commentsCount: 45,
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


  return (
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
                <div className="lg:hidden">
                  <CommunityProfileCard
                    variant="header"
                    profileMode={communityProfileMode}
                    onToggleProfileMode={() =>
                      syncCommunityProfileMode(
                        communityProfileMode === 'real' ? 'nickname' : 'real',
                      )
                    }
                    onProfileClick={() =>
                      openProfileMenu({
                        showCommunitySwitch: true,
                        onToggleProfileMode: () =>
                          syncCommunityProfileMode(
                            communityProfileMode === 'real' ? 'nickname' : 'real',
                          ),
                      })
                    }
                    currentUser={mobileCommunityHeaderProfileUser}
                  />
                </div>
              ) : null}

              {!isCommunityRoute ? (
                <button
                  type="button"
                  onClick={() => openProfileMenu()}
                  className="inline-flex cursor-pointer items-center transition-transform hover:scale-105"
                  aria-label="마이페이지로 이동"
                  title="마이페이지 진입 예정"
                >
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
                    alt="사용자 프로필"
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openProfileMenu()}
                  className="hidden cursor-pointer items-center transition-transform hover:scale-105 lg:inline-flex"
                  aria-label="마이페이지로 이동"
                  title="마이페이지 진입 예정"
                >
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
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
  );
}
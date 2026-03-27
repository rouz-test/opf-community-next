'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { CommunityProfileCard } from '@/components/community/CommunityProfileCard';
import { useAuth } from '@/components/providers/AuthProvider';

export default function Header() {
  const [showMobileTabs, setShowMobileTabs] = useState(true);
  const [communityProfileMode, setCommunityProfileMode] = useState<'real' | 'nickname'>('nickname');
  const pathname = usePathname();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
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

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    let isVisible = true;
    let lockUntil = 0;
    const delta = 10;
    const transitionLockMs = 220;

    const updateTabsVisibility = () => {
      const currentScrollY = window.scrollY;
      const now = performance.now();
      const diff = currentScrollY - lastScrollY;

      if (now < lockUntil) {
        ticking = false;
        return;
      }

      if (currentScrollY <= 8) {
        if (!isVisible) {
          setShowMobileTabs(true);
          isVisible = true;
          lockUntil = now + transitionLockMs;
        }
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      if (Math.abs(diff) < delta) {
        ticking = false;
        return;
      }

      if (diff > 0 && isVisible) {
        setShowMobileTabs(false);
        isVisible = false;
        lockUntil = now + transitionLockMs;
      } else if (diff < 0 && !isVisible) {
        setShowMobileTabs(true);
        isVisible = true;
        lockUntil = now + transitionLockMs;
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateTabsVisibility);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full overflow-hidden border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-mobile.webp"
            alt="Orange Park"
            width={40}
            height={40}
            className="h-9 w-auto sm:hidden"
            priority
          />
          <Image
            src="/logo.webp"
            alt="Orange Park"
            width={140}
            height={40}
            className="hidden h-9 w-auto sm:block"
            priority
          />
        </Link>

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

        {/* Right: Auth */}
        <div className="flex items-center gap-3">
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
                    currentUser={mobileCommunityHeaderProfileUser}
                  />
                </div>
              ) : null}

              {!isCommunityRoute ? (
                <button
                  type="button"
                  className="inline-flex items-center"
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
                  className="hidden items-center lg:inline-flex"
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
            <button
              type="button"
              onClick={() => setIsLoggedIn(true)}
              className="text-sm font-medium text-orange-600 hover:underline"
            >
              로그인
            </button>
          )}
        </div>
      </div>
      <div
        className={`relative overflow-hidden transition-[height] duration-200 md:hidden ${
          showMobileTabs ? 'h-11' : 'h-0'
        }`}
      >
        <div
          className={`absolute inset-x-0 top-0 border-t border-gray-100 bg-white/90 backdrop-blur transition-transform duration-200 ${
            showMobileTabs ? 'translate-y-0' : '-translate-y-full pointer-events-none'
          }`}
        >
          <nav className="mx-auto grid h-11 max-w-[1200px] grid-cols-3 px-2 text-sm text-gray-700">
            <Link
              href="/community"
              className="flex items-center justify-center font-medium text-gray-900 border-b-2 border-orange-500"
            >
              커뮤니티
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1 text-gray-700"
            >
              캠퍼스
              <span className="text-[10px]">▾</span>
            </button>
            <Link
              href="/article"
              className="flex items-center justify-center text-gray-700"
            >
              아티클
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

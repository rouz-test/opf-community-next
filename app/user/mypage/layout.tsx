'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut, MessageSquareText, School, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/app/user/components/providers/AuthProvider';

const sidebarItems = [
  { label: '커뮤니티', href: '/user/mypage/community', icon: MessageSquareText },
  {
    label: '캠퍼스',
    href: '/user/mypage/campus',
    icon: School,
    children: ['신청 내역', '팀 빌딩', '지원/팀 관리', '활동 게시판'],
  },
  {
    label: '설정',
    href: '/user/mypage/settings',
    icon: Settings,
    children: [
      { label: '프로필', href: '/user/mypage/settings/profile' },
      { label: '프로덕트', href: '/user/mypage/settings/product' },
      { label: '알림', href: '/user/mypage/settings/notifications' },
    ],
  },
  { label: '로그아웃', href: '/user/community', icon: LogOut, isLogout: true },
];

const settingsTabs = [
  { label: '프로필', href: '/user/mypage/settings/profile' },
  { label: '프로덕트', href: '/user/mypage/settings/product' },
  { label: '알림', href: '/user/mypage/settings/notifications' },
];

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();
  const [isCampusOpen, setIsCampusOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isSettingsRoute = pathname.startsWith('/user/mypage/settings');

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      <div className="w-full bg-white lg:border-r lg:border-gray-200">
        <div className="mx-auto flex max-w-[1400px]">
          <aside className="hidden min-h-screen w-[220px] shrink-0 bg-white lg:block">
            <div className="border-b border-gray-200 px-6 py-5">
              <h1 className="text-lg font-semibold text-gray-900">마이페이지</h1>
            </div>

            <nav className="px-4 py-5">
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
                  const isExpandableItem = item.label === '캠퍼스' || item.label === '설정';
                  const isCampusItem = item.label === '캠퍼스';
                  const isSettingsItem = item.label === '설정';
                  const isLogoutItem = item.isLogout;
                  const isActive = !isExpandableItem && !isLogoutItem && pathname === item.href;

                  return (
                    <li key={item.label}>
                      {isExpandableItem ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (isCampusItem) {
                              setIsCampusOpen((prev) => !prev);
                            }

                            if (isSettingsItem) {
                              setIsSettingsOpen((prev) => !prev);
                            }
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform ${
                              (isCampusItem && isCampusOpen) || (isSettingsItem && isSettingsOpen)
                                ? 'rotate-180'
                                : ''
                            }`}
                          />
                        </button>
                      ) : isLogoutItem ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsLoggedIn(false);
                            router.push('/user/community');
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-orange-50 text-orange-500'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                        </Link>
                      )}

                      {isExpandableItem && ((isCampusItem && isCampusOpen) || (isSettingsItem && isSettingsOpen)) ? (
                        <ul className="mt-2 space-y-1 pl-11">
                          {item.children?.map((child) => {
                            if (typeof child === 'string') {
                              return (
                                <li key={child}>
                                  <button
                                    type="button"
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                  >
                                    {child}
                                  </button>
                                </li>
                              );
                            }

                            const isChildActive = pathname === child.href;

                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                    isChildActive
                                      ? 'bg-orange-50 text-orange-500'
                                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <section
            className={`min-w-0 flex-1 border-l border-gray-200 bg-[#f3f4f6] px-4 sm:px-6 lg:px-10 lg:py-8 ${
              isSettingsRoute ? 'pt-0 pb-6 sm:pb-6' : 'py-6'
            }`}
          >
            {isSettingsRoute ? (
              <div className="-mx-4 border-b border-gray-200 bg-white px-4 sm:-mx-6 sm:px-6 lg:hidden">
                <nav className="grid grid-cols-3 items-center">
                  {settingsTabs.map((tab) => {
                    const isActive = pathname === tab.href;

                    return (
                      <Link
                        key={tab.href}
                        href={tab.href}
                        className={`relative inline-flex w-full justify-center px-1 py-4 text-sm font-semibold transition-colors ${
                          isActive
                            ? 'text-orange-500'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {tab.label}
                        {isActive ? (
                          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-orange-500" />
                        ) : null}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ) : null}

            {isSettingsRoute ? <div className="h-6 lg:hidden" /> : null}

            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
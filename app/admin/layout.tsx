'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const adminSidebarSections = [
  {
    title: '회원',
    items: [{ label: '회원 목록', href: '/admin/users' }],
  },
  {
    title: '관리자',
    items: [
      { label: '관리자 목록', href: '/admin/admin/list' },
      { label: '권한 관리', href: '/admin/admin/roles' },
      { label: '관리자 접속기록', href: '/admin/admin/audit-access' },
      { label: '접근 권한 관리 기록', href: '/admin/admin/audit-permission' },
    ],
  },
  {
    title: '캠퍼스',
    items: [
      { label: '프로그램 개설/관리', href: '/admin/campus/programs' },
      { label: '신청서 다운로드', href: '/admin/campus/request-downloads' },
      { label: '회차별 교육 관리', href: '/admin/campus/courses' },
      { label: '팀빌딩 공고 관리', href: '/admin/campus/teams' },
      { label: '활동 게시판', href: '/admin/campus/submissions' },
      { label: '팀원관리', href: '/admin/campus/requests' },
    ],
  },
  {
    title: '아티클',
    items: [
      { label: '글 작성/관리', href: '/admin/articles/list' },
      { label: '임시 저장', href: '/admin/articles/revisions' },
      { label: '카테고리', href: '/admin/articles/category' },
    ],
  },
  {
    title: '커뮤니티',
    items: [
      { label: '통계', href: '/admin/community/analytics' },
      { label: '콘텐츠 관리', href: '/admin/community/content' },
      { label: '태그 관리', href: '/admin/community/tags' },
      { label: '금지 키워드', href: '/admin/community/blocked-words' },
    ],
  },
] as const;

type AdminLayoutProps = {
  children: ReactNode;
};

function SidebarSectionIcon({ title }: { title: string }) {
  if (title === '회원') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="10" cy="6" r="2.5" />
        <path d="M5.5 15.5c.8-2.2 2.4-3.5 4.5-3.5s3.7 1.3 4.5 3.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (title === '관리자') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M10 3.5l1.5 2.1 2.6.4-1.9 1.8.4 2.6L10 9.3 7.4 10.4l.4-2.6L5.9 6l2.6-.4L10 3.5Z" strokeLinejoin="round" />
      </svg>
    );
  }

  if (title === '캠퍼스') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4.5 5.5h11v9h-11z" />
        <path d="M7 5.5v9" />
      </svg>
    );
  }

  if (title === '아티클') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M6 3.5h6l3 3v10H6z" />
        <path d="M12 3.5v3h3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M5.5 6.5h9" strokeLinecap="round" />
      <path d="M5.5 10h6.5" strokeLinecap="round" />
      <path d="M5.5 13.5h9" strokeLinecap="round" />
    </svg>

  );
}

function getAdminBreadcrumb(pathname: string) {
  for (const section of adminSidebarSections) {
    const matchedItem = section.items.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );

    if (matchedItem) {
      return [section.title, matchedItem.label];
    }
  }

  if (pathname === '/admin') {
    return ['관리자'];
  }

  return ['관리자'];
}

function formatBreadcrumbLabel(label: string) {
  if (label === '회원 목록') return '회원목록';
  if (label === '관리자 목록') return '관리자 목록';
  return label;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const breadcrumbItems = getAdminBreadcrumb(pathname).map(formatBreadcrumbLabel);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      adminSidebarSections.map((section) => [
        section.title,
        section.items.some(
          (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
        ),
      ]),
    ),
  );

  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };

      adminSidebarSections.forEach((section) => {
        const hasActiveItem = section.items.some(
          (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
        );

        if (hasActiveItem) {
          next[section.title] = true;
        }
      });

      return next;
    });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <div className="flex min-h-screen">
        <aside 
        style={{ width: 220}}
        className="border-r border-[#E5E7EB] bg-white xl:block">
          <div className="flex h-full flex-col">
            <div className="flex min-h-[96px] items-center justify-center px-6 py-6">
              <Link href="/admin" className="flex items-center justify-center">
                <Image
                  src="/admin-logo.png"
                  alt="OrangePlanet Admin"
                  width={134}
                  height={27}
                  priority
                />
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-4">
                {adminSidebarSections.map((section) => {
                  const hasActiveItem = section.items.some(
                    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
                  );
                  return (
                    <div key={section.title} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenSections((prev) => ({
                            ...prev,
                            [section.title]: !prev[section.title],
                          }));
                        }}
                        className={[
                          'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition',
                          hasActiveItem ? 'bg-[#FFF7ED] text-[#F97316]' : 'text-[#111827]',
                        ].join(' ')}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="flex h-4 w-4 items-center justify-center">
                            <SidebarSectionIcon title={section.title} />
                          </span>
                          <span>{section.title}</span>
                        </span>
                        <span
                          className={[
                            'text-[11px] transition-transform',
                            hasActiveItem ? 'text-[#F97316]' : 'text-[#9CA3AF]',
                            openSections[section.title] ? 'rotate-180' : '',
                          ].join(' ')}
                        >
                          ▾
                        </span>
                      </button>
                      {openSections[section.title] ? (
                        <div className="space-y-3 pl-11">
                          {section.items.map((item) => {
                            const isActive =
                              pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={[
                                  'flex min-h-[28px] items-center text-[15px] font-medium transition',
                                  isActive ? 'text-[#F97316]' : 'text-[#4B5563] hover:text-[#111827]',
                                ].join(' ')}
                              >
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
            <div className="flex h-[72px] items-center justify-between px-6 lg:px-8">
              <div />

              <div className="flex items-center gap-3 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF7ED] text-[14px] font-semibold text-[#F97316]">
                  관
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-[#111827]">
                    관리자
                  </div>
                  <div className="truncate text-[12px] text-[#6B7280]">
                    admin@orangeplanet.or.kr
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">
            <div className="w-full max-w-[1200px] space-y-4">
              <div className="flex min-w-0 items-center text-[14px] font-medium text-[#6B7280]">
                {breadcrumbItems.map((item, index) => (
                  <span key={`${item}-${index}`} className="flex min-w-0 items-center">
                    {index > 0 ? <span className="mx-3 text-[#9CA3AF]">&gt;</span> : null}
                    <span className="truncate">{item}</span>
                  </span>
                ))}
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

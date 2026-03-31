'use client';
import { ChevronDown, MessageSquareText, School, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FeedPostCard } from '@/components/community/FeedPostCard';
import { BoardPostRow } from '@/components/community/BoardPostRow';
import { mockCommunityPosts } from '@/data/mockCommunityPosts';

const sidebarItems = [
  { label: '커뮤니티', active: true, icon: MessageSquareText },
  {
    label: '캠퍼스',
    active: false,
    icon: School,
    children: ['신청 내역', '팀 빌딩', '지원/팀 관리', '활동 게시판'],
  },
  { label: '설정', active: false, icon: Settings },
];

function ProfileSummaryCard({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-gray-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 ring-1 ring-gray-200" />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {badge ? <span className="text-xs font-medium text-blue-500">{badge}</span> : null}
            </div>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        >
          수정하기
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 text-center">
        <div>
          <p className="text-2xl font-semibold text-gray-900">892</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">팔로워</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-gray-900">124</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">팔로잉</p>
        </div>
      </div>
    </div>
  );
}

export default function MyPage() {
  const [isCampusOpen, setIsCampusOpen] = useState(false);

  const [communityViewMode, setCommunityViewMode] = useState<'feed' | 'board'>('feed');

  const mypagePosts = useMemo(() => mockCommunityPosts.slice(0, 6), []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const renderSidebarMenu = (isMobile = false) => (
    <ul className="space-y-2">
      {sidebarItems.map((item) => {
        const isCampusItem = item.label === '캠퍼스';

        return (
          <li key={`${isMobile ? 'mobile' : 'desktop'}-${item.label}`}>
            <button
              type="button"
              onClick={isCampusItem ? () => setIsCampusOpen((prev) => !prev) : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-orange-50 text-orange-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isCampusItem ? (
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    isCampusOpen ? 'rotate-180' : ''
                  }`}
                />
              ) : null}
            </button>

            {isCampusItem && isCampusOpen ? (
              <ul className="mt-2 space-y-1 pl-11">
                {item.children?.map((child) => (
                  <li key={`${isMobile ? 'mobile' : 'desktop'}-${child}`}>
                    <button
                      type="button"
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
                    >
                      {child}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      <div className="w-full bg-white lg:border-r lg:border-gray-200">
        <div className="mx-auto flex max-w-[1400px]">
          <aside className="hidden min-h-screen w-[220px] shrink-0 bg-white lg:block">
          <div className="border-b border-gray-200 px-6 py-5">
            <h1 className="text-lg font-semibold text-gray-900">마이페이지</h1>
          </div>

          <nav className="px-4 py-5">
            {renderSidebarMenu()}
          </nav>
        </aside>
          <section className="min-w-0 flex-1 border-l border-gray-200 bg-[#f3f4f6] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-[1120px]">
            <header className="space-y-3">
              <div className="flex items-center justify-between gap-4 lg:block">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-400">마이페이지</p>
                  <h2 className="text-3xl font-semibold text-gray-900">커뮤니티</h2>
                </div>
              </div>
            </header>

            <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
              <div>
                <p className="mb-3 text-sm font-medium text-gray-500">실명</p>
                <ProfileSummaryCard
                  title="Kim Min-jun"
                  subtitle="스마일게이트 · Product Designer"
                  badge="✓"
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-gray-500">닉네임</p>
                <ProfileSummaryCard title="멋진 낙타" subtitle="직무" />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-gray-500">전체 연결</p>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">892</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">팔로워</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">124</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">팔로잉</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="grid grid-cols-5 bg-gray-50 text-sm font-medium text-gray-500">
                {['게시글', '댓글', '좋아요', '저장', '숨김'].map((tab, index) => (
                  <button
                    key={tab}
                    type="button"
                    className={`px-4 py-4 transition-colors ${
                      index === 0 ? 'bg-white text-gray-900 shadow-sm' : 'cursor-default bg-gray-50 text-gray-400'
                    } ${index !== 0 ? 'border-l border-gray-200' : ''}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </section>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                전체보기 ▾
              </button>
              <button
                type="button"
                onClick={() =>
                  setCommunityViewMode((prev) => (prev === 'feed' ? 'board' : 'feed'))
                }
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                {communityViewMode === 'feed' ? '피드뷰' : '게시판뷰'} ▾
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {communityViewMode === 'feed' ? (
                mypagePosts.map((post) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    formatDate={formatDate}
                    searchQuery=""
                  />
                ))
              ) : (
                mypagePosts.map((post) => (
                  <BoardPostRow
                    key={post.id}
                    post={post}
                    formatDate={formatDate}
                    searchQuery=""
                  />
                ))
              )}
            </div>
          </div>
          </section>
        </div>
      </div>
    </main>
  );
}

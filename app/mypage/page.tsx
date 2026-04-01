'use client';
import { ChevronDown, MessageSquareText, School, Settings, LayoutGrid, List, Check } from 'lucide-react';
import { FeedPostCard } from '@/components/community/FeedPostCard';
import { BoardPostRow } from '@/components/community/BoardPostRow';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  mockCommunityPosts,
  mockComments,
  communityAccounts,
  communityAuthors,
  type CommunityPost,
} from '@/data/mockCommunityPosts';

type CommunityPostWithHighlight = CommunityPost & {
  highlightedComment?: {
    author: CommunityPost['author'];
    content: string;
    createdAt: string;
  };
};

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
  avatar,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  avatar?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-gray-200">
            {avatar ? (
              <img src={avatar} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              {badge ? <span className="text-xs font-medium text-blue-500">{badge}</span> : null}
            </div>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300"
        >
          수정하기
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-3 text-center">
        <div>
          <p className="text-xl font-semibold text-gray-900">892</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">팔로워</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-gray-900">124</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">팔로잉</p>
        </div>
      </div>
    </div>
  );
}

export default function MyPage() {
  const [isCampusOpen, setIsCampusOpen] = useState(false);

  const [communityViewMode, setCommunityViewMode] = useState<'feed' | 'board'>('feed');
  const [activeCommunityTab, setActiveCommunityTab] = useState<'posts' | 'comments'>('posts');
  const [profileFilter, setProfileFilter] = useState<'all' | 'real' | 'nickname'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!filterRef.current?.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  const mypageAccount = useMemo(
    () => communityAccounts.find((account) => account.accountId === 'account-user-1'),
    [],
  );

  const mypagePosts = useMemo(() => {
    if (!mypageAccount) return [];

    return mockCommunityPosts.filter((post) => {
      const authorProfileId = post.author.profileId ?? post.author.id;
      return mypageAccount.profileIds.includes(authorProfileId);
    });
  }, [mypageAccount]);

  const mypageCommentedPosts = useMemo<CommunityPostWithHighlight[]>(() => {
    const ownComments = mockComments
      .filter((comment) => comment.author.accountId === 'account-user-1')
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const latestCommentByPostId = new Map<string, (typeof ownComments)[number]>();

    ownComments.forEach((comment) => {
      if (!latestCommentByPostId.has(comment.postId)) {
        latestCommentByPostId.set(comment.postId, comment);
      }
    });

    return Array.from(latestCommentByPostId.entries()).reduce<CommunityPostWithHighlight[]>((acc, [postId, comment]) => {
      const post = mockCommunityPosts.find((item) => item.id === postId);

      if (!post) return acc;

      acc.push({
        ...post,
        highlightedComment: {
          author: comment.author as CommunityPost['author'],
          content: comment.content,
          createdAt: comment.createdAt,
        },
      });

      return acc;
    }, []);
  }, []);

  const baseCommunityPosts: CommunityPostWithHighlight[] =
    activeCommunityTab === 'posts'
      ? (mypagePosts as CommunityPostWithHighlight[])
      : mypageCommentedPosts;

  const activeCommunityPosts = useMemo(() => {
    if (profileFilter === 'all') return baseCommunityPosts;

    return baseCommunityPosts.filter((post) =>
      profileFilter === 'real' ? post.isRealName : !post.isRealName,
    );
  }, [baseCommunityPosts, profileFilter]);

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

  const realProfile = communityAuthors.startupDreamerReal;
  const nicknameProfile = communityAuthors.startupDreamer;

  const followerCount = 892;
  const followingCount = 124;

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

            <div className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_200px]">
              <div>
                <p className="mb-3 text-sm font-medium text-gray-500">실명</p>
                <ProfileSummaryCard
                  title={realProfile.name}
                  subtitle={realProfile.position ?? '직무'}
                  badge="✓"
                  avatar={realProfile.avatar}
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-gray-500">닉네임</p>
                <ProfileSummaryCard
                  title={nicknameProfile.nickname}
                  subtitle={nicknameProfile.position ?? '직무'}
                  avatar={nicknameProfile.avatar}
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-gray-500">전체 연결</p>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-full items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 text-center w-full">
                      <div>
                        <p className="text-xl font-semibold text-gray-900">{followerCount}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">팔로워</p>
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-gray-900">{followingCount}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">팔로잉</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-10 border-b border-gray-200">
              <div className="flex items-center gap-2">
                {['게시글', '댓글', '좋아요', '저장', '숨김'].map((tab, index) => {
                  const isPostsTab = index === 0;
                  const isCommentsTab = index === 1;
                  const isClickable = isPostsTab || isCommentsTab;
                  const isActive =
                    (isPostsTab && activeCommunityTab === 'posts') ||
                    (isCommentsTab && activeCommunityTab === 'comments');

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={
                        isPostsTab
                          ? () => setActiveCommunityTab('posts')
                          : isCommentsTab
                            ? () => setActiveCommunityTab('comments')
                            : undefined
                      }
                      className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-gray-900'
                          : isClickable
                            ? 'text-gray-500 hover:text-gray-900'
                            : 'cursor-default text-gray-300'
                      }`}
                    >
                      {tab}

                      {isActive ? (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div ref={filterRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  {profileFilter === 'all'
                    ? '전체 보기'
                    : profileFilter === 'real'
                      ? '실명만'
                      : '닉네임만'}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isFilterOpen ? (
                  <div className="absolute left-0 mt-2 w-[180px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg z-20">
                    {[
                      { label: '전체 보기', value: 'all' },
                      { label: '실명만 보기', value: 'real' },
                      { label: '닉네임만 보기', value: 'nickname' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setProfileFilter(option.value as 'all' | 'real' | 'nickname');
                          setIsFilterOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span>{option.label}</span>
                        {profileFilter === option.value ? (
                          <Check className="h-4 w-4 text-orange-500" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setCommunityViewMode('feed')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    communityViewMode === 'feed'
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  피드뷰
                </button>
                <button
                  type="button"
                  onClick={() => setCommunityViewMode('board')}
                  className={`flex items-center gap-2 border-l border-gray-200 px-4 py-2 text-sm font-medium transition-colors ${
                    communityViewMode === 'board'
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                  게시판뷰
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {activeCommunityPosts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500">
                  {activeCommunityTab === 'posts'
                    ? '작성한 게시글이 아직 없습니다.'
                    : '댓글을 남긴 게시글이 아직 없습니다. 댓글을 남기면 해당 게시글과 내 댓글이 함께 표시됩니다.'}
                </div>
              ) : communityViewMode === 'feed' ? (
                activeCommunityPosts.map((post) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    formatDate={formatDate}
                    searchQuery=""
                  />
                ))
              ) : (
                activeCommunityPosts.map((post) => (
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



'use client';

import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  LayoutGrid,
  List,
  Check,
  Search,
  BadgeCheck,
} from 'lucide-react';
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

function ProfileSummaryCard({
  title,
  subtitle,
  badge,
  avatar,
  onFollowingClick,
  onEditClick,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  avatar?: string;
  onFollowingClick?: () => void;
  onEditClick?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-gray-300 hover:shadow-md sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-gray-200 sm:h-12 sm:w-12">
            {avatar ? (
              <img src={avatar} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-[15px] font-semibold text-gray-900 sm:text-base">{title}</h3>
              {badge ? <BadgeCheck className="h-4 w-4 text-blue-500" /> : null}
            </div>
            <p className="truncate text-[11px] text-gray-500 sm:text-xs">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEditClick}
          className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 sm:text-sm"
        >
          수정하기
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-gray-50 px-3 py-2 text-center sm:p-3">
        <div>
          <p className="text-lg font-semibold text-gray-900 sm:text-xl">892</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-gray-400 sm:text-[11px] sm:tracking-[0.18em]">팔로워</p>
        </div>
        <button
          type="button"
          onClick={onFollowingClick}
          className="rounded-lg transition-colors hover:bg-gray-100/70"
        >
          <p className="text-lg font-semibold text-gray-900 sm:text-xl">124</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-gray-400 sm:text-[11px] sm:tracking-[0.18em]">팔로잉</p>
        </button>
      </div>
    </div>
  );
}

export default function MyPageCommunityPage() {
  const router = useRouter();
  const [communityViewMode, setCommunityViewMode] = useState<'feed' | 'board'>('feed');
  const [activeCommunityTab, setActiveCommunityTab] = useState<'posts' | 'comments'>('posts');
  const [profileFilter, setProfileFilter] = useState<'all' | 'real' | 'nickname'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followingModalProfile, setFollowingModalProfile] = useState<'real' | 'nickname'>('real');

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

  useEffect(() => {
    if (!isFollowingModalOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFollowingModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isFollowingModalOpen]);

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
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const latestCommentByPostId = new Map<string, (typeof ownComments)[number]>();

    ownComments.forEach((comment) => {
      if (!latestCommentByPostId.has(comment.postId)) {
        latestCommentByPostId.set(comment.postId, comment);
      }
    });

    return Array.from(latestCommentByPostId.entries()).reduce<CommunityPostWithHighlight[]>((acc, [postId, comment]) => {
      const post = mockCommunityPosts.find((item) => item.id === postId) as CommunityPost | undefined;

      if (!post) return acc;

      const highlightedPost: CommunityPostWithHighlight = {
        ...post,
        highlightedComment: {
          id: comment.id,
          author: comment.author as CommunityPost['author'],
          content: comment.content,
          createdAt: comment.createdAt,
          likes: comment.likes ?? 0,
          replyCount: 0,
        },
      };

      acc.push(highlightedPost);

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

  const followingProfiles = {
    real: [
      communityAuthors.spaceHunterReal,
      communityAuthors.eventMasterReal,
      communityAuthors.bizModelPro,
      communityAuthors.techFounder,
      communityAuthors.growthHacker,
    ],
    nickname: [
      communityAuthors.happyLearnerNickname,
      communityAuthors.mvpExpertNickname,
      communityAuthors.designSprinterNickname,
      communityAuthors.newbieFounderNickname,
      communityAuthors.devExpertNickname,
    ],
  } satisfies Record<'real' | 'nickname', CommunityPost['author'][]>;

  const activeFollowingProfiles = followingProfiles[followingModalProfile];

  return (
    <div className="mx-auto w-full max-w-[1120px]">
      <header className="space-y-3">
      <h1 className="text-2xl font-semibold text-gray-900">커뮤니티</h1>
      </header>

      <div className="mt-4 grid items-start gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_200px]">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">실명</p>
          <ProfileSummaryCard
            title={realProfile.name}
            subtitle={realProfile.position ?? '직무'}
            badge="✓"
            avatar={realProfile.avatar}
            onFollowingClick={() => {
              setFollowingModalProfile('real');
              setIsFollowingModalOpen(true);
            }}
            onEditClick={() => router.push('/mypage/settings/profile?tab=real')}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">닉네임</p>
          <ProfileSummaryCard
            title={nicknameProfile.nickname}
            subtitle={nicknameProfile.position ?? '직무'}
            avatar={nicknameProfile.avatar}
            onFollowingClick={() => {
              setFollowingModalProfile('nickname');
              setIsFollowingModalOpen(true);
            }}
            onEditClick={() => router.push('/mypage/settings/profile?tab=nickname')}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">전체 연결</p>
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex h-full items-center justify-center">
              <div className="grid w-full grid-cols-2 gap-2 text-center sm:gap-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900 sm:text-xl">{followerCount}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-gray-400 sm:text-[11px] sm:tracking-[0.18em]">팔로워</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 sm:text-xl">{followingCount}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-gray-400 sm:text-[11px] sm:tracking-[0.18em]">팔로잉</p>
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
            <div className="absolute left-0 z-20 mt-2 w-[180px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
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
            <FeedPostCard key={post.id} post={post} formatDate={formatDate} searchQuery="" />
          ))
        ) : (
          activeCommunityPosts.map((post) => (
            <BoardPostRow key={post.id} post={post} formatDate={formatDate} searchQuery="" />
          ))
        )}
      </div>

      {isFollowingModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <button
            type="button"
            aria-label="팔로잉 목록 닫기"
            className="absolute inset-0"
            onClick={() => setIsFollowingModalOpen(false)}
          />

          <div className="relative z-10 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">팔로잉 목록</h3>
              <button
                type="button"
                onClick={() => setIsFollowingModalOpen(false)}
                className="text-xl leading-none text-gray-400 transition-colors hover:text-gray-600"
                aria-label="팔로잉 목록 닫기"
              >
                ×
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setFollowingModalProfile('real')}
                className={`relative flex-1 pb-3 text-center text-xs font-medium transition-colors ${
                  followingModalProfile === 'real'
                    ? 'text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{realProfile.name}</span>
                <span className="ml-2">{followingCount}</span>
                {followingModalProfile === 'real' ? (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-orange-500" />
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => setFollowingModalProfile('nickname')}
                className={`relative flex-1 pb-3 text-center text-xs font-medium transition-colors ${
                  followingModalProfile === 'nickname'
                    ? 'text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{nicknameProfile.nickname}</span>
                <span className="ml-2">{followingCount}</span>
                {followingModalProfile === 'nickname' ? (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-orange-500" />
                ) : null}
              </button>
            </div>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="사용자 검색..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="mt-4 space-y-3">
              {activeFollowingProfiles.map((profile) => {
                const displayName = profile.mode === 'real'
                  ? ('name' in profile && profile.name ? profile.name : profile.nickname)
                  : profile.nickname;
                const profilePosition = 'position' in profile ? profile.position : undefined;

                return (
                  <div
                    key={profile.profileId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={profile.avatar}
                        alt={displayName}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-gray-200"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
                          {profile.mode === 'real' ? (
                            <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                          ) : null}
                        </div>
                        <p className="truncate text-[11px] text-gray-500">
                          {profilePosition ?? '커뮤니티 활동 중'}
                        </p>
                        <p className="truncate text-[11px] text-gray-400">
                          {profile.mode === 'real'
                            ? '인증된 실명 프로필입니다.'
                            : '커뮤니티에서 활동 중입니다.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="shrink-0 rounded-md bg-gray-100 px-2.5 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                    >
                      팔로잉
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
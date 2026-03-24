'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  BadgeCheck,
  UserCheck,
  TrendingUp,
  Sparkles,
  Heart,
  MessageSquare,
} from 'lucide-react';
import {
  mockCommunityPosts,
  mockNotices,
  getPopularPosts,
  orangePickArticles,
  getCommunityCategoryLabel,
  type CommunityPost,
} from '@/data/mockCommunityPosts';
import { CommunityProfileCard } from '@/components/community/CommunityProfileCard';
import { CommunityTagFilter } from '@/components/community/CommunityTagFilter';
import { PopularPostsWidget } from '@/components/community/PopularPostsWidget';
import { OrangePickWidget } from '@/components/community/OrangePickWidget';

type PostCardBaseProps = {
  post: CommunityPost;
  formatDate: (dateString?: string) => string;
};

type CommunityToolbarProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  showFollowingOnly: boolean;
  onToggleFollowingOnly: () => void;
  sortBy: 'recommended' | 'latest';
  onSortByChange: (value: 'recommended' | 'latest') => void;
  viewMode: 'feed' | 'board';
  onViewModeChange: (value: 'feed' | 'board') => void;
  isFilterOpen: boolean;
  onToggleFilterOpen: () => void;
  onCloseFilterOpen: () => void;
};


const chunkPosts = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};
function HighlightCarousel({ posts }: { posts: CommunityPost[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [slidesPerPage, setSlidesPerPage] = useState(2);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const swipeThreshold = 50;

  useEffect(() => {
    const updateSlidesPerPage = () => {
      if (window.innerWidth < 768) {
        setSlidesPerPage(1);
      } else {
        setSlidesPerPage(2);
      }
    };

    updateSlidesPerPage();
    window.addEventListener('resize', updateSlidesPerPage);

    return () => {
      window.removeEventListener('resize', updateSlidesPerPage);
    };
  }, []);

  const pages = useMemo(() => chunkPosts(posts, slidesPerPage), [posts, slidesPerPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [slidesPerPage]);

  useEffect(() => {
    if (pages.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % pages.length);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [pages.length]);

  if (pages.length === 0) return null;

  const goToPrev = () => {
    setCurrentPage((prev) => (prev === 0 ? pages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => (prev + 1) % pages.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) {
      touchStartXRef.current = null;
      touchEndXRef.current = null;
      return;
    }

    const deltaX = touchStartXRef.current - touchEndXRef.current;

    if (Math.abs(deltaX) >= swipeThreshold) {
      if (deltaX > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <section className="relative overflow-hidden">
      <div
        className="flex touch-pan-y transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentPage * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pages.map((pagePosts, pageIndex) => (
          <div key={pageIndex} className="w-full flex-shrink-0">
            <div className="grid gap-4 md:grid-cols-2">
              {pagePosts.map((post) => (
                <HighlightPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {pages.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {pages.map((_, pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              onClick={() => setCurrentPage(pageIndex)}
              className={`h-2.5 rounded-full transition-all ${
                currentPage === pageIndex ? 'w-8 bg-orange-500' : 'w-2.5 bg-gray-300'
              }`}
              aria-label={`${pageIndex + 1}번 하이라이트로 이동`}
            />
          ))}
        </div>
      )}
    </section>
  );
}




const COMMUNITY_CURRENT_USER = {
  name: '박민수',
  nickname: 'StartupHero',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  position: '스타트업 개발자',
  postsCount: 12,
  commentsCount: 45,
};

type CommunityPageState = {
  selectedTags: string[];
  searchQuery: string;
  showFollowingOnly: boolean;
  sortBy: 'recommended' | 'latest';
};

const getAllTags = (posts: CommunityPost[]) =>
  Array.from(new Set(posts.flatMap((post) => post.tags || [])));

const getHighlightPosts = (posts: CommunityPost[], notices: CommunityPost[]) =>
  [...notices, ...posts].filter((post) => post.isHighlight);

const filterPosts = (
  posts: CommunityPost[],
  { selectedTags, searchQuery, showFollowingOnly, sortBy }: CommunityPageState,
) => {
  let filteredPosts = [...posts];

  if (selectedTags.length > 0) {
    filteredPosts = filteredPosts.filter((post) =>
      post.tags?.some((tag) => selectedTags.includes(tag)),
    );
  }

  if (searchQuery.trim()) {
    const keyword = searchQuery.trim().toLowerCase();
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        (post.tags || []).some((tag) => tag.toLowerCase().includes(keyword)),
    );
  }

  if (showFollowingOnly) {
    filteredPosts = filteredPosts.filter((post) => Boolean(post.highlightedComment));
  }

  if (sortBy === 'recommended') {
    filteredPosts.sort((a, b) => b.likes - a.likes);
  } else {
    filteredPosts.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    );
  }

  return filteredPosts;
};

const formatRelativeDate = (dateString?: string) => {
  if (!dateString) return '방금 전';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '방금 전';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
};



function CommunityToolbar({
  searchQuery,
  onSearchQueryChange,
  showFollowingOnly,
  onToggleFollowingOnly,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  isFilterOpen,
  onToggleFilterOpen,
  onCloseFilterOpen,
}: CommunityToolbarProps) {
  return (
    <section className="relative">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="게시글 검색..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          type="button"
          onClick={onToggleFilterOpen}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
            isFilterOpen
              ? 'border-orange-200 bg-orange-50 text-orange-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>필터</span>
        </button>

        <Link
          href="/community/write"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          <Filter className="h-4 w-4" />
          글쓰기
        </Link>
      </div>

      {isFilterOpen && (
        <div className="absolute right-0 top-full z-20 mt-3 w-full max-w-[360px] rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">필터 설정</h3>
            <button
              type="button"
              onClick={onCloseFilterOpen}
              className="text-xl leading-none text-gray-400 transition-colors hover:text-gray-600"
              aria-label="필터 닫기"
            >
              ×
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <p className="mb-3 text-sm font-medium text-gray-700">표시 옵션</p>
              <button
                type="button"
                onClick={onToggleFollowingOnly}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  showFollowingOnly
                    ? 'border-orange-200 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  팔로잉 글만 보기
                </span>
                {showFollowingOnly && <span className="text-base">✓</span>}
              </button>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="mb-3 text-sm font-medium text-gray-700">정렬 순서</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onSortByChange('recommended')}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    sortBy === 'recommended'
                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    추천순
                  </span>
                  {sortBy === 'recommended' && <span className="text-base">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => onSortByChange('latest')}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    sortBy === 'latest'
                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    최신순
                  </span>
                  {sortBy === 'latest' && <span className="text-base">✓</span>}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="mb-3 text-sm font-medium text-gray-700">보기 방식</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onViewModeChange('feed')}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    viewMode === 'feed'
                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    피드뷰
                  </span>
                  {viewMode === 'feed' && <span className="text-base">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('board')}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    viewMode === 'board'
                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <List className="h-4 w-4" />
                    게시판뷰
                  </span>
                  {viewMode === 'board' && <span className="text-base">✓</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function HighlightPostCard({ post }: { post: CommunityPost }) {
  return (
    <article className="flex h-[200px] flex-col rounded-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 transition-all hover:border-orange-300 hover:shadow-md">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
          {post.type === 'notice' ? '공지' : '추천'}
        </span>
        {post.category && (
          <span className="rounded-full border border-orange-300 px-2.5 py-1 text-xs font-medium text-orange-600">
            {getCommunityCategoryLabel(post.category)}
          </span>
        )}
      </div>

      <h3 className="mb-2 line-clamp-2 text-sm font-bold text-gray-900">{post.title}</h3>
      <p className="mb-3 line-clamp-3 flex-1 text-xs text-gray-600">{post.content}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{post.author.nickname}</span>
        <div className="flex items-center gap-3">
          <span>좋아요 {post.likes}</span>
          <span>댓글 {post.commentCount ?? 0}</span>
        </div>
      </div>
    </article>
  );
}

function BoardPostRow({ post, formatDate }: PostCardBaseProps) {
  const authorName = post.author.nickname;
  const likeCount = post.likes;
  const commentCount = post.commentCount ?? 0;

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-sm">
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {post.category && (
              <span className="rounded-full border border-pink-200 bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
                {getCommunityCategoryLabel(post.category)}
              </span>
            )}
            {(post.tags || []).slice(0, 2).map((tag, index) => (
              <span
                key={tag}
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                  index === 0
                    ? 'border-green-200 bg-green-100 text-green-700'
                    : 'border-blue-200 bg-blue-100 text-blue-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900 hover:text-orange-500">
            {post.title}
          </h3>
        </div>

        <div className="hidden min-w-[200px] flex-shrink-0 flex-col items-end justify-between md:flex">
          <div className="flex items-center gap-2">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={authorName}
                className="h-6 w-6 rounded-full object-cover"
              />
            )}
            <div className="flex items-center gap-1.5 text-right">
              <p className="text-sm font-medium text-gray-900">{authorName}</p>
              {post.isRealName && <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="text-xs">{formatDate(post.createdAt)}</span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {commentCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function FeedPostCard({ post, formatDate }: PostCardBaseProps) {
  const authorName = post.author.nickname;
  const likeCount = post.likes;
  const commentCount = post.commentCount ?? 0;

  return (
    <article className="rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-300">
      {post.highlightedComment && (
        <div className="border-b border-gray-100 px-4 pb-2 pt-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <span className="font-medium">{post.highlightedComment.author.nickname}</span>
            <span>님이 댓글을 남김</span>
          </div>
        </div>
      )}

      <div className="p-4 pb-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={authorName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{authorName}</span>
                {post.isRealName && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                {post.author.position && (
                  <span className="text-xs text-gray-500">· {post.author.position}</span>
                )}
              </div>
              <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>

          {post.isPromotion && (
            <span className="rounded-full bg-purple-500 px-2.5 py-1 text-xs font-medium text-white">
              홍보
            </span>
          )}
        </div>

        {(post.tags || []).length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {(post.tags || []).slice(0, 3).map((tag, index) => (
              <span
                key={tag}
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                  index === 0
                    ? 'border-green-200 bg-green-100 text-green-700'
                    : index === 1
                      ? 'border-orange-200 bg-orange-100 text-orange-700'
                      : 'border-gray-200 bg-gray-100 text-gray-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="mb-2 text-base font-bold text-gray-900 hover:text-orange-500">
          {post.title}
        </h3>
        <p className="mb-3 line-clamp-4 text-sm leading-relaxed text-gray-700">{post.content}</p>

        {post.images && post.images.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            {post.images.slice(0, 2).map((image, index) => (
              <div key={index} className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                <img src={image} alt={`post-${index}`} className="h-full w-full object-cover" />
                {index === 1 && post.images.length > 2 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl font-bold text-white">
                    +{post.images.length - 2}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button type="button" className="group flex items-center gap-1.5 text-gray-600 transition-colors hover:text-orange-500">
              <Heart className="h-5 w-5 group-hover:fill-orange-100" />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            <button type="button" className="group flex items-center gap-1.5 text-gray-600 transition-colors hover:text-blue-500">
              <MessageSquare className="h-5 w-5 group-hover:fill-blue-100" />
              <span className="text-sm font-medium">{commentCount}</span>
            </button>
          </div>
          <span className="text-xs text-gray-400">{getCommunityCategoryLabel(post.category)}</span>
        </div>
      </div>
    </article>
  );
}

export default function CommunityPage() {
  const [profileMode, setProfileMode] = useState<'real' | 'nickname'>('nickname');
  const [viewMode, setViewMode] = useState<'feed' | 'board'>('feed');
  const [sortBy, setSortBy] = useState<'recommended' | 'latest'>('recommended');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const allTags = useMemo(() => getAllTags(mockCommunityPosts), []);

  const highlightPosts = useMemo(
    () => getHighlightPosts(mockCommunityPosts, mockNotices),
    [],
  );

  const popularPosts = useMemo(() => getPopularPosts(undefined, 5), []);

  const visiblePosts = useMemo(
    () =>
      filterPosts(mockCommunityPosts, {
        selectedTags,
        searchQuery,
        showFollowingOnly,
        sortBy,
      }),
    [searchQuery, selectedTags, showFollowingOnly, sortBy],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const toggleProfileMode = () => {
    setProfileMode((prev) => (prev === 'real' ? 'nickname' : 'real'));
  };

  const toggleFollowingOnly = () => {
    setShowFollowingOnly((prev) => !prev);
  };

  const clearSelectedTags = () => {
    setSelectedTags([]);
  };

  const toggleFilterOpen = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const closeFilterOpen = () => {
    setIsFilterOpen(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1400px] overflow-x-hidden px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_320px]">
          <aside className="hidden lg:block">
            <div className="sticky top-4 space-y-4">
              <CommunityProfileCard
                profileMode={profileMode}
                onToggleProfileMode={toggleProfileMode}
                currentUser={COMMUNITY_CURRENT_USER}
              />

              <CommunityTagFilter
                allTags={allTags}
                selectedTags={selectedTags}
                onToggleTag={toggleTag}
                onClearTags={clearSelectedTags}
              />
            </div>
          </aside>

          <section className="min-w-0 space-y-6 overflow-hidden">
            <CommunityToolbar
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              showFollowingOnly={showFollowingOnly}
              onToggleFollowingOnly={toggleFollowingOnly}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isFilterOpen={isFilterOpen}
              onToggleFilterOpen={toggleFilterOpen}
              onCloseFilterOpen={closeFilterOpen}
            />

            {highlightPosts.length > 0 && <HighlightCarousel posts={highlightPosts} />}

            <section className="space-y-4">
              {visiblePosts.map(
                (post) => {
                  if (viewMode === 'board') {
                    return <BoardPostRow key={post.id} post={post} formatDate={formatRelativeDate} />;
                  }

                  return <FeedPostCard key={post.id} post={post} formatDate={formatRelativeDate} />;
                }
              )}

              {visiblePosts.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
                  조건에 맞는 게시글이 없습니다.
                </div>
              )}
            </section>
          </section>

          <aside className="hidden space-y-4 lg:block">
            <PopularPostsWidget popularPosts={popularPosts} />
            <OrangePickWidget articles={orangePickArticles} />
          </aside>
        </div>
      </div>
    </main>
  );
}
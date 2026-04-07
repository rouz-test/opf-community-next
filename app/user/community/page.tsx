'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  mockCommunityPosts,
  mockNotices,
  getPopularPosts,
  orangePickArticles,
  communityAuthors,
  type CommunityPost,
} from '@/data/mockCommunityPosts';
import { useAuth } from '@/app/user/components/providers/AuthProvider';
import { HighlightCarousel } from '@/app/user/components/community/HighlightCarousel';
import { CommunityProfileCard } from '@/app/user/components/community/CommunityProfileCard';
import { CommunityTagFilter } from '@/app/user/components/community/CommunityTagFilter';
import { PopularPostsWidget } from '@/app/user/components/community/PopularPostsWidget';
import { OrangePickWidget } from '@/app/user/components/community/OrangePickWidget';
import { FeedPostCard } from '@/app/user/components/community/FeedPostCard';
import { BoardPostRow } from '@/app/user/components/community/BoardPostRow';
import { WritePostModal } from '@/app/user/components/community/WritePostModal';
import { CommunityToolbar } from '@/app/user/components/community/CommunityToolbar';
import { CommunityWriteAction } from '@/app/user/components/community/CommunityWriteAction';
type PostCardBaseProps = {
  post: CommunityPost;
  formatDate: (dateString?: string) => string;
  searchQuery: string;
};


const COMMUNITY_CURRENT_USER = {
  real: {
    ...communityAuthors.startupDreamerReal,
    postsCount: 7,
    commentsCount: 10,
  },
  nickname: {
    ...communityAuthors.startupDreamer,
    postsCount: 7,
    commentsCount: 10,
  },
};

const COMMUNITY_PROFILE_MODE_STORAGE_KEY = 'community-profile-mode';

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

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightMatchedText = (text: string, searchQuery: string) => {
  const keyword = searchQuery.trim();

  if (!keyword) return text;

  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === keyword.toLowerCase()) {
      return (
        <mark key={`${part}-${index}`} className="rounded bg-yellow-200 px-0.5 text-inherit">
          {part}
        </mark>
      );
    }

    return part;
  });
};



export default function CommunityPage() {
  const [profileMode, setProfileMode] = useState<'real' | 'nickname'>('nickname');
  const [viewMode, setViewMode] = useState<'feed' | 'board'>('feed');
  const [sortBy, setSortBy] = useState<'recommended' | 'latest'>('recommended');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileTagFilterOpen, setIsMobileTagFilterOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const { isLoggedIn } = useAuth();

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
  const communityCurrentUser =
    profileMode === 'real' ? COMMUNITY_CURRENT_USER.real : COMMUNITY_CURRENT_USER.nickname;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const syncProfileMode = (nextMode: 'real' | 'nickname') => {
    setProfileMode(nextMode);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COMMUNITY_PROFILE_MODE_STORAGE_KEY, nextMode);
      window.dispatchEvent(
        new CustomEvent('community-profile-mode-change', {
          detail: { mode: nextMode },
        }),
      );
    }
  };

  const toggleProfileMode = () => {
    syncProfileMode(profileMode === 'real' ? 'nickname' : 'real');
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

  const toggleMobileTagFilterOpen = () => {
    setIsMobileTagFilterOpen((prev) => !prev);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedMode = window.localStorage.getItem(COMMUNITY_PROFILE_MODE_STORAGE_KEY);
    if (savedMode === 'real' || savedMode === 'nickname') {
      setProfileMode(savedMode);
    }

    const handleProfileModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode?: 'real' | 'nickname' }>;
      const nextMode = customEvent.detail?.mode;

      if (nextMode === 'real' || nextMode === 'nickname') {
        setProfileMode(nextMode);
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
    const isMobileViewport = window.innerWidth < 768;

    if (isWriteModalOpen || (isMobileViewport && (isMobileTagFilterOpen || isFilterOpen))) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileTagFilterOpen, isFilterOpen, isWriteModalOpen]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1400px] overflow-x-hidden px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_320px]">
          <aside className="hidden lg:block">
            <div className="sticky top-4 space-y-4">
              {isLoggedIn ? (
                <CommunityProfileCard
                  profileMode={profileMode}
                  onToggleProfileMode={toggleProfileMode}
                  onWriteClick={() => setIsWriteModalOpen(true)}
                  showWriteButton
                  currentUser={communityCurrentUser}
                />
              ) : null}

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
            isTagFilterOpen={isMobileTagFilterOpen}
            onToggleTagFilterOpen={toggleMobileTagFilterOpen}
            allTags={allTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            onClearTags={clearSelectedTags}
          />


            {highlightPosts.length > 0 && <HighlightCarousel posts={highlightPosts} />}

            <section className="space-y-4">
              {visiblePosts.map(
                (post) => {
                  if (viewMode === 'board') {
                    return (
                      <BoardPostRow
                        key={post.id}
                        post={post}
                        formatDate={formatRelativeDate}
                        searchQuery={searchQuery}
                      />
                    );
                  }

                  return (
                    <FeedPostCard
                      key={post.id}
                      post={post}
                      formatDate={formatRelativeDate}
                      searchQuery={searchQuery}
                    />
                  );
                }
              )}

              {visiblePosts.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
                  검색 결과가 없습니다.
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

      <CommunityWriteAction onClick={() => setIsWriteModalOpen(true)} />
        
      <WritePostModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        currentUser={communityCurrentUser}
      />
    </main>
  );
}
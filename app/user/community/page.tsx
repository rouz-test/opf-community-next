'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Flex, Grid, Text } from '@chakra-ui/react';
import {
  mockCommunityPosts,
  mockNotices,
  getPopularPosts,
  orangePickArticles,
  type CommunityPost,
  COMMUNITY_CURRENT_USER,
} from '@/app/user/lib/community-content-data';
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

export default function CommunityPage() {
  const [viewMode, setViewMode] = useState<'feed' | 'board'>('feed');
  const [sortBy, setSortBy] = useState<'recommended' | 'latest'>('recommended');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileTagFilterOpen, setIsMobileTagFilterOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const {
    isLoggedIn,
    defaultCommunityIdentity,
    setDefaultCommunityIdentity,
  } = useAuth();

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
    setDefaultCommunityIdentity(defaultCommunityIdentity === 'real' ? 'anonymous' : 'real');
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
    <Box as="main" minH="screen" bg="gray.50">
      <Box mx="auto" maxW="1400px" overflowX="hidden" px="4" py="6">
        <Grid templateColumns={{ base: '1fr', lg: '280px minmax(0, 1fr) 320px' }} gap="6">
          <Box as="aside" display={{ base: 'none', lg: 'block' }}>
            <StackColumn top="4">
              {isLoggedIn ? (
                <CommunityProfileCard
                  profileMode={defaultCommunityIdentity}
                  onToggleProfileMode={toggleProfileMode}
                  onWriteClick={() => setIsWriteModalOpen(true)}
                  showWriteButton
                  currentUser={COMMUNITY_CURRENT_USER}
                />
              ) : null}

              <CommunityTagFilter
                allTags={allTags}
                selectedTags={selectedTags}
                onToggleTag={toggleTag}
                onClearTags={clearSelectedTags}
              />
            </StackColumn>
          </Box>

          <Box as="section" minW="0" overflow="hidden">
            <Flex direction="column" gap="6">

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

              {highlightPosts.length > 0 ? <HighlightCarousel posts={highlightPosts} /> : null}

              <Flex as="section" direction="column" gap="4">
                {visiblePosts.map((post) => {
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
                })}

                {visiblePosts.length === 0 ? (
                  <Box rounded="lg" borderWidth="1px" borderStyle="dashed" borderColor="gray.300" bg="white" p="10" textAlign="center">
                    <Text fontSize="sm" color="gray.500">
                      검색 결과가 없습니다.
                    </Text>
                  </Box>
                ) : null}
              </Flex>
            </Flex>
          </Box>

          <Flex as="aside" display={{ base: 'none', lg: 'flex' }} direction="column" gap="4">
            <PopularPostsWidget popularPosts={popularPosts} />
            <OrangePickWidget articles={orangePickArticles} />
          </Flex>
        </Grid>
      </Box>

      <CommunityWriteAction onClick={() => setIsWriteModalOpen(true)} />

      <WritePostModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        currentUser={COMMUNITY_CURRENT_USER}
      />
    </Box>
  );
}

function StackColumn({
  children,
  top,
}: {
  children: React.ReactNode;
  top: string;
}) {
  return (
    <Flex position="sticky" top={top} direction="column" gap="4">
      {children}
    </Flex>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Flex, Grid, Portal, Spinner, Text } from '@chakra-ui/react';
import {
  mockCommunityPosts,
  mockNotices,
  orangePickArticles,
  type CommunityPost,
  COMMUNITY_CURRENT_USER,
  mapCommunityContentToPost,
} from '@/app/user/lib/community-content-data';
import type { CommunityContent } from '@/types/community-content';
import { useAuth } from '@/app/user/components/providers/AuthProvider';
import { HighlightCarousel } from '@/app/user/components/community/HighlightCarousel';
import { CommunityProfileCard } from '@/app/user/components/community/CommunityProfileCard';
import { CommunityTagFilter } from '@/app/user/components/community/CommunityTagFilter';
import { OrangePickWidget } from '@/app/user/components/community/OrangePickWidget';
import { FeedPostCard } from '@/app/user/components/community/FeedPostCard';
import { BoardPostRow } from '@/app/user/components/community/BoardPostRow';
import { WritePostModal } from '@/app/user/components/community/WritePostModal';
import { CommunityToolbar } from '@/app/user/components/community/CommunityToolbar';
import { CommunityWriteAction } from '@/app/user/components/community/CommunityWriteAction';
import { Button } from '@/app/user/components/ui/button';
import { toaster } from '@/app/user/components/ui/toaster';

type CommunityPageState = {
  selectedTags: string[];
  searchQuery: string;
  showFollowingOnly: boolean;
  sortBy: 'recommended' | 'latest';
};

const POSTS_PAGE_SIZE = 20;

const getAllTags = (posts: CommunityPost[]) =>
  Array.from(new Set(posts.flatMap((post) => post.tags || [])));

const getHighlightPosts = (posts: CommunityPost[], notices: CommunityPost[]) =>
  [...notices, ...posts].filter((post) => post.isNotice || post.isPinned);

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
  const [renderedPostCount, setRenderedPostCount] = useState(POSTS_PAGE_SIZE);
  const [createdPosts, setCreatedPosts] = useState<CommunityPost[]>([]);
  const [deletedPostIds, setDeletedPostIds] = useState<string[]>([]);
  const [deleteTargetPost, setDeleteTargetPost] = useState<CommunityPost | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    isLoggedIn,
    defaultCommunityIdentity,
    setDefaultCommunityIdentity,
  } = useAuth();

  const baseCommunityPosts = useMemo(
    () =>
      [...createdPosts, ...mockCommunityPosts.filter((post) => !createdPosts.some((created) => created.id === post.id))]
        .filter((post) => !deletedPostIds.includes(post.id)),
    [createdPosts, deletedPostIds],
  );

  const allTags = useMemo(() => getAllTags(baseCommunityPosts), [baseCommunityPosts]);

  const highlightPosts = useMemo(
    () => getHighlightPosts(baseCommunityPosts, mockNotices.filter((post) => !deletedPostIds.includes(post.id))),
    [baseCommunityPosts, deletedPostIds],
  );

  const visiblePosts = useMemo(
    () =>
      filterPosts(baseCommunityPosts, {
        selectedTags,
        searchQuery,
        showFollowingOnly,
        sortBy,
      }),
    [baseCommunityPosts, searchQuery, selectedTags, showFollowingOnly, sortBy],
  );
  const renderedPosts = useMemo(
    () => visiblePosts.slice(0, renderedPostCount),
    [renderedPostCount, visiblePosts],
  );
  const hasMorePosts = renderedPostCount < visiblePosts.length;

  const toggleTag = (tag: string) => {
    setRenderedPostCount(POSTS_PAGE_SIZE);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const toggleProfileMode = () => {
    setDefaultCommunityIdentity(defaultCommunityIdentity === 'real' ? 'anonymous' : 'real');
  };

  const toggleFollowingOnly = () => {
    setRenderedPostCount(POSTS_PAGE_SIZE);
    setShowFollowingOnly((prev) => !prev);
  };

  const clearSelectedTags = () => {
    setRenderedPostCount(POSTS_PAGE_SIZE);
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

  const handleCreatedContent = (createdContent: CommunityContent) => {
    const nextPost = mapCommunityContentToPost(createdContent);
    setCreatedPosts((prev) => [nextPost, ...prev.filter((post) => post.id !== nextPost.id)]);
    setRenderedPostCount((prev) => Math.max(prev, POSTS_PAGE_SIZE));
    setIsWriteModalOpen(false);
  };

  const handleRequestDeletePost = (post: CommunityPost) => {
    setDeleteTargetPost(post);
  };

  const handleConfirmDeletePost = async () => {
    if (!deleteTargetPost || isDeletingPost) return;

    try {
      setIsDeletingPost(true);

      const response = await fetch(`/api/mock/community-contents/${deleteTargetPost.id}`, {
        method: 'DELETE',
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message || '게시글을 삭제하지 못했습니다.');
      }

      setDeletedPostIds((prev) => [...prev, deleteTargetPost.id]);
      setCreatedPosts((prev) => prev.filter((post) => post.id !== deleteTargetPost.id));
      setDeleteTargetPost(null);
      toaster.create({
        description: '게시글이 삭제되었습니다.',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : '게시글을 삭제하지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
    } finally {
      setIsDeletingPost(false);
    }
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

  useEffect(() => {
    if (!hasMorePosts) return;
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry?.isIntersecting) return;
        setRenderedPostCount((prev) => Math.min(prev + POSTS_PAGE_SIZE, visiblePosts.length));
      },
      {
        rootMargin: '240px 0px',
      },
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMorePosts, visiblePosts.length]);

  return (
    <Box as="main" minH="screen" bg="gray.50">
      <Box mx="auto" maxW="1400px" px="4" py="6">
        <Grid templateColumns={{ base: '1fr', lg: '280px minmax(0, 1fr) 320px' }} gap="6">
          <Box as="aside" display={{ base: 'none', lg: 'block' }}>
            <Flex direction="column" gap="4">
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
            </Flex>
          </Box>

          <Box as="section" minW="0" overflow="visible">
            <Flex direction="column" gap="6">
              <Flex direction="column" gap="2.5">
                {highlightPosts.length > 0 ? <HighlightCarousel posts={highlightPosts} onRequestDelete={handleRequestDeletePost} /> : null}

                <CommunityToolbar
                  searchQuery={searchQuery}
                  onSearchQueryChange={(value) => {
                    setRenderedPostCount(POSTS_PAGE_SIZE);
                    setSearchQuery(value);
                  }}
                  showFollowingOnly={showFollowingOnly}
                  onToggleFollowingOnly={toggleFollowingOnly}
                  sortBy={sortBy}
                  onSortByChange={(value) => {
                    setRenderedPostCount(POSTS_PAGE_SIZE);
                    setSortBy(value);
                  }}
                  viewMode={viewMode}
                  onViewModeChange={(value) => {
                    setRenderedPostCount(POSTS_PAGE_SIZE);
                    setViewMode(value);
                  }}
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
              </Flex>

              <Flex as="section" direction="column" gap="4">
                {renderedPosts.map((post) => {
                  if (viewMode === 'board') {
                    return (
                      <BoardPostRow
                        key={post.id}
                        post={post}
                        formatDate={formatRelativeDate}
                        searchQuery={searchQuery}
                        onRequestDelete={handleRequestDeletePost}
                      />
                    );
                  }

                  return (
                    <FeedPostCard
                      key={post.id}
                      post={post}
                      formatDate={formatRelativeDate}
                      searchQuery={searchQuery}
                      onRequestDelete={handleRequestDeletePost}
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

                {hasMorePosts ? (
                  <Flex ref={loadMoreRef} align="center" justify="center" py="6">
                    <Spinner size="sm" color="#FF6900" />
                  </Flex>
                ) : null}
              </Flex>
            </Flex>
          </Box>

          <Flex as="aside" display={{ base: 'none', lg: 'flex' }} direction="column" gap="4">
            <OrangePickWidget articles={orangePickArticles} />
          </Flex>
        </Grid>
      </Box>

      <CommunityWriteAction onClick={() => setIsWriteModalOpen(true)} />

      <WritePostModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onCreated={handleCreatedContent}
        currentUser={COMMUNITY_CURRENT_USER}
      />

      {deleteTargetPost ? (
        <Portal>
          <Flex position="fixed" inset="0" zIndex="90" align="center" justify="center" bg="blackAlpha.500" px="4">
            <Box w="full" maxW="sm" rounded="24px" bg="white" p="6" boxShadow="0 20px 60px rgba(15, 23, 42, 0.18)">
              <Text textAlign="center" fontSize="16px" fontWeight="700" color="gray.900">
                게시글을 삭제하시겠습니까?
              </Text>
              <Text mt="2" textAlign="center" fontSize="14px" color="gray.500">
                삭제한 게시글은 복구할 수 없습니다.
              </Text>

              <Flex mt="5" gap="3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteTargetPost(null)}
                  flex="1"
                  disabled={isDeletingPost}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConfirmDeletePost}
                  flex="1"
                  disabled={isDeletingPost}
                >
                  삭제
                </Button>
              </Flex>
            </Box>
          </Flex>
        </Portal>
      ) : null}
    </Box>
  );
}

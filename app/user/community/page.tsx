'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Flex, Grid, Spinner, Text } from '@chakra-ui/react';
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
import ActionConfirmModal from '@/app/user/components/modal/action-confirm-modal';
import { CommunityToolbar } from '@/app/user/components/community/CommunityToolbar';
import { CommunityWriteAction } from '@/app/user/components/community/CommunityWriteAction';
import { toaster } from '@/app/user/components/ui/toaster';
import {
  DEFAULT_COMMUNITY_FILTER_PREFERENCES,
  normalizeCommunityFilterPreferences,
  type CommunitySortMode,
  type CommunityViewMode,
  type UserCommunityPreferences,
} from '@/app/user/lib/community-filter-preferences';

type CommunityPageState = {
  selectedTags: string[];
  searchQuery: string;
  showFollowingOnly: boolean;
  sortBy: CommunitySortMode;
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
  const [viewMode, setViewMode] = useState<CommunityViewMode>(DEFAULT_COMMUNITY_FILTER_PREFERENCES.viewMode);
  const [sortBy, setSortBy] = useState<CommunitySortMode>(DEFAULT_COMMUNITY_FILTER_PREFERENCES.sortBy);
  const [selectedTags, setSelectedTags] = useState<string[]>(DEFAULT_COMMUNITY_FILTER_PREFERENCES.selectedTags);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFollowingOnly, setShowFollowingOnly] = useState(DEFAULT_COMMUNITY_FILTER_PREFERENCES.showFollowingOnly);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileTagFilterOpen, setIsMobileTagFilterOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [renderedPostCount, setRenderedPostCount] = useState(POSTS_PAGE_SIZE);
  const [createdPosts, setCreatedPosts] = useState<CommunityPost[]>([]);
  const [updatedPosts, setUpdatedPosts] = useState<CommunityPost[]>([]);
  const [deletedPostIds, setDeletedPostIds] = useState<string[]>([]);
  const [authorHiddenPostIds, setAuthorHiddenPostIds] = useState<string[]>([]);
  const [deleteTargetPost, setDeleteTargetPost] = useState<CommunityPost | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [hideTargetPost, setHideTargetPost] = useState<CommunityPost | null>(null);
  const [isHidingPost, setIsHidingPost] = useState(false);
  const [editingContent, setEditingContent] = useState<CommunityContent | null>(null);
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    isLoggedIn,
    defaultCommunityIdentity,
    setDefaultCommunityIdentity,
  } = useAuth();

  const baseCommunityPosts = useMemo(
    () =>
      [
        ...createdPosts,
        ...mockCommunityPosts
          .map((post) => updatedPosts.find((updated) => updated.id === post.id) ?? post)
          .filter((post) => !createdPosts.some((created) => created.id === post.id)),
      ]
        .filter((post) => !deletedPostIds.includes(post.id) && !authorHiddenPostIds.includes(post.id)),
    [authorHiddenPostIds, createdPosts, deletedPostIds, updatedPosts],
  );

  const allTags = useMemo(() => getAllTags(baseCommunityPosts), [baseCommunityPosts]);

  const highlightPosts = useMemo(
    () =>
      getHighlightPosts(
        baseCommunityPosts,
        mockNotices.filter((post) => !deletedPostIds.includes(post.id) && !authorHiddenPostIds.includes(post.id)),
      ),
    [authorHiddenPostIds, baseCommunityPosts, deletedPostIds],
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

  useEffect(() => {
    let isCancelled = false;

    const loadPreferences = async () => {
      try {
        const response = await fetch(`/api/mock/user-preferences?accountId=${COMMUNITY_CURRENT_USER.accountId}`, {
          cache: 'no-store',
        });
        const data = (await response.json().catch(() => null)) as UserCommunityPreferences | { message?: string } | null;

        if (!response.ok || !data || !('community' in data)) {
          throw new Error((data as { message?: string } | null)?.message || '필터 설정을 불러오지 못했습니다.');
        }

        if (isCancelled) return;

        const preferences = normalizeCommunityFilterPreferences(data.community);
        setViewMode(preferences.viewMode);
        setSortBy(preferences.sortBy);
        setShowFollowingOnly(preferences.showFollowingOnly);
        setSelectedTags(preferences.selectedTags);
        setRenderedPostCount(POSTS_PAGE_SIZE);
      } catch (error) {
        console.error('[CommunityPage] failed to load filter preferences:', error);
      } finally {
        if (!isCancelled) {
          setIsPreferencesLoaded(true);
        }
      }
    };

    void loadPreferences();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isPreferencesLoaded) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetch(`/api/mock/user-preferences?accountId=${COMMUNITY_CURRENT_USER.accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          accountId: COMMUNITY_CURRENT_USER.accountId,
          community: {
            viewMode,
            sortBy,
            showFollowingOnly,
            selectedTags,
          },
        }),
      }).catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('[CommunityPage] failed to save filter preferences:', error);
      });
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isPreferencesLoaded, selectedTags, showFollowingOnly, sortBy, viewMode]);

  const handleCreatedContent = (createdContent: CommunityContent) => {
    const nextPost = mapCommunityContentToPost(createdContent);
    setCreatedPosts((prev) => [nextPost, ...prev.filter((post) => post.id !== nextPost.id)]);
    setRenderedPostCount((prev) => Math.max(prev, POSTS_PAGE_SIZE));
    setIsWriteModalOpen(false);
    setEditingContent(null);
  };

  const handleUpdatedContent = (updatedContent: CommunityContent) => {
    const nextPost = mapCommunityContentToPost(updatedContent);
    setCreatedPosts((prev) =>
      prev.some((post) => post.id === nextPost.id)
        ? prev.map((post) => (post.id === nextPost.id ? nextPost : post))
        : prev,
    );
    setUpdatedPosts((prev) =>
      prev.some((post) => post.id === nextPost.id)
        ? prev.map((post) => (post.id === nextPost.id ? nextPost : post))
        : [nextPost, ...prev.filter((post) => post.id !== nextPost.id)],
    );
    setIsWriteModalOpen(false);
    setEditingContent(null);
  };

  const handleRequestDeletePost = (post: CommunityPost) => {
    setDeleteTargetPost(post);
  };

  const handleRequestHidePost = (post: CommunityPost) => {
    setHideTargetPost(post);
  };

  const handleToggleLikePost = async (post: CommunityPost) => {
    try {
      const method = post.isLikedByMe ? 'DELETE' : 'POST';
      const response = await fetch(`/api/mock/community-contents/${post.id}/like?accountId=${COMMUNITY_CURRENT_USER.accountId}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = (await response.json().catch(() => null)) as
        | { content?: CommunityContent; liked?: boolean; message?: string }
        | null;

      if (!response.ok || !data?.content) {
        throw new Error(data?.message || '좋아요를 처리하지 못했습니다.');
      }

      const nextPost = {
        ...mapCommunityContentToPost(data.content),
        isLikedByMe: Boolean(data.liked),
        isSavedByMe: post.isSavedByMe,
      };

      setCreatedPosts((prev) =>
        prev.some((item) => item.id === nextPost.id)
          ? prev.map((item) => (item.id === nextPost.id ? nextPost : item))
          : prev,
      );
      setUpdatedPosts((prev) =>
        prev.some((item) => item.id === nextPost.id)
          ? prev.map((item) => (item.id === nextPost.id ? nextPost : item))
          : [nextPost, ...prev.filter((item) => item.id !== nextPost.id)],
      );
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : '좋아요를 처리하지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
    }
  };

  const handleToggleSavePost = async (post: CommunityPost) => {
    try {
      const method = post.isSavedByMe ? 'DELETE' : 'POST';
      const response = await fetch(`/api/mock/community-contents/${post.id}/save?accountId=${COMMUNITY_CURRENT_USER.accountId}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = (await response.json().catch(() => null)) as
        | { content?: CommunityContent; saved?: boolean; message?: string }
        | null;

      if (!response.ok || !data?.content) {
        throw new Error(data?.message || '저장을 처리하지 못했습니다.');
      }

      const nextPost = {
        ...mapCommunityContentToPost(data.content),
        isLikedByMe: post.isLikedByMe,
        isSavedByMe: Boolean(data.saved),
      };

      setCreatedPosts((prev) =>
        prev.some((item) => item.id === nextPost.id)
          ? prev.map((item) => (item.id === nextPost.id ? nextPost : item))
          : prev,
      );
      setUpdatedPosts((prev) =>
        prev.some((item) => item.id === nextPost.id)
          ? prev.map((item) => (item.id === nextPost.id ? nextPost : item))
          : [nextPost, ...prev.filter((item) => item.id !== nextPost.id)],
      );
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : '저장을 처리하지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
    }
  };

  const handleRequestEditPost = async (post: CommunityPost) => {
    try {
      const response = await fetch(`/api/mock/community-contents/${post.id}`, {
        cache: 'no-store',
      });

      const data = (await response.json().catch(() => null)) as CommunityContent | { message?: string } | null;

      if (!response.ok || !data || !('id' in data)) {
        throw new Error((data as { message?: string } | null)?.message || '게시글 정보를 불러오지 못했습니다.');
      }

      setEditingContent(data);
      setIsWriteModalOpen(true);
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : '게시글 정보를 불러오지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
    }
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

  const handleConfirmHidePost = async () => {
    if (!hideTargetPost || isHidingPost) return;

    try {
      setIsHidingPost(true);

      const response = await fetch(`/api/mock/community-contents/${hideTargetPost.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flags: {
            isHiddenByAuthor: true,
          },
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message || '게시글을 숨기지 못했습니다.');
      }

      setAuthorHiddenPostIds((prev) => [...prev, hideTargetPost.id]);
      setCreatedPosts((prev) => prev.filter((post) => post.id !== hideTargetPost.id));
      setHideTargetPost(null);
      toaster.create({
        description: '게시글이 숨김 처리되었습니다.',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : '게시글을 숨기지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
    } finally {
      setIsHidingPost(false);
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
                  onWriteClick={() => {
                    setEditingContent(null);
                    setIsWriteModalOpen(true);
                  }}
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
                {highlightPosts.length > 0 ? (
                  <HighlightCarousel
                    posts={highlightPosts}
                    onToggleLike={handleToggleLikePost}
                    onToggleSave={handleToggleSavePost}
                    onRequestDelete={handleRequestDeletePost}
                    onRequestEdit={handleRequestEditPost}
                    onRequestHide={handleRequestHidePost}
                  />
                ) : null}

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
                        onToggleLike={handleToggleLikePost}
                        onToggleSave={handleToggleSavePost}
                        onRequestDelete={handleRequestDeletePost}
                        onRequestEdit={handleRequestEditPost}
                        onRequestHide={handleRequestHidePost}
                      />
                    );
                  }

                  return (
                    <FeedPostCard
                      key={post.id}
                      post={post}
                      formatDate={formatRelativeDate}
                      searchQuery={searchQuery}
                      onToggleLike={handleToggleLikePost}
                      onToggleSave={handleToggleSavePost}
                      onRequestDelete={handleRequestDeletePost}
                      onRequestEdit={handleRequestEditPost}
                      onRequestHide={handleRequestHidePost}
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

      <CommunityWriteAction
        onClick={() => {
          setEditingContent(null);
          setIsWriteModalOpen(true);
        }}
      />

      <WritePostModal
        isOpen={isWriteModalOpen}
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingContent(null);
        }}
        onCreated={handleCreatedContent}
        onUpdated={handleUpdatedContent}
        editingContent={editingContent}
        currentUser={COMMUNITY_CURRENT_USER}
      />

      <ActionConfirmModal
        isOpen={Boolean(deleteTargetPost)}
        title="게시글을 삭제하시겠습니까?"
        description="삭제한 게시글은 복구할 수 없습니다."
        confirmLabel="삭제"
        isLoading={isDeletingPost}
        onCancel={() => setDeleteTargetPost(null)}
        onConfirm={handleConfirmDeletePost}
      />

      <ActionConfirmModal
        isOpen={Boolean(hideTargetPost)}
        title="게시글을 숨기시겠습니까?"
        description="숨김 처리된 게시글은 커뮤니티 메인에서 보이지 않고, 마이페이지의 숨김 탭에서 확인할 수 있습니다."
        confirmLabel="숨김"
        isLoading={isHidingPost}
        onCancel={() => setHideTargetPost(null)}
        onConfirm={handleConfirmHidePost}
      />
    </Box>
  );
}

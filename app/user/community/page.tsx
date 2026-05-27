'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Flex, Grid, Spinner, Text } from '@chakra-ui/react';
import {
  type CommunityPost,
  COMMUNITY_CURRENT_USER,
  mapCommunityContentToPost,
} from '@/app/user/lib/community-content-data';
import { orangePickArticles } from '@/data/orange-pick-articles';
import tagsData from '@/data/mock/tags.json';
import type { CommunityContent, CommunityContentListResponse } from '@/types/community-content';
import type { Tag as CommunityTag } from '@/types/tag';
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

const POSTS_PAGE_SIZE = 20;

const communityTags = tagsData as CommunityTag[];

const getAllTags = () =>
  communityTags
    .filter((tag) => tag.status === 'active' && !tag.isDefault)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((tag) => tag.name);

const getHighlightPosts = (posts: CommunityPost[], notices: CommunityPost[]) =>
  [...notices, ...posts].filter((post) => post.isNotice || post.isPinned);

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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showFollowingOnly, setShowFollowingOnly] = useState(DEFAULT_COMMUNITY_FILTER_PREFERENCES.showFollowingOnly);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileTagFilterOpen, setIsMobileTagFilterOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [serverPosts, setServerPosts] = useState<CommunityPost[]>([]);
  const [highlightServerPosts, setHighlightServerPosts] = useState<CommunityPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
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
      serverPosts
        .map((post) => updatedPosts.find((updated) => updated.id === post.id) ?? post)
        .filter((post) => !deletedPostIds.includes(post.id) && !authorHiddenPostIds.includes(post.id)),
    [authorHiddenPostIds, deletedPostIds, serverPosts, updatedPosts],
  );

  const allTags = useMemo(() => getAllTags(), []);

  const highlightPosts = useMemo(
    () =>
      getHighlightPosts(
        highlightServerPosts
          .map((post) => updatedPosts.find((updated) => updated.id === post.id) ?? post)
          .filter((post) => !deletedPostIds.includes(post.id) && !authorHiddenPostIds.includes(post.id)),
        [],
      ),
    [authorHiddenPostIds, deletedPostIds, highlightServerPosts, updatedPosts],
  );

  const visiblePosts = baseCommunityPosts;
  const hasMorePosts = currentPage < totalPages;

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

  const fetchCommunityPosts = useCallback(
    async (page: number, mode: 'replace' | 'append' = 'replace') => {
      if (mode === 'replace') {
        setIsPostsLoading(true);
      } else {
        setIsLoadingMorePosts(true);
      }

      try {
        const searchParams = new URLSearchParams({
          status: 'published',
          page: String(page),
          pageSize: String(POSTS_PAGE_SIZE),
          accountId: COMMUNITY_CURRENT_USER.accountId,
          sortKey: sortBy === 'recommended' ? 'like' : 'date',
          sortDirection: 'desc',
        });

        const search = debouncedSearchQuery.trim();
        if (search) {
          searchParams.set('search', search);
        }

        for (const tag of selectedTags) {
          searchParams.append('tag', tag);
        }

        if (showFollowingOnly) {
          searchParams.set('followingOnly', 'true');
        }

        const response = await fetch(`/api/mock/community-contents?${searchParams.toString()}`, {
          cache: 'no-store',
        });
        const data = (await response.json().catch(() => null)) as CommunityContentListResponse | { message?: string } | null;

        if (!response.ok || !data || !('items' in data)) {
          throw new Error((data as { message?: string } | null)?.message || '게시글 목록을 불러오지 못했습니다.');
        }

        const nextPosts = data.items.map(mapCommunityContentToPost);

        setServerPosts((prev) => {
          if (mode === 'replace') return nextPosts;

          const merged = [...prev];
          for (const nextPost of nextPosts) {
            const existingIndex = merged.findIndex((post) => post.id === nextPost.id);
            if (existingIndex >= 0) {
              merged[existingIndex] = nextPost;
            } else {
              merged.push(nextPost);
            }
          }
          return merged;
        });
        setCurrentPage(data.meta.page);
        setTotalPages(data.meta.totalPages);
      } catch (error) {
        toaster.create({
          description: error instanceof Error ? error.message : '게시글 목록을 불러오지 못했습니다.',
          type: 'error',
          duration: 2000,
        });
      } finally {
        if (mode === 'replace') {
          setIsPostsLoading(false);
        } else {
          setIsLoadingMorePosts(false);
        }
      }
    },
    [debouncedSearchQuery, selectedTags, showFollowingOnly, sortBy],
  );

  const fetchHighlightPosts = useCallback(async () => {
    try {
      const searchParams = new URLSearchParams({
        status: 'published',
        page: '1',
        pageSize: '20',
        accountId: COMMUNITY_CURRENT_USER.accountId,
        sortKey: 'date',
        sortDirection: 'desc',
      });
      searchParams.append('flag', 'notice');
      searchParams.append('flag', 'pinned');

      const response = await fetch(`/api/mock/community-contents?${searchParams.toString()}`, {
        cache: 'no-store',
      });
      const data = (await response.json().catch(() => null)) as CommunityContentListResponse | { message?: string } | null;

      if (!response.ok || !data || !('items' in data)) {
        throw new Error((data as { message?: string } | null)?.message || '캐러셀 게시글을 불러오지 못했습니다.');
      }

      setHighlightServerPosts(data.items.map(mapCommunityContentToPost));
    } catch (error) {
      console.error('[CommunityPage] failed to load highlight posts:', error);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    void fetchCommunityPosts(1, 'replace');
  }, [fetchCommunityPosts]);

  useEffect(() => {
    void fetchHighlightPosts();
  }, [fetchHighlightPosts]);

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

  const handleCreatedContent = () => {
    setIsWriteModalOpen(false);
    setEditingContent(null);
    void fetchCommunityPosts(1, 'replace');
    void fetchHighlightPosts();
  };

  const handleUpdatedContent = (updatedContent: CommunityContent) => {
    const nextPost = mapCommunityContentToPost(updatedContent);
    setUpdatedPosts((prev) =>
      prev.some((post) => post.id === nextPost.id)
        ? prev.map((post) => (post.id === nextPost.id ? nextPost : post))
        : [nextPost, ...prev.filter((post) => post.id !== nextPost.id)],
    );
    setIsWriteModalOpen(false);
    setEditingContent(null);
    void fetchCommunityPosts(1, 'replace');
    void fetchHighlightPosts();
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
    if (isPostsLoading || isLoadingMorePosts) return;
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry?.isIntersecting) return;
        void fetchCommunityPosts(currentPage + 1, 'append');
      },
      {
        rootMargin: '240px 0px',
      },
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [currentPage, fetchCommunityPosts, hasMorePosts, isLoadingMorePosts, isPostsLoading]);

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
                    setSearchQuery(value);
                  }}
                  showFollowingOnly={showFollowingOnly}
                  onToggleFollowingOnly={toggleFollowingOnly}
                  sortBy={sortBy}
                  onSortByChange={(value) => {
                    setSortBy(value);
                  }}
                  viewMode={viewMode}
                  onViewModeChange={(value) => {
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
                {isPostsLoading ? (
                  <Flex align="center" justify="center" py="10">
                    <Spinner size="sm" color="#FF6900" />
                  </Flex>
                ) : null}

                {!isPostsLoading && visiblePosts.map((post) => {
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

                {!isPostsLoading && visiblePosts.length === 0 ? (
                  <Box rounded="lg" borderWidth="1px" borderStyle="dashed" borderColor="gray.300" bg="white" p="10" textAlign="center">
                    <Text fontSize="sm" color="gray.500">
                      검색 결과가 없습니다.
                    </Text>
                  </Box>
                ) : null}

                {hasMorePosts ? (
                  <Flex ref={loadMoreRef} align="center" justify="center" py="6">
                    {isLoadingMorePosts ? <Spinner size="sm" color="#FF6900" /> : null}
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

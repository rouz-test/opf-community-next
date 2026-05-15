'use client';

import { Box, Button, Flex, Grid, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AuthorProfileCard } from '@/app/user/components/community/AuthorProfileCard';
import { BoardPostRow } from '@/app/user/components/community/BoardPostRow';
import { CommunityProfileCard } from '@/app/user/components/community/CommunityProfileCard';
import { CommunityTagFilter } from '@/app/user/components/community/CommunityTagFilter';
import { CommunityToolbar } from '@/app/user/components/community/CommunityToolbar';
import { FeedPostCard } from '@/app/user/components/community/FeedPostCard';
import { useAuth } from '@/app/user/components/providers/AuthProvider';
import {
  COMMUNITY_CURRENT_USER,
  mockComments,
  mockCommunityPosts,
  type CommunityPost,
  type HighlightedComment,
  mapCommunityContentToPost,
} from '@/app/user/lib/community-content-data';
import { toaster } from '@/app/user/components/ui/toaster';
import type { CommunityContent } from '@/types/community-content';

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

const getProfileActorId = (authorLike?: { id?: string; profileId?: string }) =>
  authorLike?.profileId ?? authorLike?.id ?? '';

type AuthorCommentPreview = HighlightedComment;

type AuthorCommentEntry = {
  post: CommunityPost;
  comment: AuthorCommentPreview;
  activityDate?: string;
};

type MockComment = (typeof mockComments)[number];

function flattenComments(comments: readonly MockComment[]): MockComment[] {
  return comments.flatMap((comment) => [
    comment,
    ...(comment.replies ? flattenComments(comment.replies) : []),
  ]);
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Flex minH="100vh" bg="#F9FAFB" align="center" justify="center" px="16px">
      <Box
        maxW="720px"
        w="100%"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="#D1D5DB"
        borderRadius="20px"
        bg="#FFFFFF"
        px="24px"
        py="40px"
        textAlign="center"
      >
        <Text fontSize="16px" fontWeight="700" color="#111827">
          {title}
        </Text>
        <Text mt="8px" fontSize="14px" color="#6B7280">
          {description}
        </Text>
        <Button
          asChild
          mt="20px"
          h="42px"
          px="16px"
          borderRadius="12px"
          bg="#111827"
          color="#FFFFFF"
          fontSize="14px"
          fontWeight="600"
          _hover={{ bg: '#1F2937' }}
        >
          <Link href="/user/community">
            <Flex align="center" gap="8px">
              <ArrowLeft size={16} />
              <Text as="span">커뮤니티로 돌아가기</Text>
            </Flex>
          </Link>
        </Button>
      </Box>
    </Flex>
  );
}

export default function CommunityAuthorPage() {
  const params = useParams<{ id: string }>();
  const authorId = typeof params?.id === 'string' ? params.id : '';
  const { defaultCommunityIdentity, setDefaultCommunityIdentity } = useAuth();

  const [activityTab, setActivityTab] = useState<'posts' | 'comments'>('posts');
  const [viewMode, setViewMode] = useState<'feed' | 'board'>('feed');
  const [sortBy, setSortBy] = useState<'recommended' | 'latest'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [updatedPosts, setUpdatedPosts] = useState<CommunityPost[]>([]);

  const resolvedCommunityPosts = useMemo(
    () => mockCommunityPosts.map((post) => updatedPosts.find((updated) => updated.id === post.id) ?? post),
    [updatedPosts],
  );

  const authorPosts = useMemo(
    () => resolvedCommunityPosts.filter((post) => getProfileActorId(post.author) === authorId),
    [authorId, resolvedCommunityPosts],
  );

  const authorCommentEntries = useMemo<AuthorCommentEntry[]>(() => {
    const entries = new Map<string | number, AuthorCommentEntry>();
    const postMap = new Map(resolvedCommunityPosts.map((post) => [post.id, post]));

    flattenComments(mockComments).forEach((comment) => {
      if (getProfileActorId(comment.author) !== authorId) return;

      const post = postMap.get(comment.postId);
      if (!post) return;

      const latestComment: AuthorCommentPreview = {
        id: comment.id,
        author: {
          id: comment.author.id,
          accountId: comment.author.accountId,
          profileId: comment.author.profileId,
          mode: comment.author.mode,
          name: comment.author.name,
          nickname: comment.author.nickname,
          avatar: comment.author.avatar,
          isFollowing: comment.author.isFollowing ?? false,
        },
        content: comment.content,
        createdAt: comment.createdAt,
        likes: comment.likes,
        replyCount: comment.replies?.length ?? 0,
      };

      const entry: AuthorCommentEntry = {
        post: {
          ...post,
          highlightedComment: latestComment,
        },
        comment: latestComment,
        activityDate: latestComment.createdAt ?? post.createdAt,
      };

      const existingEntry = entries.get(post.id);
      if (!existingEntry) {
        entries.set(post.id, entry);
        return;
      }

      const existingTime = new Date(existingEntry.activityDate || 0).getTime();
      const nextTime = new Date(entry.activityDate || 0).getTime();

      if (nextTime > existingTime) {
        entries.set(post.id, entry);
      }
    });

    return Array.from(entries.values());
  }, [authorId, resolvedCommunityPosts]);

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
        title: error instanceof Error ? error.message : '좋아요를 처리하지 못했습니다.',
        type: 'error',
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
        title: error instanceof Error ? error.message : '저장을 처리하지 못했습니다.',
        type: 'error',
      });
    }
  };

  const author =
    authorPosts[0]?.author ??
    (authorCommentEntries[0]
      ? {
          id: authorCommentEntries[0].comment.author.id,
          accountId: authorCommentEntries[0].comment.author.accountId,
          profileId: authorCommentEntries[0].comment.author.profileId,
          mode: authorCommentEntries[0].comment.author.mode,
          name: authorCommentEntries[0].comment.author.name,
          nickname: authorCommentEntries[0].comment.author.nickname,
          avatar: authorCommentEntries[0].comment.author.avatar,
        }
      : undefined);

  const activeSourcePosts = useMemo(
    () => (activityTab === 'posts' ? authorPosts : authorCommentEntries.map((entry) => entry.post)),
    [activityTab, authorPosts, authorCommentEntries],
  );

  const commentEntryMap = useMemo(
    () => new Map(authorCommentEntries.map((entry) => [entry.post.id, entry])),
    [authorCommentEntries],
  );

  const allTags = useMemo(
    () => Array.from(new Set(activeSourcePosts.flatMap((post) => post.tags || []))),
    [activeSourcePosts],
  );

  const visiblePosts = useMemo(() => {
    let posts = [...activeSourcePosts];

    if (selectedTags.length > 0) {
      posts = posts.filter((post) =>
        selectedTags.every((tag) => (post.tags || []).includes(tag)),
      );
    }

    if (searchQuery.trim()) {
      const keyword = searchQuery.trim().toLowerCase();
      posts = posts.filter((post) => {
        const matchesPost =
          post.title.toLowerCase().includes(keyword) ||
          post.content.toLowerCase().includes(keyword) ||
          (post.tags || []).some((tag) => tag.toLowerCase().includes(keyword));

        if (matchesPost) return true;
        if (activityTab !== 'comments') return false;

        const entry = commentEntryMap.get(post.id);
        return entry?.comment.content.toLowerCase().includes(keyword) ?? false;
      });
    }

    if (sortBy === 'recommended') {
      posts.sort((a, b) => b.likes - a.likes);
    } else if (activityTab === 'comments') {
      posts.sort((a, b) => {
        const aTime = new Date(commentEntryMap.get(a.id)?.activityDate || 0).getTime();
        const bTime = new Date(commentEntryMap.get(b.id)?.activityDate || 0).getTime();
        return bTime - aTime;
      });
    } else {
      posts.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );
    }

    return posts;
  }, [activeSourcePosts, commentEntryMap, searchQuery, selectedTags, sortBy, activityTab]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const clearSelectedTags = () => {
    setSelectedTags([]);
  };

  const toggleProfileMode = () => {
    setDefaultCommunityIdentity(defaultCommunityIdentity === 'real' ? 'anonymous' : 'real');
  };

  const changeActivityTab = (nextTab: 'posts' | 'comments') => {
    setActivityTab(nextTab);
    setSelectedTags([]);
    setIsFilterOpen(false);
    setIsTagFilterOpen(false);
  };

  if (!author) {
    return (
      <EmptyState
        title="작성자 정보를 찾을 수 없습니다."
        description="존재하지 않거나 게시글이 없는 작성자입니다."
      />
    );
  }

  if (author.mode !== 'real') {
    return (
      <EmptyState
        title="익명 작성자의 프로필은 제공되지 않습니다."
        description="익명 게시글과 댓글은 작성자 정보와 팔로우 정보를 노출하지 않습니다."
      />
    );
  }

  return (
    <Box minH="100vh" bg="#F9FAFB">
      <Box maxW="1400px" mx="auto" px={{ base: '16px', md: '24px' }} py={{ base: '20px', md: '24px' }}>
        <Box display={{ base: 'block', lg: 'none' }}>
          <AuthorProfileCard author={author} displayMode="real" variant="mobile" />
        </Box>

        <Grid templateColumns={{ base: '1fr', xl: '280px minmax(0, 1fr) 320px' }} gap="24px" mt={{ base: '20px', lg: '24px' }}>
          <Box display={{ base: 'none', xl: 'block' }}>
            <Flex direction="column" gap="16px" position="sticky" top="16px">
              <CommunityProfileCard
                profileMode={defaultCommunityIdentity}
                onToggleProfileMode={toggleProfileMode}
                currentUser={COMMUNITY_CURRENT_USER}
              />

              <CommunityTagFilter
                allTags={allTags}
                selectedTags={selectedTags}
                onToggleTag={toggleTag}
                onClearTags={clearSelectedTags}
              />
            </Flex>
          </Box>

          <Flex direction="column" gap="20px" minW="0">
            <CommunityToolbar
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              searchPlaceholder={`${author.name}님의 ${activityTab === 'posts' ? '글' : '댓글'} 검색하기`}
              showFollowingOnly={false}
              onToggleFollowingOnly={() => {}}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isFilterOpen={isFilterOpen}
              onToggleFilterOpen={() => setIsFilterOpen((prev) => !prev)}
              onCloseFilterOpen={() => setIsFilterOpen(false)}
              isTagFilterOpen={isTagFilterOpen}
              onToggleTagFilterOpen={() => setIsTagFilterOpen((prev) => !prev)}
              allTags={allTags}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
              onClearTags={clearSelectedTags}
              showFollowingFilter={false}
            />

            <Box>
              <Flex
                display={{ base: 'inline-flex', sm: 'none' }}
                p="4px"
                borderRadius="12px"
                bg="#F3F4F6"
                gap="4px"
              >
                <Button
                  type="button"
                  h="34px"
                  px="16px"
                  borderRadius="10px"
                  bg={activityTab === 'posts' ? '#FFFFFF' : 'transparent'}
                  color={activityTab === 'posts' ? '#111827' : '#6B7280'}
                  fontSize="14px"
                  fontWeight="600"
                  boxShadow={activityTab === 'posts' ? 'sm' : 'none'}
                  _hover={{ bg: activityTab === 'posts' ? '#FFFFFF' : '#E5E7EB' }}
                  onClick={() => changeActivityTab('posts')}
                >
                  게시글
                </Button>
                <Button
                  type="button"
                  h="34px"
                  px="16px"
                  borderRadius="10px"
                  bg={activityTab === 'comments' ? '#FFFFFF' : 'transparent'}
                  color={activityTab === 'comments' ? '#111827' : '#6B7280'}
                  fontSize="14px"
                  fontWeight="600"
                  boxShadow={activityTab === 'comments' ? 'sm' : 'none'}
                  _hover={{ bg: activityTab === 'comments' ? '#FFFFFF' : '#E5E7EB' }}
                  onClick={() => changeActivityTab('comments')}
                >
                  댓글
                </Button>
              </Flex>

              <Flex
                display={{ base: 'none', sm: 'flex' }}
                align="center"
                gap="24px"
                borderBottom="1px solid"
                borderColor="#E5E7EB"
              >
                <Button
                  type="button"
                  variant="ghost"
                  h="auto"
                  w="72px"
                  px="0"
                  pb="12px"
                  borderWidth="0"
                  borderBottomWidth="2px"
                  borderBottomStyle="solid"
                  borderBottomColor={activityTab === 'posts' ? '#F97316' : 'transparent'}
                  borderRadius="0"
                  color={activityTab === 'posts' ? '#EA580C' : '#6B7280'}
                  fontSize="14px"
                  fontWeight="600"
                  _hover={{ bg: 'transparent', color: '#111827' }}
                  _focus={{ outline: 'none', boxShadow: 'none' }}
                  _focusVisible={{ outline: 'none', boxShadow: 'none' }}
                  onClick={() => changeActivityTab('posts')}
                >
                  게시글
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  h="auto"
                  w="72px"
                  px="0"
                  pb="12px"
                  borderWidth="0"
                  borderBottomWidth="2px"
                  borderBottomStyle="solid"
                  borderBottomColor={activityTab === 'comments' ? '#F97316' : 'transparent'}
                  borderRadius="0"
                  color={activityTab === 'comments' ? '#EA580C' : '#6B7280'}
                  fontSize="14px"
                  fontWeight="600"
                  _hover={{ bg: 'transparent', color: '#111827' }}
                  _focus={{ outline: 'none', boxShadow: 'none' }}
                  _focusVisible={{ outline: 'none', boxShadow: 'none' }}
                  onClick={() => changeActivityTab('comments')}
                >
                  댓글
                </Button>
              </Flex>
            </Box>

            <Flex direction="column" gap="16px">
              {visiblePosts.length === 0 ? (
                <Box
                  borderWidth="1px"
                  borderStyle="dashed"
                  borderColor="#D1D5DB"
                  borderRadius="18px"
                  bg="#FFFFFF"
                  px="24px"
                  py="40px"
                  textAlign="center"
                >
                  <Text fontSize="14px" color="#6B7280">
                    {activityTab === 'posts'
                      ? '작성한 게시글이 없거나 검색 결과가 없습니다.'
                      : '작성한 댓글이 없거나 검색 결과가 없습니다.'}
                  </Text>
                </Box>
              ) : viewMode === 'feed' ? (
                visiblePosts.map((post) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    formatDate={formatRelativeDate}
                    searchQuery={searchQuery}
                    onToggleLike={handleToggleLikePost}
                    onToggleSave={handleToggleSavePost}
                  />
                ))
              ) : (
                visiblePosts.map((post) => (
                  <BoardPostRow
                    key={post.id}
                    post={post}
                    formatDate={formatRelativeDate}
                    searchQuery={searchQuery}
                    onToggleLike={handleToggleLikePost}
                    onToggleSave={handleToggleSavePost}
                  />
                ))
              )}
            </Flex>
          </Flex>

          <Box display={{ base: 'none', lg: 'block' }}>
            <Box position="sticky" top="16px">
              <AuthorProfileCard author={author} displayMode="real" variant="sidebar" />
            </Box>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}

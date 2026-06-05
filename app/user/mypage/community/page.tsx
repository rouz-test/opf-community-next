'use client';

import { Box, Button, Flex, Grid, Image, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BoardPostRow } from '@/app/user/components/community/BoardPostRow';
import { FeedPostCard } from '@/app/user/components/community/FeedPostCard';
import { WritePostModal } from '@/app/user/components/community/WritePostModal';
import CheckBadgeIcon from '@/app/user/components/icons/CheckBadgeIcon';
import ActionConfirmModal from '@/app/user/components/modal/action-confirm-modal';
import { UserSearchField } from '@/app/user/components/ui/search-field';
import { toaster } from '@/app/user/components/ui/toaster';
import {
  COMMUNITY_CURRENT_USER,
  mockComments,
  type HighlightedComment,
  type CommunityPost,
  mapCommunityContentToPost,
} from '@/app/user/lib/community-content-data';
import type { CommunityContent, CommunityContentListResponse } from '@/types/community-content';

type FollowListItem = {
  accountId: string;
  name: string;
  avatar: string;
  company: string;
  position: string;
  isFollowing: boolean;
};

type FollowListResponse = {
  followerCount: number;
  followingCount: number;
  items: FollowListItem[];
};

type FollowToggleResponse = {
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  message?: string;
};

const DEFAULT_PROFILE_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';

function ProfileSummaryCard({
  title,
  subtitle,
  badge,
  avatar,
  followerCount,
  followingCount,
  onFollowerClick,
  onFollowingClick,
  onEditClick,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  avatar?: string;
  followerCount: number;
  followingCount: number;
  onFollowerClick?: () => void;
  onFollowingClick?: () => void;
  onEditClick?: () => void;
}) {
  const statButtonStyle = {
    h: '64px',
    p: '0',
    borderRadius: '12px',
    bg: 'transparent',
    color: '#111827',
    _hover: { bg: '#FFF8F1', color: '#F59E42' },
    _active: { bg: '#FFF4E8', color: '#F59E42' },
    _focus: { outline: 'none', boxShadow: 'none' },
    _focusVisible: { outline: 'none', boxShadow: '0 0 0 2px rgba(245, 158, 66, 0.18)' },
  };

  return (
    <Box
      borderRadius="20px"
      bg="#FFFFFF"
      px="20px"
      py="18px"
      boxShadow="0 12px 30px rgba(223, 223, 223, 0.9)"
    >
      <Text fontSize="14px" fontWeight="500" color="#6B7280" mb="14px">
        내 프로필
      </Text>

      <Box h="1px" bg="#E5E7EB" mb="20px" />

      <Flex align="center" gap="14px" mb="22px">
        <Box
          position="relative"
          boxSize="64px"
          flexShrink="0"
          overflow="hidden"
          rounded="full"
        >
          {avatar ? (
            <Image src={avatar} alt={title} w="100%" h="100%" objectFit="cover" />
          ) : (
            <Box w="100%" h="100%" bgGradient="linear(to-br, gray.200, gray.300)" />
          )}
        </Box>

        <Box minW="0" flex="1">
          <Flex align="center" gap="6px" mb="4px">
            <Text fontSize="18px" fontWeight="700" color="#111827" lineClamp="1">
              {title}
            </Text>
            {badge ? <CheckBadgeIcon size={16} color="#11B3E9" /> : null}
          </Flex>
          <Text fontSize="14px" fontWeight="500" color="#6B7280" lineClamp="1">
            코마소프트
          </Text>
          <Text mt="2px" fontSize="14px" color="#6B7280" lineClamp="1">
            {subtitle}
          </Text>
        </Box>
      </Flex>

      <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="16px" mb="20px">
        <Button
          type="button"
          variant="ghost"
          aria-label="팔로워 목록 보기"
          onClick={onFollowerClick}
          {...statButtonStyle}
        >
          <Box w="100%" textAlign="center">
            <Text fontSize="18px" fontWeight="700">
              {followerCount.toLocaleString('ko-KR')}
            </Text>
            <Flex mt="4px" align="center" justify="center" gap="4px">
              <Text fontSize="14px" color="currentColor" opacity="0.62">
                팔로워
              </Text>
              <Text fontSize="13px" color="currentColor" opacity="0.62">
                ›
              </Text>
            </Flex>
          </Box>
        </Button>
        <Button
          type="button"
          variant="ghost"
          aria-label="팔로잉 목록 보기"
          onClick={onFollowingClick}
          {...statButtonStyle}
        >
          <Box w="100%" textAlign="center">
            <Text fontSize="18px" fontWeight="700">
              {followingCount.toLocaleString('ko-KR')}
            </Text>
            <Flex mt="4px" align="center" justify="center" gap="4px">
              <Text fontSize="14px" color="currentColor" opacity="0.62">
                팔로잉
              </Text>
              <Text fontSize="13px" color="currentColor" opacity="0.62">
                ›
              </Text>
            </Flex>
          </Box>
        </Button>
      </Grid>

      <Button
        type="button"
        w="100%"
        h="42px"
        borderRadius="12px"
        bg="#3F3F46"
        color="#FFFFFF"
        fontSize="14px"
        fontWeight="700"
        _hover={{ bg: '#27272A' }}
        onClick={onEditClick}
      >
        프로필 수정
      </Button>
    </Box>
  );
}

export default function MyPageCommunityPage() {
  const router = useRouter();
  const [communityViewMode, setCommunityViewMode] = useState<'feed' | 'board'>('feed');
  const [activeCommunityTab, setActiveCommunityTab] = useState<'posts' | 'comments' | 'liked' | 'saved' | 'hidden'>('posts');
  const [profileFilter, setProfileFilter] = useState<'all' | 'real' | 'anonymous'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [followListModalType, setFollowListModalType] = useState<'followers' | 'following' | null>(null);
  const [followListItems, setFollowListItems] = useState<FollowListItem[]>([]);
  const [followCounts, setFollowCounts] = useState({ followerCount: 0, followingCount: 0 });
  const [followSearchQuery, setFollowSearchQuery] = useState('');
  const [isFollowListLoading, setIsFollowListLoading] = useState(false);
  const [followToggleTargetId, setFollowToggleTargetId] = useState<string | null>(null);
  const [allPublishedPosts, setAllPublishedPosts] = useState<CommunityPost[]>([]);
  const [mypagePosts, setMypagePosts] = useState<CommunityPost[]>([]);
  const [hiddenPosts, setHiddenPosts] = useState<CommunityPost[]>([]);
  const [editingContent, setEditingContent] = useState<CommunityContent | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [deleteTargetPost, setDeleteTargetPost] = useState<CommunityPost | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [hideTargetPost, setHideTargetPost] = useState<CommunityPost | null>(null);
  const [isHidingPost, setIsHidingPost] = useState(false);
  const [pendingRestorePost, setPendingRestorePost] = useState<CommunityPost | null>(null);
  const [isRestoringHiddenPost, setIsRestoringHiddenPost] = useState(false);

  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  useEffect(() => {
    if (!followListModalType) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFollowListModalType(null);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [followListModalType]);

  const refreshFollowList = useCallback(async (listType: 'followers' | 'following') => {
    setIsFollowListLoading(true);

    try {
      const params = new URLSearchParams({
        accountId: COMMUNITY_CURRENT_USER.accountId,
        viewerAccountId: COMMUNITY_CURRENT_USER.accountId,
        listType,
      });
      const response = await fetch(`/api/mock/community-follows?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = (await response.json().catch(() => null)) as FollowListResponse | null;

      if (!response.ok || !data) {
        throw new Error('팔로우 목록을 불러오지 못했습니다.');
      }

      setFollowCounts({
        followerCount: data.followerCount,
        followingCount: data.followingCount,
      });
      setFollowListItems(data.items);
    } catch (error) {
      toaster.create({
        title: error instanceof Error ? error.message : '팔로우 목록을 불러오지 못했습니다.',
        type: 'error',
      });
    } finally {
      setIsFollowListLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshFollowList('following');
  }, [refreshFollowList]);

  useEffect(() => {
    if (!followListModalType) return;

    setFollowSearchQuery('');
    void refreshFollowList(followListModalType);
  }, [followListModalType, refreshFollowList]);

  useEffect(() => {
    let isCancelled = false;

    const loadMyCommunityPosts = async () => {
      try {
        const [publishedResponse, archivedResponse] = await Promise.all([
          fetch(`/api/mock/community-contents?status=published&page=1&pageSize=200&accountId=${COMMUNITY_CURRENT_USER.accountId}`, {
            cache: 'no-store',
          }),
          fetch(`/api/mock/community-contents?includeHiddenByAuthor=true&hiddenByAuthorOnly=true&authorId=${COMMUNITY_CURRENT_USER.accountId}&accountId=${COMMUNITY_CURRENT_USER.accountId}&page=1&pageSize=200`, {
            cache: 'no-store',
          }),
        ]);

        const publishedData = (await publishedResponse.json().catch(() => null)) as CommunityContentListResponse | { message?: string } | null;
        const archivedData = (await archivedResponse.json().catch(() => null)) as CommunityContentListResponse | { message?: string } | null;

        if (!publishedResponse.ok || !publishedData || !('items' in publishedData)) {
          throw new Error('작성한 게시글을 불러오지 못했습니다.');
        }

        if (!archivedResponse.ok || !archivedData || !('items' in archivedData)) {
          throw new Error('숨김 게시글을 불러오지 못했습니다.');
        }

        if (isCancelled) return;

        const nextPublishedPosts = publishedData.items.map((content) =>
          mapCommunityContentToPost(content as CommunityContent),
        );

        setAllPublishedPosts(nextPublishedPosts);
        setMypagePosts(
          nextPublishedPosts.filter((post) => post.author.accountId === COMMUNITY_CURRENT_USER.accountId),
        );
        setHiddenPosts(archivedData.items.map((content) => mapCommunityContentToPost(content as CommunityContent)));
      } catch (error) {
        if (isCancelled) return;
        console.error('[MyPageCommunityPage] failed to load community posts:', error);
      }
    };

    void loadMyCommunityPosts();

    return () => {
      isCancelled = true;
    };
  }, []);

  const mypageCommentedPosts = useMemo<CommunityPost[]>(() => {
    const ownComments = mockComments
      .filter((comment) => comment.author.accountId === COMMUNITY_CURRENT_USER.accountId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latestCommentByPostId = new Map<string, (typeof ownComments)[number]>();

    ownComments.forEach((comment) => {
      if (!latestCommentByPostId.has(comment.postId)) {
        latestCommentByPostId.set(comment.postId, comment);
      }
    });

    return Array.from(latestCommentByPostId.entries()).reduce<CommunityPost[]>(
      (acc, [postId, comment]) => {
        const post = allPublishedPosts.find((item) => item.id === postId);
        if (!post) return acc;

        const highlightedComment: HighlightedComment = {
          id: comment.id,
          author: comment.author,
          content: comment.content,
          createdAt: comment.createdAt,
          likes: comment.likes ?? 0,
          replyCount: comment.replies?.length ?? 0,
        };

        acc.push({
          ...post,
          highlightedComment,
        });

        return acc;
      },
      [],
    );
  }, [allPublishedPosts]);

  const baseCommunityPosts =
    activeCommunityTab === 'posts'
      ? mypagePosts
      : activeCommunityTab === 'liked'
        ? allPublishedPosts.filter((post) => post.isLikedByMe)
      : activeCommunityTab === 'saved'
        ? allPublishedPosts.filter((post) => post.isSavedByMe)
      : activeCommunityTab === 'hidden'
        ? hiddenPosts
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
    if (Number.isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const realProfile = COMMUNITY_CURRENT_USER;

  const filteredFollowListItems = useMemo(() => {
    const keyword = followSearchQuery.trim().toLowerCase();
    if (!keyword) return followListItems;

    return followListItems.filter((item) =>
      [item.name, item.company, item.position].join(' ').toLowerCase().includes(keyword),
    );
  }, [followListItems, followSearchQuery]);

  const handleToggleFollowInModal = async (profile: FollowListItem) => {
    setFollowToggleTargetId(profile.accountId);

    try {
      const method = profile.isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(
        method === 'DELETE'
          ? `/api/mock/community-follows?${new URLSearchParams({
              followerAccountId: COMMUNITY_CURRENT_USER.accountId,
              followingAccountId: profile.accountId,
            }).toString()}`
          : '/api/mock/community-follows',
        {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          ...(method === 'POST'
            ? {
                body: JSON.stringify({
                  followerAccountId: COMMUNITY_CURRENT_USER.accountId,
                  followingAccountId: profile.accountId,
                }),
              }
            : {}),
        },
      );
      const data = (await response.json().catch(() => null)) as FollowToggleResponse | null;

      if (!response.ok) {
        throw new Error(data?.message || '팔로우 상태를 변경하지 못했습니다.');
      }

      const nextIsFollowing = Boolean(data?.isFollowing);

      setFollowCounts((prev) => ({
        followerCount: prev.followerCount,
        followingCount: Math.max(
          0,
          prev.followingCount + (nextIsFollowing === profile.isFollowing ? 0 : nextIsFollowing ? 1 : -1),
        ),
      }));
      setFollowListItems((prev) =>
        prev.map((item) =>
          item.accountId === profile.accountId
            ? {
                ...item,
                isFollowing: nextIsFollowing,
              }
            : item,
        ),
      );
    } catch (error) {
      toaster.create({
        title: error instanceof Error ? error.message : '팔로우 상태를 변경하지 못했습니다.',
        type: 'error',
      });
    } finally {
      setFollowToggleTargetId(null);
    }
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

      setAllPublishedPosts((prev) => prev.map((item) => (item.id === nextPost.id ? nextPost : item)));
      setMypagePosts((prev) => prev.map((item) => (item.id === nextPost.id ? nextPost : item)));
      setHiddenPosts((prev) => prev.map((item) => (item.id === nextPost.id ? nextPost : item)));
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

      setAllPublishedPosts((prev) => prev.map((item) => (item.id === nextPost.id ? nextPost : item)));
      setMypagePosts((prev) => prev.map((item) => (item.id === nextPost.id ? nextPost : item)));
      setHiddenPosts((prev) => prev.map((item) => (item.id === nextPost.id ? nextPost : item)));
    } catch (error) {
      toaster.create({
        title: error instanceof Error ? error.message : '저장을 처리하지 못했습니다.',
        type: 'error',
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
        title: error instanceof Error ? error.message : '게시글 정보를 불러오지 못했습니다.',
        type: 'error',
      });
    }
  };

  const handleUpdatedContent = (updatedContent: CommunityContent) => {
    const nextPost = mapCommunityContentToPost(updatedContent);

    setAllPublishedPosts((prev) => prev.map((post) => (post.id === nextPost.id ? nextPost : post)));
    setMypagePosts((prev) => prev.map((post) => (post.id === nextPost.id ? nextPost : post)));
    setHiddenPosts((prev) => prev.map((post) => (post.id === nextPost.id ? nextPost : post)));
    setEditingContent(null);
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

      setAllPublishedPosts((prev) => prev.filter((post) => post.id !== deleteTargetPost.id));
      setMypagePosts((prev) => prev.filter((post) => post.id !== deleteTargetPost.id));
      setHiddenPosts((prev) => prev.filter((post) => post.id !== deleteTargetPost.id));
      setDeleteTargetPost(null);
      toaster.create({
        title: '게시글이 삭제되었습니다.',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: error instanceof Error ? error.message : '게시글을 삭제하지 못했습니다.',
        type: 'error',
      });
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleRequestHidePost = (post: CommunityPost) => {
    setHideTargetPost(post);
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

      const payload = (await response.json().catch(() => null)) as CommunityContent | { message?: string } | null;

      if (!response.ok || !payload || !('id' in payload)) {
        throw new Error((payload as { message?: string } | null)?.message || '게시글을 숨기지 못했습니다.');
      }

      const hiddenPost = mapCommunityContentToPost(payload as CommunityContent);

      setAllPublishedPosts((prev) => prev.filter((post) => post.id !== hiddenPost.id));
      setMypagePosts((prev) => prev.filter((post) => post.id !== hiddenPost.id));
      setHiddenPosts((prev) => [hiddenPost, ...prev.filter((post) => post.id !== hiddenPost.id)]);
      setHideTargetPost(null);
      toaster.create({
        title: '게시글이 숨김 처리되었습니다.',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: error instanceof Error ? error.message : '게시글을 숨기지 못했습니다.',
        type: 'error',
      });
    } finally {
      setIsHidingPost(false);
    }
  };

  const handleRequestRestoreHiddenPost = (post: CommunityPost) => {
    setPendingRestorePost(post);
  };

  const handleConfirmRestoreHiddenPost = async () => {
    if (!pendingRestorePost || isRestoringHiddenPost) return;

    try {
      setIsRestoringHiddenPost(true);

      const response = await fetch(`/api/mock/community-contents/${pendingRestorePost.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flags: {
            isHiddenByAuthor: false,
          },
        }),
      });

      const payload = (await response.json().catch(() => null)) as CommunityContent | { message?: string } | null;

      if (!response.ok || !payload || !('id' in payload)) {
        throw new Error('숨김 해제에 실패했습니다.');
      }

      const restoredPost = mapCommunityContentToPost(payload as CommunityContent);

      setHiddenPosts((prev) => prev.filter((post) => post.id !== restoredPost.id));
      setAllPublishedPosts((prev) => {
        const next = [restoredPost, ...prev.filter((post) => post.id !== restoredPost.id)];
        return next;
      });
      if (restoredPost.author.accountId === COMMUNITY_CURRENT_USER.accountId) {
        setMypagePosts((prev) => [restoredPost, ...prev.filter((post) => post.id !== restoredPost.id)]);
      }

      toaster.create({
        title: '게시글 숨김이 해제되었습니다.',
        type: 'success',
      });
      setPendingRestorePost(null);
    } catch (error) {
      console.error('[MyPageCommunityPage] failed to restore hidden post:', error);
      toaster.create({
        title: '숨김 해제에 실패했습니다.',
        type: 'error',
      });
    } finally {
      setIsRestoringHiddenPost(false);
    }
  };

  return (
    <Box mx="auto" w="100%" maxW="1120px">
      <Grid templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 320px' }} gap="24px" alignItems="start">
        <Flex direction="column" minW="0">
          <Text fontSize="20px" fontWeight="700" color="#111827">
            커뮤니티
          </Text>

          <Box display={{ base: 'block', xl: 'none' }} mt="16px" mb="24px">
            <ProfileSummaryCard
              title={realProfile.name}
              subtitle={realProfile.position ?? '직무'}
              badge="✓"
              avatar={realProfile.avatar}
              followerCount={followCounts.followerCount}
              followingCount={followCounts.followingCount}
              onFollowerClick={() => setFollowListModalType('followers')}
              onFollowingClick={() => setFollowListModalType('following')}
              onEditClick={() => router.push('/user/mypage/settings/profile')}
            />
          </Box>

          <Box mt="16px" borderBottom="1px solid" borderColor="#E5E7EB">
            <Flex align="center" gap="4px" wrap="wrap">
              {['게시글', '댓글', '좋아요', '저장', '숨김'].map((tab, index) => {
                const isPostsTab = index === 0;
                const isCommentsTab = index === 1;
                const isLikedTab = index === 2;
                const isSavedTab = index === 3;
                const isHiddenTab = index === 4;
                const isClickable = isPostsTab || isCommentsTab || isLikedTab || isSavedTab || isHiddenTab;
                const isActive =
                  (isPostsTab && activeCommunityTab === 'posts') ||
                  (isCommentsTab && activeCommunityTab === 'comments') ||
                  (isLikedTab && activeCommunityTab === 'liked') ||
                  (isSavedTab && activeCommunityTab === 'saved') ||
                  (isHiddenTab && activeCommunityTab === 'hidden');

                return (
                  <Button
                    key={tab}
                    type="button"
                    variant="ghost"
                    h="48px"
                    px="16px"
                    borderRadius="0"
                    position="relative"
                    color={isActive ? '#111827' : isClickable ? '#6B7280' : '#D1D5DB'}
                    fontSize="14px"
                    fontWeight="600"
                    cursor={isClickable ? 'pointer' : 'default'}
                    _hover={isClickable ? { bg: 'transparent', color: '#111827' } : { bg: 'transparent' }}
                    onClick={
                      isPostsTab
                        ? () => setActiveCommunityTab('posts')
                        : isCommentsTab
                          ? () => setActiveCommunityTab('comments')
                          : isLikedTab
                            ? () => setActiveCommunityTab('liked')
                            : isSavedTab
                              ? () => setActiveCommunityTab('saved')
                              : isHiddenTab
                                ? () => setActiveCommunityTab('hidden')
                                : undefined
                    }
                  >
                    {tab}
                    {isActive ? (
                      <Box position="absolute" bottom="0" insetX="0" h="2px" bg="#F97316" />
                    ) : null}
                  </Button>
                );
              })}
            </Flex>
          </Box>

          <Flex mt="16px" wrap="wrap" align="center" gap="12px">
        <Box ref={filterRef} position="relative">
          <Button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            h="40px"
            px="16px"
            borderRadius="14px"
            borderWidth="1px"
            borderColor="#E5E7EB"
            bg="#FFFFFF"
            color="#4B5563"
            fontSize="14px"
            fontWeight="600"
            _hover={{ borderColor: '#D1D5DB', bg: '#F9FAFB' }}
          >
            <Flex align="center" gap="8px">
              <Text as="span">
                {profileFilter === 'all'
                  ? '전체 보기'
                  : profileFilter === 'real'
                    ? '실명만'
                    : '익명만'}
              </Text>
              <ChevronDown size={16} />
            </Flex>
          </Button>

          {isFilterOpen ? (
            <Box
              position="absolute"
              left="0"
              mt="8px"
              zIndex="20"
              w="180px"
              overflow="hidden"
              borderWidth="1px"
              borderColor="#E5E7EB"
              borderRadius="14px"
              bg="#FFFFFF"
              py="6px"
              boxShadow="0 16px 32px rgba(15, 23, 42, 0.12)"
            >
              {[
                { label: '전체 보기', value: 'all' },
                { label: '실명만 보기', value: 'real' },
                { label: '익명만 보기', value: 'anonymous' },
              ].map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  unstyled
                  display="flex"
                  w="100%"
                  alignItems="center"
                  justifyContent="space-between"
                  px="12px"
                  py="10px"
                  fontSize="14px"
                  color="#374151"
                  _hover={{ bg: '#F9FAFB' }}
                  onClick={() => {
                    setProfileFilter(option.value as 'all' | 'real' | 'anonymous');
                    setIsFilterOpen(false);
                  }}
                >
                  <Text as="span">{option.label}</Text>
                  {profileFilter === option.value ? (
                    <Check size={16} color="#F97316" />
                  ) : null}
                </Button>
              ))}
            </Box>
          ) : null}
        </Box>

        <Flex overflow="hidden" borderWidth="1px" borderColor="#E5E7EB" borderRadius="14px" bg="#FFFFFF">
          <Button
            type="button"
            onClick={() => setCommunityViewMode('feed')}
            h="40px"
            px="16px"
            borderRadius="0"
            borderRight="1px solid"
            borderColor="#E5E7EB"
            bg={communityViewMode === 'feed' ? '#FFF7ED' : '#FFFFFF'}
            color={communityViewMode === 'feed' ? '#C2410C' : '#4B5563'}
            fontSize="14px"
            fontWeight="600"
            _hover={{ bg: communityViewMode === 'feed' ? '#FFF7ED' : '#F9FAFB' }}
          >
            <Flex align="center" gap="8px">
              <LayoutGrid size={16} />
              <Text as="span">피드뷰</Text>
            </Flex>
          </Button>
          <Button
            type="button"
            onClick={() => setCommunityViewMode('board')}
            h="40px"
            px="16px"
            borderRadius="0"
            bg={communityViewMode === 'board' ? '#FFF7ED' : '#FFFFFF'}
            color={communityViewMode === 'board' ? '#C2410C' : '#4B5563'}
            fontSize="14px"
            fontWeight="600"
            _hover={{ bg: communityViewMode === 'board' ? '#FFF7ED' : '#F9FAFB' }}
          >
            <Flex align="center" gap="8px">
              <List size={16} />
              <Text as="span">게시판뷰</Text>
            </Flex>
          </Button>
        </Flex>
          </Flex>

          <Flex mt="16px" direction="column" gap="16px">
            {activeCommunityPosts.length === 0 ? (
              <Box
                borderWidth="1px"
                borderStyle="dashed"
                borderColor="#D1D5DB"
                borderRadius="20px"
                bg="#FFFFFF"
                px="24px"
                py="48px"
                textAlign="center"
              >
                <Text fontSize="14px" color="#6B7280">
                  {activeCommunityTab === 'posts'
                    ? '작성한 게시글이 아직 없습니다.'
                    : activeCommunityTab === 'liked'
                      ? '좋아요를 누른 게시글이 아직 없습니다.'
                      : activeCommunityTab === 'saved'
                        ? '저장한 게시글이 아직 없습니다.'
                        : activeCommunityTab === 'hidden'
                          ? '숨김 처리한 게시글이 아직 없습니다.'
                          : '댓글을 남긴 게시글이 아직 없습니다. 댓글을 남기면 해당 게시글과 내 댓글이 함께 표시됩니다.'}
                </Text>
              </Box>
            ) : communityViewMode === 'feed' ? (
              activeCommunityPosts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  formatDate={formatDate}
                  searchQuery=""
                  enableOwnPostMenu
                  hideActionLabel={activeCommunityTab === 'hidden' ? '숨김 해제' : '숨김'}
                  onRequestHide={activeCommunityTab === 'hidden' ? handleRequestRestoreHiddenPost : handleRequestHidePost}
                  onRequestDelete={activeCommunityTab === 'hidden' ? undefined : handleRequestDeletePost}
                  onRequestEdit={activeCommunityTab === 'hidden' ? undefined : handleRequestEditPost}
                  onToggleLike={handleToggleLikePost}
                  onToggleSave={handleToggleSavePost}
                  ownPostMenuActions={activeCommunityTab === 'hidden' ? ['hide'] : ['edit', 'delete', 'hide']}
                />
              ))
            ) : (
              activeCommunityPosts.map((post) => (
                <BoardPostRow
                  key={post.id}
                  post={post}
                  formatDate={formatDate}
                  searchQuery=""
                  enableOwnPostMenu
                  hideActionLabel={activeCommunityTab === 'hidden' ? '숨김 해제' : '숨김'}
                  onRequestHide={activeCommunityTab === 'hidden' ? handleRequestRestoreHiddenPost : handleRequestHidePost}
                  onRequestDelete={activeCommunityTab === 'hidden' ? undefined : handleRequestDeletePost}
                  onRequestEdit={activeCommunityTab === 'hidden' ? undefined : handleRequestEditPost}
                  onToggleLike={handleToggleLikePost}
                  onToggleSave={handleToggleSavePost}
                  ownPostMenuActions={activeCommunityTab === 'hidden' ? ['hide'] : ['edit', 'delete', 'hide']}
                />
              ))
            )}
          </Flex>
        </Flex>

        <Box display={{ base: 'none', xl: 'block' }}>
          <Box position="sticky" top="16px">
            <ProfileSummaryCard
              title={realProfile.name}
              subtitle={realProfile.position ?? '직무'}
              badge="✓"
              avatar={realProfile.avatar}
              followerCount={followCounts.followerCount}
              followingCount={followCounts.followingCount}
              onFollowerClick={() => setFollowListModalType('followers')}
              onFollowingClick={() => setFollowListModalType('following')}
              onEditClick={() => router.push('/user/mypage/settings/profile')}
            />
          </Box>
        </Box>
      </Grid>

      <WritePostModal
        isOpen={isWriteModalOpen}
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingContent(null);
        }}
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
        onConfirm={() => {
          void handleConfirmDeletePost();
        }}
      />

      <ActionConfirmModal
        isOpen={Boolean(hideTargetPost)}
        title="게시글을 숨기시겠습니까?"
        description="숨김 처리된 게시글은 커뮤니티 메인에서 보이지 않고, 마이페이지의 숨김 탭에서 확인할 수 있습니다."
        confirmLabel="숨김"
        isLoading={isHidingPost}
        onCancel={() => setHideTargetPost(null)}
        onConfirm={() => {
          void handleConfirmHidePost();
        }}
      />

      <ActionConfirmModal
        isOpen={Boolean(pendingRestorePost)}
        title="게시글 숨김을 해제할까요?"
        description="숨김 해제한 게시글은 다시 커뮤니티 화면에 노출됩니다."
        confirmLabel="숨김 해제"
        isLoading={isRestoringHiddenPost}
        onCancel={() => {
          if (isRestoringHiddenPost) return;
          setPendingRestorePost(null);
        }}
        onConfirm={() => {
          void handleConfirmRestoreHiddenPost();
        }}
      />

      {followListModalType ? (
        <Flex
          position="fixed"
          inset="0"
          zIndex="50"
          align="center"
          justify="center"
          bg="rgba(0, 0, 0, 0.5)"
          px="16px"
          onClick={() => setFollowListModalType(null)}
        >
          <Box
            position="relative"
            zIndex="1"
            maxH="80vh"
            w="100%"
            maxW="500px"
            overflow="hidden"
            borderRadius="18px"
            bg="#FFFFFF"
            px={{ base: '20px', sm: '30px' }}
            py={{ base: '24px', sm: '32px' }}
            boxShadow="0 28px 70px rgba(0, 0, 0, 0.28)"
            onClick={(event) => event.stopPropagation()}
          >
            <Flex align="center" justify="space-between" gap="16px">
              <Text fontSize="18px" fontWeight="800" color="#3F3F46" letterSpacing="-0.02em">
                팔로워, 팔로잉 목록
              </Text>
              <Button
                type="button"
                aria-label="팔로워, 팔로잉 목록 닫기"
                variant="ghost"
                minW="auto"
                h="32px"
                w="32px"
                p="0"
                color="#9CA3AF"
                _hover={{ bg: '#F3F4F6', color: '#4B5563' }}
                _focus={{ outline: 'none', boxShadow: 'none' }}
                onClick={() => setFollowListModalType(null)}
              >
                <X size={20} />
              </Button>
            </Flex>

            <Box mt="18px">
              <UserSearchField
                h="42px"
                boxShadow="0 12px 30px rgba(223, 223, 223, 0.45)"
                fontSize="13px"
                placeholder="계정을 검색해보세요."
                value={followSearchQuery}
                iconColor="#9CA3AF"
                _placeholder={{ color: '#9CA3AF' }}
                _focus={{
                  outline: 'none',
                  borderColor: 'orange.500',
                  boxShadow: '0 0 0 2px rgba(249, 115, 22, 0.35), 0 12px 28px rgba(255, 105, 0, 0.24)',
                }}
                _focusVisible={{
                  outline: 'none',
                  borderColor: 'orange.500',
                  boxShadow: '0 0 0 2px rgba(249, 115, 22, 0.35), 0 12px 28px rgba(255, 105, 0, 0.24)',
                }}
                onValueChange={setFollowSearchQuery}
              />
            </Box>

            <Grid
              mt="24px"
              templateColumns="repeat(2, minmax(0, 1fr))"
              borderBottom="1px solid"
              borderColor="#E5E7EB"
            >
              {[
                { type: 'followers' as const, label: '팔로워', count: followCounts.followerCount },
                { type: 'following' as const, label: '팔로잉', count: followCounts.followingCount },
              ].map((tab) => {
                const isActive = followListModalType === tab.type;

                return (
                  <Button
                    key={tab.type}
                    type="button"
                    variant="ghost"
                    h="44px"
                    borderRadius="0"
                    borderWidth="0"
                    borderBottomWidth="2px"
                    borderBottomStyle="solid"
                    borderBottomColor={isActive ? '#FF5A00' : 'transparent'}
                    bg="transparent"
                    color={isActive ? '#3F3F46' : '#6B7280'}
                    fontSize="14px"
                    fontWeight="800"
                    _hover={{ bg: 'transparent', color: '#FF5A00' }}
                    _focus={{ outline: 'none', boxShadow: 'none' }}
                    _focusVisible={{ outline: 'none', boxShadow: 'none' }}
                    onClick={() => setFollowListModalType(tab.type)}
                  >
                    {tab.label}
                    <Text as="span" ml="12px" color="currentColor">
                      {tab.count}
                    </Text>
                  </Button>
                );
              })}
            </Grid>

            <Flex mt="16px" maxH="380px" overflowY="auto" direction="column" gap="10px" pr="2px">
              {isFollowListLoading ? (
                <Flex minH="120px" align="center" justify="center" color="#9CA3AF">
                  <Text fontSize="13px">목록을 불러오는 중입니다.</Text>
                </Flex>
              ) : filteredFollowListItems.length === 0 ? (
                <Flex minH="120px" align="center" justify="center" color="#9CA3AF">
                  <Text fontSize="13px">
                    {followSearchQuery.trim() ? '검색 결과가 없습니다.' : '목록이 없습니다.'}
                  </Text>
                </Flex>
              ) : (
                filteredFollowListItems.map((profile) => (
                  <Flex
                    key={profile.accountId}
                    align="center"
                    justify="space-between"
                    gap="12px"
                    borderWidth="1px"
                    borderColor="#E5E7EB"
                    borderRadius="18px"
                    bg="#FFFFFF"
                    px="14px"
                    py="12px"
                    boxShadow="0 8px 20px rgba(223, 223, 223, 0.32)"
                  >
                    <Flex minW="0" align="center" gap="12px">
                      <Box position="relative" boxSize="26px" overflow="hidden" rounded="full" flexShrink="0">
                        <Image
                          src={profile.avatar || DEFAULT_PROFILE_AVATAR}
                          alt={profile.name}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                        />
                      </Box>
                      <Box minW="0">
                        <Flex align="center" gap="4px">
                          <Text fontSize="13px" fontWeight="800" color="#111827" lineClamp="1">
                            {profile.name}
                          </Text>
                          <CheckBadgeIcon size={14} color="#11B3E9" />
                        </Flex>
                        <Text mt="2px" fontSize="11px" color="#9CA3AF" lineClamp="1">
                          {profile.company} · {profile.position}
                        </Text>
                      </Box>
                    </Flex>

                    <Button
                      type="button"
                      h="38px"
                      minW="68px"
                      px="14px"
                      borderRadius="12px"
                      bg={profile.isFollowing ? '#F8F8F8' : '#333333'}
                      color={profile.isFollowing ? '#4B5563' : '#FFFFFF'}
                      fontSize="13px"
                      fontWeight="800"
                      loading={followToggleTargetId === profile.accountId}
                      _hover={{
                        bg: profile.isFollowing ? '#EFEFEF' : '#222222',
                      }}
                      onClick={() => handleToggleFollowInModal(profile)}
                    >
                      {profile.isFollowing ? '팔로잉' : '팔로우'}
                    </Button>
                  </Flex>
                ))
              )}
            </Flex>
          </Box>
        </Flex>
      ) : null}
    </Box>
  );
}

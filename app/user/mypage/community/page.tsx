'use client';

import { Box, Button, Flex, Grid, Image, Input, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  Search,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { BoardPostRow } from '@/app/user/components/community/BoardPostRow';
import { FeedPostCard } from '@/app/user/components/community/FeedPostCard';
import {
  COMMUNITY_CURRENT_USER,
  mockComments,
  type HighlightedComment,
  type CommunityPost,
  mapCommunityContentToPost,
} from '@/app/user/lib/community-content-data';
import type { CommunityContent, CommunityContentListResponse } from '@/types/community-content';

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
    <Box
      borderWidth="1px"
      borderColor="#E5E7EB"
      borderRadius="20px"
      bg="#FFFFFF"
      px={{ base: '14px', sm: '16px' }}
      py={{ base: '14px', sm: '16px' }}
      boxShadow="0 8px 24px rgba(15, 23, 42, 0.04)"
    >
      <Flex align="center" justify="space-between" gap="12px">
        <Flex minW="0" align="center" gap={{ base: '12px', sm: '16px' }}>
          <Box
            position="relative"
            boxSize={{ base: '40px', sm: '48px' }}
            overflow="hidden"
            rounded="full"
            borderWidth="1px"
            borderColor="#E5E7EB"
          >
            {avatar ? (
              <Image src={avatar} alt={title} w="100%" h="100%" objectFit="cover" />
            ) : (
              <Box w="100%" h="100%" bgGradient="linear(to-br, gray.200, gray.300)" />
            )}
          </Box>
          <Box minW="0">
            <Flex align="center" gap="6px">
              <Text fontSize={{ base: '15px', sm: '16px' }} fontWeight="700" color="#111827" lineClamp="1">
                {title}
              </Text>
              {badge ? <BadgeCheck size={16} color="#3B82F6" /> : null}
            </Flex>
            <Text mt="2px" fontSize={{ base: '11px', sm: '12px' }} color="#6B7280" lineClamp="1">
              {subtitle}
            </Text>
          </Box>
        </Flex>

        <Button
          type="button"
          onClick={onEditClick}
          h={{ base: '32px', sm: '36px' }}
          px="14px"
          borderRadius="10px"
          borderWidth="1px"
          borderColor="#E5E7EB"
          bg="#FFFFFF"
          color="#6B7280"
          fontSize={{ base: '12px', sm: '14px' }}
          fontWeight="600"
          _hover={{ bg: '#F9FAFB', color: '#374151', borderColor: '#D1D5DB' }}
        >
          수정하기
        </Button>
      </Flex>

      <Grid mt="14px" templateColumns="repeat(2, minmax(0, 1fr))" gap="8px" borderRadius="16px" bg="#F9FAFB" px="12px" py="12px" textAlign="center">
        <Box>
          <Text fontSize={{ base: '20px', sm: '22px' }} fontWeight="700" color="#111827">
            892
          </Text>
          <Text mt="4px" fontSize="11px" letterSpacing="0.14em" textTransform="uppercase" color="#9CA3AF">
            팔로워
          </Text>
        </Box>
        <Button
          type="button"
          variant="ghost"
          h="auto"
          p="0"
          borderRadius="12px"
          _hover={{ bg: '#F3F4F6' }}
          onClick={onFollowingClick}
        >
          <Box w="100%">
            <Text fontSize={{ base: '20px', sm: '22px' }} fontWeight="700" color="#111827">
              124
            </Text>
            <Text mt="4px" fontSize="11px" letterSpacing="0.14em" textTransform="uppercase" color="#9CA3AF">
              팔로잉
            </Text>
          </Box>
        </Button>
      </Grid>
    </Box>
  );
}

export default function MyPageCommunityPage() {
  const router = useRouter();
  const [communityViewMode, setCommunityViewMode] = useState<'feed' | 'board'>('feed');
  const [activeCommunityTab, setActiveCommunityTab] = useState<'posts' | 'comments' | 'hidden'>('posts');
  const [profileFilter, setProfileFilter] = useState<'all' | 'real' | 'anonymous'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [allPublishedPosts, setAllPublishedPosts] = useState<CommunityPost[]>([]);
  const [mypagePosts, setMypagePosts] = useState<CommunityPost[]>([]);
  const [hiddenPosts, setHiddenPosts] = useState<CommunityPost[]>([]);

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

  useEffect(() => {
    let isCancelled = false;

    const loadMyCommunityPosts = async () => {
      try {
        const [publishedResponse, archivedResponse] = await Promise.all([
          fetch('/api/mock/community-contents?status=published&page=1&pageSize=200', {
            cache: 'no-store',
          }),
          fetch(`/api/mock/community-contents?includeHiddenByAuthor=true&hiddenByAuthorOnly=true&authorId=${COMMUNITY_CURRENT_USER.accountId}&page=1&pageSize=200`, {
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
  const followerCount = 892;
  const followingCount = 124;

  const followingProfiles = useMemo(() => {
    const seen = new Set<string>();
    const sourcePosts = Array.isArray(allPublishedPosts) ? allPublishedPosts : [];

    return sourcePosts
      .map((post) => post.author)
      .filter((author) => {
        if (author.accountId === COMMUNITY_CURRENT_USER.accountId) return false;
        if (author.mode !== 'real') return false;
        if (seen.has(author.accountId || author.id)) return false;

        seen.add(author.accountId || author.id);
        return true;
      })
      .slice(0, 5);
  }, [allPublishedPosts]);

  return (
    <Box mx="auto" w="100%" maxW="1120px">
      <Text fontSize={{ base: '26px', md: '30px' }} fontWeight="700" color="#111827">
        커뮤니티
      </Text>

      <Grid mt="16px" gap="16px" alignItems="start" templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 220px' }}>
        <Box>
          <Text mb="8px" fontSize="14px" fontWeight="600" color="#6B7280">
            내 프로필
          </Text>
          <ProfileSummaryCard
            title={realProfile.name}
            subtitle={realProfile.position ?? '직무'}
            badge="✓"
            avatar={realProfile.avatar}
            onFollowingClick={() => setIsFollowingModalOpen(true)}
            onEditClick={() => router.push('/user/mypage/settings/profile')}
          />
        </Box>

        <Box>
          <Text mb="8px" fontSize="14px" fontWeight="600" color="#6B7280">
            팔로우 현황
          </Text>
          <Box
            borderWidth="1px"
            borderColor="#E5E7EB"
            borderRadius="20px"
            bg="#FFFFFF"
            px={{ base: '14px', sm: '16px' }}
            py={{ base: '14px', sm: '16px' }}
            boxShadow="0 8px 24px rgba(15, 23, 42, 0.04)"
          >
            <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={{ base: '8px', sm: '16px' }} textAlign="center">
              <Box>
                <Text fontSize={{ base: '20px', sm: '22px' }} fontWeight="700" color="#111827">
                  {followerCount}
                </Text>
                <Text mt="4px" fontSize="11px" letterSpacing="0.14em" textTransform="uppercase" color="#9CA3AF">
                  팔로워
                </Text>
              </Box>
              <Box>
                <Text fontSize={{ base: '20px', sm: '22px' }} fontWeight="700" color="#111827">
                  {followingCount}
                </Text>
                <Text mt="4px" fontSize="11px" letterSpacing="0.14em" textTransform="uppercase" color="#9CA3AF">
                  팔로잉
                </Text>
              </Box>
            </Grid>
          </Box>
        </Box>
      </Grid>

      <Box mt="40px" borderBottom="1px solid" borderColor="#E5E7EB">
        <Flex align="center" gap="4px" wrap="wrap">
          {['게시글', '댓글', '좋아요', '저장', '숨김'].map((tab, index) => {
            const isPostsTab = index === 0;
            const isCommentsTab = index === 1;
            const isHiddenTab = index === 4;
            const isClickable = isPostsTab || isCommentsTab || isHiddenTab;
            const isActive =
              (isPostsTab && activeCommunityTab === 'posts') ||
              (isCommentsTab && activeCommunityTab === 'comments') ||
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
                color={
                  isActive ? '#111827' : isClickable ? '#6B7280' : '#D1D5DB'
                }
                fontSize="14px"
                fontWeight="600"
                cursor={isClickable ? 'pointer' : 'default'}
                _hover={isClickable ? { bg: 'transparent', color: '#111827' } : { bg: 'transparent' }}
                onClick={
                  isPostsTab
                    ? () => setActiveCommunityTab('posts')
                    : isCommentsTab
                      ? () => setActiveCommunityTab('comments')
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
              enableOwnPostMenu={activeCommunityTab !== 'hidden'}
            />
          ))
        ) : (
          activeCommunityPosts.map((post) => (
            <BoardPostRow
              key={post.id}
              post={post}
              formatDate={formatDate}
              searchQuery=""
              enableOwnPostMenu={activeCommunityTab !== 'hidden'}
            />
          ))
        )}
      </Flex>

      {isFollowingModalOpen ? (
        <Flex position="fixed" inset="0" zIndex="50" align="center" justify="center" bg="rgba(0, 0, 0, 0.5)" px="16px">
          <Button
            type="button"
            aria-label="팔로잉 목록 닫기"
            position="absolute"
            inset="0"
            variant="ghost"
            onClick={() => setIsFollowingModalOpen(false)}
          />

          <Box
            position="relative"
            zIndex="1"
            maxH="80vh"
            w="100%"
            maxW="448px"
            overflowY="auto"
            borderRadius="20px"
            bg="#FFFFFF"
            px="20px"
            py="20px"
            boxShadow="0 24px 64px rgba(15, 23, 42, 0.24)"
          >
            <Flex align="center" justify="space-between" mb="16px">
              <Text fontSize="16px" fontWeight="700" color="#111827">
                팔로잉 목록
              </Text>
              <Button
                type="button"
                variant="ghost"
                minW="auto"
                h="28px"
                px="4px"
                color="#9CA3AF"
                _hover={{ bg: 'transparent', color: '#4B5563' }}
                onClick={() => setIsFollowingModalOpen(false)}
                aria-label="팔로잉 목록 닫기"
              >
                ×
              </Button>
            </Flex>

            <Text borderRadius="14px" bg="#F9FAFB" px="12px" py="10px" fontSize="12px" color="#6B7280">
              팔로우와 팔로잉은 실명 프로필 기준으로만 제공됩니다. 익명 작성은 별도 팔로우를 만들지 않습니다.
            </Text>

            <Box position="relative" mt="16px">
              <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" color="#9CA3AF">
                <Search size={16} />
              </Box>
              <Input
                h="44px"
                pl="40px"
                pr="16px"
                borderRadius="12px"
                borderColor="#E5E7EB"
                placeholder="사용자 검색..."
                _placeholder={{ color: '#9CA3AF' }}
                _focus={{
                  borderColor: '#FDBA74',
                  boxShadow: '0 0 0 2px rgba(251, 146, 60, 0.14)',
                }}
              />
            </Box>

            <Flex mt="16px" direction="column" gap="12px">
              {followingProfiles.map((profile) => {
                const displayName =
                  profile.mode === 'real'
                    ? ('name' in profile && profile.name ? profile.name : profile.nickname)
                    : profile.name;
                const profilePosition = 'position' in profile ? profile.position : undefined;

                return (
                  <Flex
                    key={profile.profileId}
                    align="center"
                    justify="space-between"
                    gap="12px"
                    borderWidth="1px"
                    borderColor="#E5E7EB"
                    borderRadius="16px"
                    bg="#FFFFFF"
                    px="16px"
                    py="14px"
                  >
                    <Flex minW="0" align="center" gap="12px">
                      <Box position="relative" boxSize="40px" overflow="hidden" rounded="full" borderWidth="1px" borderColor="#E5E7EB">
                        <Image src={profile.avatar} alt={displayName} w="100%" h="100%" objectFit="cover" />
                      </Box>
                      <Box minW="0">
                        <Flex align="center" gap="4px">
                          <Text fontSize="14px" fontWeight="700" color="#111827" lineClamp="1">
                            {displayName}
                          </Text>
                          {profile.mode === 'real' ? <BadgeCheck size={14} color="#3B82F6" /> : null}
                        </Flex>
                        <Text mt="2px" fontSize="11px" color="#6B7280" lineClamp="1">
                          {profilePosition ?? '커뮤니티 활동 중'}
                        </Text>
                        <Text mt="2px" fontSize="11px" color="#9CA3AF" lineClamp="1">
                          {profile.mode === 'real'
                            ? '인증된 실명 프로필입니다.'
                            : '실명 프로필로 활동 중입니다.'}
                        </Text>
                      </Box>
                    </Flex>

                    <Button
                      type="button"
                      h="32px"
                      px="10px"
                      borderRadius="10px"
                      bg="#F3F4F6"
                      color="#6B7280"
                      fontSize="11px"
                      fontWeight="600"
                      _hover={{ bg: '#E5E7EB', color: '#374151' }}
                    >
                      팔로잉
                    </Button>
                  </Flex>
                );
              })}
            </Flex>
          </Box>
        </Flex>
      ) : null}
    </Box>
  );
}

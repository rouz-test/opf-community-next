'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Flex, HStack, Icon, Image, Text } from '@chakra-ui/react';
import { Bookmark, MessageSquare, MoreHorizontal, Share2, Trash2 } from 'lucide-react';
import tagsData from '@/data/mock/tags.json';
import CheckBadgeIcon from '@/app/user/components/icons/CheckBadgeIcon';
import EyeClosedIcon from '@/app/user/components/icons/EyeClosedIcon';
import HeartFilledIcon from '@/app/user/components/icons/HeartFilledIcon';
import HeartIcon from '@/app/user/components/icons/HeartIcon';
import PenIcon from '@/app/user/components/icons/PenIcon';
import { type CommunityPost } from '@/app/user/lib/community-content-data';
import UserTagBadge from '@/app/user/components/ui/tag/tag-badge';
import { resolveTags } from '@/lib/tags';
import type { Tag } from '@/types/tag';

const tags = tagsData as Tag[];
const CAROUSEL_SLIDE_GAP = '10px';
const ANONYMOUS_PROFILE_IMAGE = '/images/profiles/anonymous-small.png';
const DEFAULT_REAL_PROFILE_IMAGE = '/images/profiles/real-small.png';

const compactMeta = (parts: Array<string | null | undefined>) =>
  parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part)).join(' · ');

const formatCarouselDate = (dateString?: string) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

type PostAction = (post: CommunityPost) => void | Promise<void>;

function HighlightPostCard({
  post,
  onToggleLike,
  onToggleSave,
  onRequestDelete,
  onRequestEdit,
  onRequestHide,
}: {
  post: CommunityPost;
  onToggleLike?: PostAction;
  onToggleSave?: PostAction;
  onRequestDelete?: PostAction;
  onRequestEdit?: PostAction;
  onRequestHide?: PostAction;
}) {
  const router = useRouter();
  const isAnonymousPost = !post.isRealName && post.type !== 'notice';
  const authorName = isAnonymousPost ? '익명' : post.author.name;
  const authorMeta = isAnonymousPost
    ? formatCarouselDate(post.createdAt)
    : compactMeta([post.author.company, post.author.position, formatCarouselDate(post.createdAt)]);
  const isOwnPost = post.author.accountId === 'account-user-1';
  const [isOwnPostMenuOpen, setIsOwnPostMenuOpen] = useState(false);
  const [fallbackIsLiked, setFallbackIsLiked] = useState(post.isLikedByMe);
  const [fallbackLikeCount, setFallbackLikeCount] = useState(post.likes);
  const [fallbackIsSaved, setFallbackIsSaved] = useState(post.isSavedByMe);
  const ownPostMenuRef = useRef<HTMLDivElement | null>(null);
  const resolvedTags = useMemo(() => {
    const sourceNames = post.tags ?? [];
    const tagIds = sourceNames
      .map((name) => tags.find((tag) => tag.name === name)?.id)
      .filter((tagId): tagId is string => Boolean(tagId));

    return resolveTags(tagIds, tags);
  }, [post.tags]);
  const displayIsLiked = onToggleLike ? post.isLikedByMe : fallbackIsLiked;
  const displayLikeCount = onToggleLike ? post.likes : fallbackLikeCount;
  const displayIsSaved = onToggleSave ? post.isSavedByMe : fallbackIsSaved;
  const mobileVisibleTags = resolvedTags.slice(0, 3);
  const hiddenMobileTagCount = Math.max(0, resolvedTags.length - mobileVisibleTags.length);

  const handleAuthorAvatarClick = (event: React.MouseEvent) => {
    if (isAnonymousPost) return;
    event.preventDefault();
    event.stopPropagation();
    router.push(`/user/community/author/${post.author.id}`);
  };

  useEffect(() => {
    if (!isOwnPostMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!ownPostMenuRef.current) return;
      if (ownPostMenuRef.current.contains(event.target as Node)) return;
      setIsOwnPostMenuOpen(false);
    };

    window.addEventListener('mousedown', handlePointerDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOwnPostMenuOpen]);

  return (
    <Link href={`/user/community/post/${post.id}`}>
      <Box
        as="article"
        display="flex"
        h="280px"
        flexDirection="column"
        rounded="3xl"
        bg="white"
        p="20px"
        transition="all 0.2s"
      >
        <Flex h="40px" align="center" justify="space-between" gap="3">
          <Button
            type="button"
            onClick={handleAuthorAvatarClick}
            display="flex"
            alignItems="center"
            gap="2"
            minW="0"
            h="auto"
            bg="transparent"
            p="0"
            textAlign="left"
            color="inherit"
            _hover={{ bg: 'transparent' }}
            _active={{ bg: 'transparent' }}
            aria-label={isAnonymousPost ? `${authorName} 작성자 정보` : `${authorName} 작성자 페이지로 이동`}
            disabled={isAnonymousPost}
          >
            {isAnonymousPost ? (
              <Image src={ANONYMOUS_PROFILE_IMAGE} alt={authorName} h="6" w="6" rounded="full" objectFit="cover" />
            ) : (
              <Image
                src={post.author.avatar || DEFAULT_REAL_PROFILE_IMAGE}
                alt={authorName}
                h="6"
                w="6"
                rounded="full"
                objectFit="cover"
              />
            )}

            <Box minW="0" display="flex" flexDirection="column" justifyContent="center" h="40px">
              <Flex align="center" gap="1">
                <Text fontSize="14px" fontWeight="700" color="gray.900" lineHeight="14px">
                  {authorName}
                </Text>
                {!isAnonymousPost ? <Icon as={CheckBadgeIcon} boxSize="16px" color="#11B3E9" /> : null}
              </Flex>
              <Text mt="6px" fontSize="12px" color="gray.500" lineHeight="12px">
                {authorMeta}
              </Text>
            </Box>
          </Button>

          {isOwnPost ? (
            <Box ref={ownPostMenuRef} position="relative" flexShrink={0}>
              <Button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsOwnPostMenuOpen((prev) => !prev);
                }}
                minW="8"
                h="8"
                rounded="full"
                bg="transparent"
                p="0"
                color="gray.400"
                _hover={{ bg: 'transparent', color: 'gray.700' }}
                aria-label="내 게시글 메뉴 열기"
              >
                <Icon as={MoreHorizontal} boxSize="5" />
              </Button>

              {isOwnPostMenuOpen ? (
                <Box position="absolute" top="10" right="0" zIndex="10" w="176px" overflow="hidden" rounded="xl" borderWidth="1px" borderColor="gray.200" bg="white" py="1.5" boxShadow="lg">
                  {[
                    { icon: PenIcon, label: '수정' },
                    { icon: Trash2, label: '삭제' },
                    { icon: EyeClosedIcon, label: '숨김' },
                  ].map((item) => (
                    <Button
                      key={item.label}
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsOwnPostMenuOpen(false);
                        if (item.label === '수정') {
                          onRequestEdit?.(post);
                        }
                        if (item.label === '삭제') {
                          onRequestDelete?.(post);
                        }
                        if (item.label === '숨김') {
                          onRequestHide?.(post);
                        }
                      }}
                      justifyContent="flex-start"
                      gap="2"
                      w="full"
                      rounded="none"
                      bg="transparent"
                      px="3"
                      py="2"
                      fontSize="sm"
                      fontWeight="400"
                      color="gray.700"
                      _hover={{ bg: 'gray.50' }}
                    >
                      <Icon as={item.icon} boxSize="4" />
                      <Text>{item.label}</Text>
                    </Button>
                  ))}
                </Box>
              ) : null}
            </Box>
          ) : null}
        </Flex>

        <HStack mt="25px" gap="3" wrap="wrap">
          {post.type === 'notice' ? (
            <Flex
              align="center"
              justify="center"
              h="20px"
              borderRadius="10px"
              bg="#FF6900"
              px="10px"
              fontSize="11px"
              fontWeight="600"
              color="white"
            >
              공지
            </Flex>
          ) : null}
          {post.type === 'notice' && resolvedTags.length > 0 ? <Box h="6" w="1px" bg="gray.200" /> : null}
          <Box display={{ base: 'contents', md: 'none' }}>
            {mobileVisibleTags.map((tag) => (
              <UserTagBadge key={tag.id} tag={tag} />
            ))}
            {hiddenMobileTagCount > 0 ? (
              <Flex
                align="center"
                justify="center"
                h="20px"
                borderRadius="10px"
                bg="#F3F4F6"
                px="10px"
                fontSize="11px"
                fontWeight="700"
                color="#6B7280"
              >
                +{hiddenMobileTagCount}
              </Flex>
            ) : null}
          </Box>
          <Box display={{ base: 'none', md: 'contents' }}>
            {resolvedTags.map((tag) => (
              <UserTagBadge key={tag.id} tag={tag} />
            ))}
          </Box>
        </HStack>

        <Text mt="12px" lineClamp="1" fontSize="16px" fontWeight="700" color="gray.900" lineHeight="16px">
          {post.title}
        </Text>
        <Text mt="4" lineClamp={3} minH="69.3px" fontSize="14px" lineHeight="1.65" color="gray.600">
          {post.content}
        </Text>

        <Flex mt="auto" align="center" justify="space-between" color="gray.500">
          <HStack gap="4">
            <Button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (onToggleLike) {
                  onToggleLike(post);
                  return;
                }

                setFallbackIsLiked((prev) => {
                  const next = !prev;
                  setFallbackLikeCount((count) => Math.max(0, count + (next ? 1 : -1)));
                  return next;
                });
              }}
              gap="1.5"
              minW="auto"
              h="auto"
              bg="transparent"
              p="0"
              color={displayIsLiked ? 'orange.500' : 'gray.500'}
              _hover={{ bg: 'transparent', color: 'orange.500' }}
            >
              <Icon as={displayIsLiked ? HeartFilledIcon : HeartIcon} boxSize="20px" />
              <Text fontSize="14px">{displayLikeCount}</Text>
            </Button>
            <HStack gap="1.5">
              <Icon as={MessageSquare} boxSize="20px" />
              <Text fontSize="14px">{post.commentCount ?? 0}</Text>
            </HStack>
          </HStack>

          <HStack gap="4">
            <Icon as={Share2} boxSize="20px" />
            <Button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (onToggleSave) {
                  onToggleSave(post);
                  return;
                }

                setFallbackIsSaved((prev) => !prev);
              }}
              minW="auto"
              h="auto"
              bg="transparent"
              p="0"
              color={displayIsSaved ? 'orange.500' : 'gray.500'}
              _hover={{ bg: 'transparent', color: 'orange.500' }}
              aria-label="북마크"
              title="북마크 표시"
            >
              <Icon as={Bookmark} boxSize="20px" fill={displayIsSaved ? 'currentColor' : 'none'} />
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Link>
  );
}

export function HighlightCarousel({
  posts,
  onToggleLike,
  onToggleSave,
  onRequestDelete,
  onRequestEdit,
  onRequestHide,
}: {
  posts: CommunityPost[];
  onToggleLike?: PostAction;
  onToggleSave?: PostAction;
  onRequestDelete?: PostAction;
  onRequestEdit?: PostAction;
  onRequestHide?: PostAction;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const swipeThreshold = 50;

  const pages = useMemo(() => posts.map((post) => [post]), [posts]);
  const safeCurrentPage = pages.length === 0 ? 0 : Math.min(currentPage, pages.length - 1);

  useEffect(() => {
    if (pages.length <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % pages.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [pages.length]);

  if (pages.length === 0) return null;

  const goToPrev = () => setCurrentPage((prev) => (prev === 0 ? pages.length - 1 : prev - 1));
  const goToNext = () => setCurrentPage((prev) => (prev + 1) % pages.length);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current == null || touchEndXRef.current == null) {
      touchStartXRef.current = null;
      touchEndXRef.current = null;
      return;
    }

    const deltaX = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(deltaX) >= swipeThreshold) {
      if (deltaX > 0) goToNext();
      else goToPrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <Box
      position="relative"
      overflow="visible"
      px={{ base: '3', md: '4' }}
      pt="0"
      pb={{ base: '3', md: '4' }}
      mx={{ base: '-3', md: '-4' }}
    >
      <Box
        overflow="visible"
        filter="drop-shadow(0 10px 30px rgba(255, 105, 0, 0.12))"
        transition="filter 0.2s"
        _hover={{ filter: 'drop-shadow(0 14px 34px rgba(255, 105, 0, 0.16))' }}
      >
        <Box overflow="hidden" rounded="3xl" mx={`-${CAROUSEL_SLIDE_GAP}`}>
          <Flex
            touchAction="pan-y"
            transition="transform 0.5s ease-out"
            transform={`translateX(-${safeCurrentPage * 100}%)`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {pages.map((pagePosts, pageIndex) => (
              <Box key={pageIndex} w="full" flexShrink={0} px={CAROUSEL_SLIDE_GAP}>
                {pagePosts.map((post) => (
                  <HighlightPostCard
                    key={post.id}
                    post={post}
                    onToggleLike={onToggleLike}
                    onToggleSave={onToggleSave}
                    onRequestDelete={onRequestDelete}
                    onRequestEdit={onRequestEdit}
                    onRequestHide={onRequestHide}
                  />
                ))}
              </Box>
            ))}
          </Flex>
        </Box>
      </Box>

      {pages.length > 1 ? (
        <Flex mt="4" align="center" justify="center" gap="3">
          {pages.map((_, pageIndex) => (
            <Button
              key={pageIndex}
              type="button"
              onClick={() => setCurrentPage(pageIndex)}
              h="2.5"
              minW="2.5"
              rounded="full"
              bg={safeCurrentPage === pageIndex ? 'gray.600' : 'gray.300'}
              p="0"
              transition="all 0.2s"
              _hover={{ bg: safeCurrentPage === pageIndex ? 'gray.600' : 'gray.400' }}
              aria-label={`${pageIndex + 1}번 하이라이트로 이동`}
            />
          ))}
        </Flex>
      ) : null}
    </Box>
  );
}

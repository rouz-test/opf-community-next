'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Trash2,
  EyeOff,
} from 'lucide-react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import CheckBadgeIcon from '@/app/user/components/icons/CheckBadgeIcon';
import PenIcon from '@/app/user/components/icons/PenIcon';
import { type CommunityPost } from '@/app/user/lib/community-content-data';
import tagsData from '@/data/mock/tags.json';
import UserTagBadge from '@/app/user/components/ui/tag/tag-badge';
import { resolveTags } from '@/lib/tags';
import type { Tag as CommunityTag } from '@/types/tag';

type FeedPostCardProps = {
  post: CommunityPost;
  formatDate: (dateString?: string) => string;
  searchQuery: string;
  onToggleLike?: (post: CommunityPost) => void;
  onToggleSave?: (post: CommunityPost) => void;
  onRequestDelete?: (post: CommunityPost) => void;
  onRequestEdit?: (post: CommunityPost) => void;
  onRequestHide?: (post: CommunityPost) => void;
  enableOwnPostMenu?: boolean;
  hideActionLabel?: string;
  ownPostMenuActions?: Array<'edit' | 'delete' | 'hide'>;
};

const tags = tagsData as CommunityTag[];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightMatchedText = (text: string, searchQuery: string) => {
  const keyword = searchQuery.trim();

  if (!keyword) return text;

  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === keyword.toLowerCase()) {
      return (
        <Text
          key={`${part}-${index}`}
          as="mark"
          rounded="sm"
          bg="yellow.200"
          px="0.5"
          color="inherit"
        >
          {part}
        </Text>
      );
    }

    return part;
  });
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
};

export function FeedPostCard({
  post,
  formatDate,
  searchQuery,
  onToggleLike,
  onToggleSave,
  onRequestDelete,
  onRequestEdit,
  onRequestHide,
  enableOwnPostMenu = true,
  hideActionLabel = '숨김',
  ownPostMenuActions = ['edit', 'delete', 'hide'],
}: FeedPostCardProps) {
  const isAnonymousPost = !post.isRealName && post.type !== 'notice';
  const authorName = isAnonymousPost ? '익명' : post.author.name;
  const highlightedCommentAuthorName = post.highlightedComment
    ? post.highlightedComment.author.mode === 'real'
      ? post.highlightedComment.author.name
      : '익명'
    : '';
  const isHighlightedCommentRealName = post.highlightedComment?.author.mode === 'real';
  const isOwnPost = post.author.accountId === 'account-user-1';
  const router = useRouter();
  const commentCount = post.commentCount ?? 0;
  const [fallbackIsSaved, setFallbackIsSaved] = useState(post.isSavedByMe);
  const [isOwnPostMenuOpen, setIsOwnPostMenuOpen] = useState(false);
  const [fallbackIsLiked, setFallbackIsLiked] = useState(post.isLikedByMe);
  const [fallbackLikeCount, setFallbackLikeCount] = useState(post.likes);
  const ownPostMenuRef = useRef<HTMLDivElement | null>(null);
  const maxContentLength = useBreakpointValue({ base: 100, md: 200 }) ?? 200;
  const images = post.images ?? [];
  const visibleImages = images.slice(0, 2);
  const remainingImageCount = Math.max(images.length - 2, 0);
  const resolvedTags = useMemo(() => {
    const sourceNames = post.tags ?? [];
    const tagIds = sourceNames
      .map((name) => tags.find((tag) => tag.name === name)?.id)
      .filter((tagId): tagId is string => Boolean(tagId));

    return resolveTags(tagIds, tags);
  }, [post.tags]);
  const ownPostMenuItems = [
    { key: 'edit' as const, icon: PenIcon, label: '수정' },
    { key: 'delete' as const, icon: Trash2, label: '삭제' },
    { key: 'hide' as const, icon: EyeOff, label: hideActionLabel },
  ].filter((item) => ownPostMenuActions.includes(item.key));
  const truncatedContent = truncateText(post.content, maxContentLength);
  const displayIsLiked = onToggleLike ? post.isLikedByMe : fallbackIsLiked;
  const displayLikeCount = onToggleLike ? post.likes : fallbackLikeCount;
  const displayIsSaved = onToggleSave ? post.isSavedByMe : fallbackIsSaved;

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
    <Box
      as="article"
      position="relative"
      overflow="hidden"
      rounded="3xl"
      bg="white"
      boxShadow="0 12px 30px rgba(223, 223, 223, 0.9)"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 16px 36px rgba(223, 223, 223, 0.98)',
      }}
    >
      {isOwnPost && enableOwnPostMenu ? (
        <Box ref={ownPostMenuRef} position="absolute" top="4" right="4" zIndex="10">
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
            <Icon as={MoreHorizontal} boxSize="4" />
          </Button>

          {isOwnPostMenuOpen ? (
            <Box position="absolute" top="10" right="0" w="176px" overflow="hidden" rounded="xl" borderWidth="1px" borderColor="gray.200" bg="white" py="1.5" boxShadow="lg">
              {ownPostMenuItems.map((item) => (
                <Button
                  key={item.label}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOwnPostMenuOpen(false);
                    if (item.key === 'edit') {
                      onRequestEdit?.(post);
                    }
                    if (item.key === 'delete') {
                      onRequestDelete?.(post);
                    }
                    if (item.key === 'hide') {
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

      <Link href={`/user/community/post/${post.id}`}>
        <Box display="block" px="5" pb="4" pt="5">
          <Flex mb="5" h="40px" align="center" justify="space-between" gap="3" pr="10">
            <Button
              type="button"
              onClick={handleAuthorAvatarClick}
              minW="auto"
              h="auto"
              bg="transparent"
              display="flex"
              alignItems="center"
              gap="2"
              p="0"
              textAlign="left"
              _hover={{ bg: 'transparent' }}
              _active={{ bg: 'transparent' }}
              aria-label={isAnonymousPost ? `${authorName} 작성자 정보` : `${authorName} 작성자 페이지로 이동`}
              disabled={isAnonymousPost}
            >
              {!isAnonymousPost && post.author.avatar ? (
                <Image src={post.author.avatar} alt={authorName} h="6" w="6" rounded="full" objectFit="cover" />
              ) : (
                <Flex
                  h="6"
                  w="6"
                  align="center"
                  justify="center"
                  rounded="full"
                  bg={isAnonymousPost ? 'gray.900' : '#FF6900'}
                  fontSize="10px"
                  fontWeight="700"
                  color="white"
                  flexShrink={0}
                >
                  {isAnonymousPost ? '익명' : 'OP'}
                </Flex>
              )}

              <Box minW="0" display="flex" flexDirection="column" justifyContent="center" h="40px">
                <Flex align="center" gap="1">
                  <Text fontSize="14px" fontWeight="700" color="gray.900" lineHeight="14px">
                    {authorName}
                  </Text>
                  {!isAnonymousPost && post.isRealName ? (
                    <Icon as={CheckBadgeIcon} boxSize="16px" color="cyan.400" />
                  ) : null}
                </Flex>
                <Text mt="2px" fontSize="12px" color="gray.500" lineHeight="12px">
                  {!isAnonymousPost ? `코마소프트 · ${post.author.position} · ${formatDate(post.createdAt)}` : formatDate(post.createdAt)}
                </Text>
              </Box>
            </Button>

          </Flex>

          {resolvedTags.length > 0 ? (
            <HStack mb="3" flexWrap="wrap" gap="2">
              {resolvedTags.map((tag) => (
                <UserTagBadge key={tag.id} tag={tag} />
              ))}
            </HStack>
          ) : null}

          <Flex mb="3" align="center" gap="2" wrap="wrap">
            {post.isPromotion ? (
              <Flex
                align="center"
                justify="center"
                h="20px"
                borderRadius="10px"
                bg="#7C3AED"
                px="10px"
                fontSize="11px"
                fontWeight="600"
                color="white"
                flexShrink={0}
              >
                홍보
              </Flex>
            ) : null}
            <Text fontSize="16px" fontWeight="700" color="gray.900" transition="color 0.2s" _hover={{ color: 'orange.500' }}>
              {highlightMatchedText(post.title, searchQuery)}
            </Text>
          </Flex>
          <Text mb="4" fontSize="14px" lineHeight="1.65" color="gray.700">
            {highlightMatchedText(truncatedContent, searchQuery)}
          </Text>

          {images.length > 0 ? (
            <GridImages visibleImages={visibleImages} imagesLength={images.length} remainingImageCount={remainingImageCount} />
          ) : null}

        </Box>
      </Link>

      <Box px="5" pb="5">
        <Flex py="1" align="center" justify="space-between" color="gray.500">
          <HStack gap="4">
            <Button
              type="button"
              onClick={() => {
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
              aria-label="좋아요"
              title="좋아요 표시"
            >
              <Icon as={Heart} boxSize="20px" fill={displayIsLiked ? 'currentColor' : 'none'} />
              <Text fontSize="14px">{displayLikeCount}</Text>
            </Button>
            <Button
              type="button"
              gap="1.5"
              minW="auto"
              h="auto"
              bg="transparent"
              p="0"
              color="gray.500"
              _hover={{ bg: 'transparent', color: 'blue.500' }}
            >
              <Icon as={MessageSquare} boxSize="20px" />
              <Text fontSize="14px">{commentCount}</Text>
            </Button>
          </HStack>

          <HStack gap="4">
            <Button
              type="button"
              minW="auto"
              h="auto"
              bg="transparent"
              p="0"
              color="gray.500"
              _hover={{ bg: 'transparent', color: 'blue.500' }}
              aria-label="공유"
              title="공유하기"
            >
              <Icon as={Share2} boxSize="20px" />
            </Button>
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

        {post.highlightedComment ? (
          <Box mt="4" rounded="20px" borderWidth="1px" borderColor="orange.200" bg="orange.50" px={{ base: '4', sm: '5' }} py="4">
            <Flex align="flex-start" gap="3">
              {post.highlightedComment.author.avatar ? (
                <Image
                  src={post.highlightedComment.author.avatar}
                  alt={highlightedCommentAuthorName}
                  h={{ base: '8', sm: '9' }}
                  w={{ base: '8', sm: '9' }}
                  flexShrink={0}
                  rounded="full"
                  objectFit="cover"
                />
              ) : (
                <Box h={{ base: '8', sm: '9' }} w={{ base: '8', sm: '9' }} flexShrink={0} rounded="full" bg="gray.200" />
              )}
              <Box minW="0" flex="1">
                <HStack mb="1.5" gap="2">
                  <Text truncate fontSize="14px" fontWeight="700" color="gray.900">
                    {highlightedCommentAuthorName}
                  </Text>
                  {isHighlightedCommentRealName ? <Icon as={CheckBadgeIcon} boxSize="4" color="cyan.400" /> : null}
                </HStack>
                <Text lineClamp={{ base: 2, sm: 3 }} fontSize="14px" lineHeight="1.65" color="gray.600">
                  {post.highlightedComment.content}
                </Text>
              </Box>
            </Flex>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

function GridImages({
  visibleImages,
  imagesLength,
  remainingImageCount,
}: {
  visibleImages: string[];
  imagesLength: number;
  remainingImageCount: number;
}) {
  return (
    <Box mb="3" display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap="2">
      {visibleImages.map((image, index) => (
        <Box key={index} position="relative" aspectRatio="16 / 9" overflow="hidden" rounded="lg">
          <Image src={image} alt={`post-${index}`} h="full" w="full" objectFit="cover" />
          {index === 1 && imagesLength > 2 ? (
            <Flex position="absolute" inset="0" align="center" justify="center" bg="blackAlpha.600" fontSize="2xl" fontWeight="700" color="white">
              +{remainingImageCount}
            </Flex>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}

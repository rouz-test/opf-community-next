'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Pencil,
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
} from '@chakra-ui/react';
import { type CommunityPost } from '@/app/user/lib/community-content-data';
import tagsData from '@/data/mock/tags.json';
import UserTagBadge from '@/app/user/components/ui/tag/tag-badge';
import { resolveTags } from '@/lib/tags';
import type { Tag as CommunityTag } from '@/types/tag';

type FeedPostCardProps = {
  post: CommunityPost;
  formatDate: (dateString?: string) => string;
  searchQuery: string;
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

export function FeedPostCard({ post, formatDate, searchQuery }: FeedPostCardProps) {
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
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [postLikeCount, setPostLikeCount] = useState(post.likes);
  const [isPostBookmarked, setIsPostBookmarked] = useState(false);
  const [isOwnPostMenuOpen, setIsOwnPostMenuOpen] = useState(false);
  const ownPostMenuRef = useRef<HTMLDivElement | null>(null);
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
      {isOwnPost ? (
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
            bg="whiteAlpha.900"
            p="0"
            color="gray.500"
            boxShadow="sm"
            _hover={{ bg: 'gray.50', color: 'gray.700' }}
            aria-label="내 게시글 메뉴 열기"
          >
            <Icon as={MoreHorizontal} boxSize="4" />
          </Button>

          {isOwnPostMenuOpen ? (
            <Box position="absolute" top="10" right="0" w="176px" overflow="hidden" rounded="xl" borderWidth="1px" borderColor="gray.200" bg="white" py="1.5" boxShadow="lg">
              {[
                { icon: Pencil, label: '수정' },
                { icon: Trash2, label: '삭제' },
                { icon: EyeOff, label: '숨김' },
              ].map((item) => (
                <Button
                  key={item.label}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOwnPostMenuOpen(false);
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
                    <Icon as={BadgeCheck} boxSize="5" color="cyan.400" />
                  ) : null}
                </Flex>
                <Text mt="2px" fontSize="12px" color="gray.500" lineHeight="12px">
                  {!isAnonymousPost ? `코마소프트 · ${post.author.position} · ${formatDate(post.createdAt)}` : formatDate(post.createdAt)}
                </Text>
              </Box>
            </Button>

            {post.isPromotion ? (
              <Flex rounded="full" bg="purple.500" px="2.5" py="1" fontSize="xs" fontWeight="500" color="white">
                홍보
              </Flex>
            ) : null}
          </Flex>

          {resolvedTags.length > 0 ? (
            <HStack mb="3" flexWrap="wrap" gap="2">
              {resolvedTags.map((tag) => (
                <UserTagBadge key={tag.id} tag={tag} />
              ))}
            </HStack>
          ) : null}

          <Text mb="3" fontSize="16px" fontWeight="700" color="gray.900" transition="color 0.2s" _hover={{ color: 'orange.500' }}>
            {highlightMatchedText(post.title, searchQuery)}
          </Text>
          <Text mb="4" lineClamp="4" fontSize="14px" lineHeight="1.65" color="gray.700">
            {highlightMatchedText(post.content, searchQuery)}
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
                setIsPostLiked((prev) => {
                  const next = !prev;
                  setPostLikeCount(next ? post.likes + 1 : post.likes);
                  return next;
                });
              }}
              gap="1.5"
              minW="auto"
              h="auto"
              bg="transparent"
              p="0"
              color={isPostLiked ? 'orange.500' : 'gray.500'}
              _hover={{ bg: 'transparent', color: 'orange.500' }}
              aria-label="좋아요"
              title="좋아요 표시"
            >
              <Icon as={Heart} boxSize="20px" fill={isPostLiked ? 'currentColor' : 'none'} />
              <Text fontSize="14px">{postLikeCount}</Text>
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
                setIsPostBookmarked((prev) => !prev);
              }}
              minW="auto"
              h="auto"
              bg="transparent"
              p="0"
              color={isPostBookmarked ? 'orange.500' : 'gray.500'}
              _hover={{ bg: 'transparent', color: 'orange.500' }}
              aria-label="북마크"
              title="북마크 표시"
            >
              <Icon as={Bookmark} boxSize="20px" fill={isPostBookmarked ? 'currentColor' : 'none'} />
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
                  {isHighlightedCommentRealName ? <Icon as={BadgeCheck} boxSize="4" color="cyan.400" /> : null}
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
        <Box key={index} position="relative" aspectRatio="16 / 9" overflow="hidden" rounded="lg" bg="gray.100">
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

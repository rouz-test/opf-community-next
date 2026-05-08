'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
  Stack,
  Text,
} from '@chakra-ui/react';
import { type CommunityPost } from '@/app/user/lib/community-content-data';

type FeedPostCardProps = {
  post: CommunityPost;
  formatDate: (dateString?: string) => string;
  searchQuery: string;
};

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
      rounded="lg"
      borderWidth="1px"
      borderColor="gray.200"
      bg="white"
      transition="all 0.2s"
      _hover={{ borderColor: 'gray.300' }}
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

      {post.highlightedComment ? (
        <Flex borderBottomWidth="1px" borderColor="gray.100" px="4" pb="3" pt="3" align="center" gap="2" fontSize="sm" color="gray.600">
          {post.highlightedComment.author.avatar ? (
            <Image src={post.highlightedComment.author.avatar} alt={highlightedCommentAuthorName} h="7" w="7" rounded="full" objectFit="cover" />
          ) : (
            <Box h="7" w="7" rounded="full" bg="gray.200" />
          )}
          <HStack minW="0" gap="1.5" fontSize="sm" color="gray.600">
            <Text truncate fontWeight="500" color="gray.800">
              {highlightedCommentAuthorName}
            </Text>
            {isHighlightedCommentRealName ? <Icon as={BadgeCheck} boxSize="3.5" color="blue.500" /> : null}
            <Text flexShrink={0}>님이 댓글을 남김</Text>
          </HStack>
        </Flex>
      ) : null}

      <Link href={`/user/community/post/${post.id}`}>
        <Box display="block" p="4" pb="3">
          <Flex mb="3" align="center" justify="space-between" gap="3" pr="10">
            <Button
              type="button"
              onClick={handleAuthorAvatarClick}
              gap="3"
              minW="auto"
              h="auto"
              bg="transparent"
              p="0"
              textAlign="left"
              _hover={{ bg: 'transparent' }}
              _active={{ bg: 'transparent' }}
              aria-label={isAnonymousPost ? `${authorName} 작성자 정보` : `${authorName} 작성자 페이지로 이동`}
              disabled={isAnonymousPost}
            >
              {!isAnonymousPost && post.author.avatar ? (
                <Image src={post.author.avatar} alt={authorName} h="10" w="10" rounded="full" objectFit="cover" />
              ) : (
                <Flex
                  h="10"
                  w="10"
                  align="center"
                  justify="center"
                  rounded="full"
                  bg={isAnonymousPost ? 'gray.900' : 'gray.200'}
                  fontSize="11px"
                  fontWeight="700"
                  color={isAnonymousPost ? 'white' : 'transparent'}
                >
                  {isAnonymousPost ? '익명' : '·'}
                </Flex>
              )}
              <Stack gap="0">
                <HStack gap="2">
                  <Text fontSize="sm" fontWeight="600" color="gray.900">
                    {authorName}
                  </Text>
                  {!isAnonymousPost && post.isRealName ? <Icon as={BadgeCheck} boxSize="4" color="blue.500" /> : null}
                  {!isAnonymousPost && post.author.position ? (
                    <Text fontSize="xs" color="gray.500">
                      · {post.author.position}
                    </Text>
                  ) : null}
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {formatDate(post.createdAt)}
                </Text>
              </Stack>
            </Button>

            {post.isPromotion ? (
              <Flex rounded="full" bg="purple.500" px="2.5" py="1" fontSize="xs" fontWeight="500" color="white">
                홍보
              </Flex>
            ) : null}
          </Flex>

          {(post.tags || []).length > 0 ? (
            <HStack mb="3" flexWrap="wrap" gap="1.5">
              {(post.tags || []).slice(0, 3).map((tag, index) => (
                <Flex
                  key={tag}
                  rounded="full"
                  borderWidth="1px"
                  borderColor={
                    index === 0 ? 'green.200' : index === 1 ? 'orange.200' : 'gray.200'
                  }
                  bg={index === 0 ? 'green.100' : index === 1 ? 'orange.100' : 'gray.100'}
                  px="2"
                  py="0.5"
                  fontSize="xs"
                  fontWeight="600"
                  color={index === 0 ? 'green.700' : index === 1 ? 'orange.700' : 'gray.700'}
                >
                  {tag}
                </Flex>
              ))}
            </HStack>
          ) : null}

          <Text mb="2" fontSize="base" fontWeight="700" color="gray.900" transition="color 0.2s" _hover={{ color: 'orange.500' }}>
            {highlightMatchedText(post.title, searchQuery)}
          </Text>
          <Text mb="3" lineClamp="4" fontSize="sm" lineHeight="relaxed" color="gray.700">
            {highlightMatchedText(post.content, searchQuery)}
          </Text>

          {images.length > 0 ? (
            <GridImages visibleImages={visibleImages} imagesLength={images.length} remainingImageCount={remainingImageCount} />
          ) : null}

          {post.highlightedComment ? (
            <Box mb="3" rounded="xl" borderWidth="1px" borderColor="orange.100" bg="orange.50" px={{ base: '3', sm: '4' }} py="3">
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
                  <HStack mb="1" gap="2">
                    <Text truncate fontSize="sm" fontWeight="600" color="gray.900">
                      {highlightedCommentAuthorName}
                    </Text>
                    {isHighlightedCommentRealName ? <Icon as={BadgeCheck} boxSize="3.5" color="blue.500" /> : null}
                    <Text fontSize="xs" color="gray.500">
                      댓글
                    </Text>
                  </HStack>
                  <Text lineClamp={{ base: 2, sm: 3 }} fontSize="sm" lineHeight="relaxed" color="gray.700">
                    {post.highlightedComment.content}
                  </Text>
                </Box>
              </Flex>
            </Box>
          ) : null}
        </Box>
      </Link>

      <Flex borderTopWidth="1px" borderColor="gray.100" px="4" py="3" align="center" justify="space-between">
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
            color={isPostLiked ? 'orange.500' : 'gray.600'}
            _hover={{ bg: 'transparent', color: 'orange.500' }}
            aria-label="좋아요"
            title="좋아요 표시"
          >
            <Icon as={Heart} boxSize="5" fill={isPostLiked ? 'currentColor' : 'none'} />
            <Text fontSize="sm" fontWeight="500">
              {postLikeCount}
            </Text>
          </Button>
          <Button type="button" gap="1.5" minW="auto" h="auto" bg="transparent" p="0" color="gray.600" _hover={{ bg: 'transparent', color: 'blue.500' }}>
            <Icon as={MessageSquare} boxSize="5" />
            <Text fontSize="sm" fontWeight="500">
              {commentCount}
            </Text>
          </Button>
        </HStack>

        <HStack gap="3">
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
            <Icon as={Bookmark} boxSize="5" fill={isPostBookmarked ? 'currentColor' : 'none'} />
          </Button>
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
            <Icon as={Share2} boxSize="5" />
          </Button>
        </HStack>
      </Flex>
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

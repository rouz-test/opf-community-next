'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Text,
} from '@chakra-ui/react';
import {
  BadgeCheck,
  Heart,
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  Pencil,
  Trash2,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/app/user/components/providers/AuthProvider';
import { type CommunityPost } from '@/app/user/lib/community-content-data';

type Props = {
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

export function BoardPostRow({ post, formatDate, searchQuery }: Props) {
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
  const likeCount = post.likes;
  const commentCount = post.commentCount ?? 0;
  const { isLoggedIn } = useAuth();
  const [isPostBookmarked, setIsPostBookmarked] = useState(false);
  const [isOwnPostMenuOpen, setIsOwnPostMenuOpen] = useState(false);
  const ownPostMenuRef = useRef<HTMLDivElement | null>(null);

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
        position="relative"
        rounded="lg"
        borderWidth="1px"
        borderColor="gray.200"
        bg="white"
        transition="all 0.2s"
        _hover={{ borderColor: 'gray.300', boxShadow: 'sm' }}
      >
        {post.highlightedComment ? (
          <Flex borderBottomWidth="1px" borderColor="gray.100" px="5" pb="3" pt="3" align="center" gap="2" fontSize="sm" color="gray.600">
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

        <Flex gap="4" p="5">
          <Box minW="0" flex="1">
            <HStack mb="2.5" flexWrap="wrap" gap="1.5">
              {(post.tags || []).slice(0, 2).map((tag, index) => (
                <Flex
                  key={tag}
                  rounded="full"
                  borderWidth="1px"
                  borderColor={index === 0 ? 'green.200' : 'blue.200'}
                  bg={index === 0 ? 'green.100' : 'blue.100'}
                  px="2"
                  py="0.5"
                  fontSize="xs"
                  fontWeight="600"
                  color={index === 0 ? 'green.700' : 'blue.700'}
                >
                  {tag}
                </Flex>
              ))}
            </HStack>

            <Text lineClamp="2" fontSize="base" fontWeight="600" color="gray.900" transition="color 0.2s" _hover={{ color: 'orange.500' }}>
              {highlightMatchedText(post.title, searchQuery)}
            </Text>
          </Box>

          <Flex display={{ base: 'none', md: 'flex' }} minW="220px" flexShrink={0} direction="column" align="flex-end" justify="space-between">
            <HStack gap="1.5">
              <Button
                type="button"
                onClick={handleAuthorAvatarClick}
                gap="2"
                minW="auto"
                h="auto"
                bg="transparent"
                p="0"
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
                    bg={isAnonymousPost ? 'gray.900' : 'gray.200'}
                    fontSize="9px"
                    fontWeight="700"
                    color={isAnonymousPost ? 'white' : 'transparent'}
                  >
                    {isAnonymousPost ? '익명' : '·'}
                  </Flex>
                )}
                <HStack gap="1.5" lineHeight="none">
                  <Text fontSize="sm" fontWeight="500" color="gray.900">
                    {authorName}
                  </Text>
                  {!isAnonymousPost && post.isRealName ? <Icon as={BadgeCheck} boxSize="3.5" color="blue.500" /> : null}
                  {!isAnonymousPost && post.author.position ? (
                    <Text fontSize="xs" color="gray.500">
                      · {post.author.position}
                    </Text>
                  ) : null}
                </HStack>
              </Button>

              {isOwnPost ? (
                <Box ref={ownPostMenuRef} position="relative" ml="0.5">
                  <Button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsOwnPostMenuOpen((prev) => !prev);
                    }}
                    minW="7"
                    h="7"
                    rounded="full"
                    bg="transparent"
                    p="0"
                    color="gray.400"
                    _hover={{ bg: 'gray.100', color: 'gray.700' }}
                    aria-label="내 게시글 메뉴 열기"
                  >
                    <Icon as={MoreHorizontal} boxSize="4" />
                  </Button>

                  {isOwnPostMenuOpen ? (
                    <Box position="absolute" top="10" right="0" zIndex="10" w="176px" overflow="hidden" rounded="xl" borderWidth="1px" borderColor="gray.200" bg="white" py="1.5" boxShadow="lg">
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
            </HStack>

            <HStack gap="3" fontSize="sm" color="gray.500">
              <Text fontSize="xs">{formatDate(post.createdAt)}</Text>
              <HStack gap="1">
                <Icon as={Heart} boxSize="4" />
                <Text>{likeCount}</Text>
              </HStack>
              <HStack gap="1">
                <Icon as={MessageSquare} boxSize="4" />
                <Text>{commentCount}</Text>
              </HStack>
              {isLoggedIn ? (
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
                  color={isPostBookmarked ? 'orange.500' : 'gray.400'}
                  _hover={{ bg: 'transparent', color: 'orange.500' }}
                  aria-label="북마크"
                  title="로그인 사용자용 북마크"
                >
                  <Icon as={Bookmark} boxSize="4" fill={isPostBookmarked ? 'currentColor' : 'none'} />
                </Button>
              ) : null}
            </HStack>
          </Flex>
        </Flex>
      </Box>
    </Link>
  );
}

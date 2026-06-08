'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react';
import {
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import CheckBadgeIcon from '@/app/user/components/icons/CheckBadgeIcon';
import EyeClosedIcon from '@/app/user/components/icons/EyeClosedIcon';
import HeartFilledIcon from '@/app/user/components/icons/HeartFilledIcon';
import HeartIcon from '@/app/user/components/icons/HeartIcon';
import PenIcon from '@/app/user/components/icons/PenIcon';
import { useAuth } from '@/app/user/components/providers/AuthProvider';
import { type CommunityPost } from '@/app/user/lib/community-content-data';
import tagsData from '@/data/mock/tags.json';
import UserTagBadge from '@/app/user/components/ui/tag/tag-badge';
import { resolveTags } from '@/lib/tags';
import type { Tag as CommunityTag } from '@/types/tag';

type Props = {
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

export function BoardPostRow({
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
}: Props) {
  const isAnonymousPost = !post.isRealName && post.type !== 'notice';
  const authorName = isAnonymousPost ? '익명' : post.author.name;
  const isOwnPost = post.author.accountId === 'account-user-1';
  const router = useRouter();
  const likeCount = post.likes;
  const commentCount = post.commentCount ?? 0;
  const { isLoggedIn } = useAuth();
  const [fallbackIsSaved, setFallbackIsSaved] = useState(post.isSavedByMe);
  const [isOwnPostMenuOpen, setIsOwnPostMenuOpen] = useState(false);
  const [fallbackIsLiked, setFallbackIsLiked] = useState(post.isLikedByMe);
  const [fallbackLikeCount, setFallbackLikeCount] = useState(post.likes);
  const ownPostMenuRef = useRef<HTMLDivElement | null>(null);
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
    { key: 'hide' as const, icon: EyeClosedIcon, label: hideActionLabel },
  ].filter((item) => ownPostMenuActions.includes(item.key));
  const displayIsLiked = onToggleLike ? post.isLikedByMe : fallbackIsLiked;
  const displayLikeCount = onToggleLike ? likeCount : fallbackLikeCount;
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
    <Link href={`/user/community/post/${post.id}`}>
      <Box
        as="article"
        position="relative"
        overflow="visible"
        zIndex={isOwnPostMenuOpen ? 20 : 1}
        rounded={{ base: 'none', md: '3xl' }}
        bg="white"
        borderBottomWidth={{ base: '1px', md: '0' }}
        borderColor={{ base: 'gray.200', md: 'transparent' }}
        boxShadow={{ base: 'none', md: '0 12px 30px rgba(223, 223, 223, 0.9)' }}
        transition={{ md: 'transform 0.2s, box-shadow 0.2s' }}
        _hover={{
          transform: { md: 'translateY(-2px)' },
          boxShadow: { md: '0 16px 36px rgba(223, 223, 223, 0.98)' },
          zIndex: { md: 10 },
        }}
      >
        <Flex direction="column" gap={{ base: '6px', md: '4' }} px={{ base: '4', md: '5' }} py={{ base: '14px', md: '5' }}>
          <Flex align="flex-start" justify="space-between" gap="4">
            <Box minW="0" flex="1">
              <Text
                lineClamp={{ base: 1, md: 2 }}
                fontSize={{ base: '14px', md: '16px' }}
                fontWeight="700"
                color="gray.900"
                transition="color 0.2s"
                _hover={{ color: 'orange.500' }}
              >
                {highlightMatchedText(post.title, searchQuery)}
              </Text>
            </Box>

            <Box ref={ownPostMenuRef} flexShrink={0}>
              {isOwnPost && enableOwnPostMenu ? (
                <Button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOwnPostMenuOpen((prev) => !prev);
                  }}
                  minW={{ base: '6', md: '8' }}
                  h={{ base: '6', md: '8' }}
                  rounded="full"
                  bg="transparent"
                  p="0"
                  color="gray.400"
                  _hover={{ bg: 'gray.50', color: 'gray.700' }}
                  aria-label="내 게시글 메뉴 열기"
                >
                  <Icon as={MoreHorizontal} boxSize={{ base: '4', md: '5' }} />
                </Button>
              ) : null}

              {isOwnPostMenuOpen ? (
                <Box position="absolute" top="14" right="5" zIndex="10" w="176px" overflow="hidden" rounded="xl" borderWidth="1px" borderColor="gray.200" bg="white" py="1.5" boxShadow="lg">
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
          </Flex>

          <Flex align="center" justify="space-between" gap="4">
            <HStack minW="0" flex="1" gap="2" flexWrap={{ base: 'nowrap', md: 'wrap' }}>
              {resolvedTags.length > 0 ? (
                <HStack gap="2" flexShrink={0}>
                  {resolvedTags.slice(0, 1).map((tag) => (
                    <UserTagBadge key={tag.id} tag={tag} />
                  ))}
                  {resolvedTags.length > 1 ? (
                    <Flex
                      align="center"
                      justify="center"
                      h="20px"
                      minW="34px"
                      borderRadius="10px"
                      bg="gray.200"
                      px="8px"
                      fontSize="11px"
                      fontWeight="600"
                      color="gray.600"
                      flexShrink={0}
                    >
                      +{resolvedTags.length - 1}
                    </Flex>
                  ) : null}
                </HStack>
              ) : null}

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
                <Text fontSize={{ base: '12px', md: '14px' }} fontWeight="700" color="gray.900" lineHeight="14px">
                  {authorName}
                </Text>
                {!isAnonymousPost && post.isRealName ? (
                  <Icon as={CheckBadgeIcon} boxSize={{ base: '14px', md: '16px' }} color="#11B3E9" />
                ) : null}
                <Text fontSize="12px" color="gray.500" lineHeight="14px" whiteSpace="nowrap">
                  {formatDate(post.createdAt)}
                </Text>
              </Button>
            </HStack>

            <HStack gap={{ base: '4', md: '4' }} color="gray.500" flexShrink={0}>
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
                <Icon as={displayIsLiked ? HeartFilledIcon : HeartIcon} boxSize={{ base: '16px', md: '20px' }} />
                <Text fontSize={{ base: '12px', md: '14px' }}>{displayLikeCount}</Text>
              </Button>
              <HStack gap="1.5">
                <Icon as={MessageSquare} boxSize={{ base: '16px', md: '20px' }} />
                <Text fontSize={{ base: '12px', md: '14px' }}>{commentCount}</Text>
              </HStack>
              <HStack display={{ base: 'none', md: 'flex' }} gap="4">
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
                {isLoggedIn ? (
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
                    title="로그인 사용자용 북마크"
                  >
                    <Icon as={Bookmark} boxSize="20px" fill={displayIsSaved ? 'currentColor' : 'none'} />
                  </Button>
                ) : null}
              </HStack>
            </HStack>
          </Flex>
        </Flex>
      </Box>
    </Link>
  );
}

'use client';

import { Box, Button, Flex, Grid, Image, Link as ChakraLink, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import CheckBadgeIcon from '@/app/user/components/icons/CheckBadgeIcon';
import { toaster } from '@/app/user/components/ui/toaster';

export type AuthorProfileCardProps = {
  author: {
    id: string;
    name: string;
    nickname: string;
    avatar: string;
    position?: string;
  };
  displayMode?: 'real' | 'nickname';
  currentUserAccountId?: string;
  followerCount?: number;
  followingCount?: number;
  followLabel?: string;
  variant?: 'mobile' | 'sidebar';
};

export function AuthorProfileCard({
  author,
  displayMode = 'nickname',
  currentUserAccountId,
  followerCount = 892,
  followingCount = 124,
  followLabel = '팔로우',
  variant = 'sidebar',
}: AuthorProfileCardProps) {
  const displayName = displayMode === 'real' ? author.name : author.nickname;
  const [resolvedFollowerCount, setResolvedFollowerCount] = useState(followerCount);
  const [resolvedFollowingCount, setResolvedFollowingCount] = useState(followingCount);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const canFollow = Boolean(currentUserAccountId && currentUserAccountId !== author.id);
  const resolvedFollowLabel = isFollowing ? '팔로잉' : followLabel;
  const formattedFollowerCount = resolvedFollowerCount.toLocaleString('ko-KR');
  const formattedFollowingCount = resolvedFollowingCount.toLocaleString('ko-KR');

  useEffect(() => {
    setResolvedFollowerCount(followerCount);
  }, [followerCount]);

  useEffect(() => {
    setResolvedFollowingCount(followingCount);
  }, [followingCount]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ targetAccountId: author.id });

    if (currentUserAccountId) {
      params.set('viewerAccountId', currentUserAccountId);
    }

    const fetchFollowState = async () => {
      try {
        const response = await fetch(`/api/mock/community-follows?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await response.json().catch(() => null)) as
          | {
              followerCount?: number;
              followingCount?: number;
              isFollowing?: boolean;
            }
          | null;

        if (!response.ok || !data) return;

        setResolvedFollowerCount(Number(data.followerCount ?? followerCount));
        setResolvedFollowingCount(Number(data.followingCount ?? followingCount));
        setIsFollowing(Boolean(data.isFollowing));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    };

    fetchFollowState();

    return () => {
      controller.abort();
    };
  }, [author.id, currentUserAccountId, followerCount, followingCount]);

  const handleToggleFollow = async () => {
    if (!canFollow || !currentUserAccountId) return;

    setIsFollowLoading(true);

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const url =
        method === 'DELETE'
          ? `/api/mock/community-follows?${new URLSearchParams({
              followerAccountId: currentUserAccountId,
              followingAccountId: author.id,
            }).toString()}`
          : '/api/mock/community-follows';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(method === 'POST'
          ? {
              body: JSON.stringify({
                followerAccountId: currentUserAccountId,
                followingAccountId: author.id,
              }),
            }
          : {}),
      });
      const data = (await response.json().catch(() => null)) as
        | {
            followerCount?: number;
            followingCount?: number;
            isFollowing?: boolean;
            message?: string;
          }
        | null;

      if (!response.ok || !data) {
        throw new Error(data?.message || '팔로우를 처리하지 못했습니다.');
      }

      setResolvedFollowerCount(Number(data.followerCount ?? resolvedFollowerCount));
      setResolvedFollowingCount(Number(data.followingCount ?? resolvedFollowingCount));
      setIsFollowing(Boolean(data.isFollowing));
    } catch (error) {
      toaster.create({
        title: error instanceof Error ? error.message : '팔로우를 처리하지 못했습니다.',
        type: 'error',
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (variant === 'mobile') {
    return (
      <Box borderWidth="1px" borderColor="#E5E7EB" borderRadius="16px" bg="#FFFFFF" px="16px" py="16px">
        <Flex align="center" gap="12px" mb="14px">
          <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
            <Link href={`/user/community/author/${author.id}`}>
              <Image
                src={author.avatar}
                alt={displayName}
                boxSize="48px"
                rounded="full"
                objectFit="cover"
                cursor="pointer"
              />
            </Link>
          </ChakraLink>
          <Box minW="0" flex="1">
            <Flex align="center" gap="6px">
              <Text fontSize="14px" fontWeight="700" color="#111827" lineClamp="1">
                {displayName}
              </Text>
              <CheckBadgeIcon size={16} color="#11B3E9" />
            </Flex>
            {author.position ? (
              <Text mt="2px" fontSize="12px" color="#6B7280" lineClamp="1">
                {author.position}
              </Text>
            ) : null}
          </Box>
          {canFollow ? (
            <Button
              type="button"
              h="32px"
              px="12px"
              borderRadius="10px"
              bg={isFollowing ? '#F3F4F6' : '#111827'}
              color={isFollowing ? '#4B5563' : '#FFFFFF'}
              fontSize="12px"
              fontWeight="600"
              loading={isFollowLoading}
              _hover={{ bg: isFollowing ? '#E5E7EB' : '#1F2937' }}
              onClick={handleToggleFollow}
            >
              {resolvedFollowLabel}
            </Button>
          ) : null}
        </Flex>

        <Flex align="center" justify="center" gap="14px" fontSize="12px" color="#4B5563">
          <Flex align="center" gap="6px">
            <Text color="#6B7280">팔로워</Text>
            <Text fontWeight="700" color="#111827">
              {formattedFollowerCount}
            </Text>
          </Flex>
          <Box h="12px" w="1px" bg="#E5E7EB" />
          <Flex align="center" gap="6px">
            <Text color="#6B7280">팔로잉</Text>
            <Text fontWeight="700" color="#111827">
              {formattedFollowingCount}
            </Text>
          </Flex>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      borderRadius="20px"
      bg="#FFFFFF"
      boxShadow="0 12px 30px rgba(223, 223, 223, 0.9)"
      px="20px"
      py="18px"
    >
      <Text fontSize="14px" fontWeight="500" color="#6B7280" mb="14px">
        작성자 정보
      </Text>

      <Box h="1px" bg="#E5E7EB" mb="20px" />

      <Flex align="center" gap="14px" mb="22px">
        <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
          <Link href={`/user/community/author/${author.id}`}>
            <Image
              src={author.avatar}
              alt={displayName}
              boxSize="64px"
              rounded="full"
              objectFit="cover"
              cursor="pointer"
              flexShrink={0}
            />
          </Link>
        </ChakraLink>

        <Box minW="0" flex="1">
          <Flex align="center" gap="6px" mb="4px">
            <Text fontSize="18px" fontWeight="700" color="#111827" lineClamp="1">
              {displayName}
            </Text>
            <CheckBadgeIcon size={16} color="#11B3E9" />
          </Flex>
          <Text fontSize="14px" fontWeight="500" color="#6B7280" lineClamp="1">
            코마소프트
          </Text>
          {author.position ? (
            <Text mt="2px" fontSize="14px" color="#6B7280" lineClamp="1">
              {author.position}
            </Text>
          ) : null}
        </Box>
      </Flex>

      <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="16px" mb="20px">
        <Box textAlign="center">
          <Text fontSize="18px" fontWeight="700" color="#111827">
            {formattedFollowerCount}
          </Text>
          <Text mt="4px" fontSize="14px" color="#9CA3AF">
            팔로워
          </Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="18px" fontWeight="700" color="#111827">
            {formattedFollowingCount}
          </Text>
          <Text mt="4px" fontSize="14px" color="#9CA3AF">
            팔로잉
          </Text>
        </Box>
      </Grid>

      {canFollow ? (
        <Button
          type="button"
          w="100%"
          h="42px"
          borderRadius="12px"
          bg={isFollowing ? '#F3F4F6' : '#3F3F46'}
          color={isFollowing ? '#4B5563' : '#FFFFFF'}
          fontSize="14px"
          fontWeight="700"
          loading={isFollowLoading}
          _hover={{ bg: isFollowing ? '#E5E7EB' : '#27272A' }}
          onClick={handleToggleFollow}
        >
          {resolvedFollowLabel}
        </Button>
      ) : null}
    </Box>
  );
}

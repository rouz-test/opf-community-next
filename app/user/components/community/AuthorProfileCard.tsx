'use client';

import { Box, Button, Flex, Grid, Image, Link as ChakraLink, Text } from '@chakra-ui/react';
import Link from 'next/link';

export type AuthorProfileCardProps = {
  author: {
    id: string;
    name: string;
    nickname: string;
    avatar: string;
    position?: string;
  };
  displayMode?: 'real' | 'nickname';
  followerCount?: number;
  followingCount?: number;
  followLabel?: string;
  variant?: 'mobile' | 'sidebar';
};

export function AuthorProfileCard({
  author,
  displayMode = 'nickname',
  followerCount = 892,
  followingCount = 124,
  followLabel = '팔로우',
  variant = 'sidebar',
}: AuthorProfileCardProps) {
  const displayName = displayMode === 'real' ? author.name : author.nickname;

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
            <Text fontSize="14px" fontWeight="700" color="#111827" lineClamp="1">
              {displayName}
            </Text>
            {author.position ? (
              <Text mt="2px" fontSize="12px" color="#6B7280" lineClamp="1">
                {author.position}
              </Text>
            ) : null}
          </Box>
          <Button
            type="button"
            h="32px"
            px="12px"
            borderRadius="10px"
            bg="#111827"
            color="#FFFFFF"
            fontSize="12px"
            fontWeight="600"
            _hover={{ bg: '#1F2937' }}
          >
            {followLabel}
          </Button>
        </Flex>

        <Flex align="center" justify="center" gap="14px" fontSize="12px" color="#4B5563">
          <Flex align="center" gap="6px">
            <Text color="#6B7280">팔로워</Text>
            <Text fontWeight="700" color="#111827">
              {followerCount}
            </Text>
          </Flex>
          <Box h="12px" w="1px" bg="#E5E7EB" />
          <Flex align="center" gap="6px">
            <Text color="#6B7280">팔로잉</Text>
            <Text fontWeight="700" color="#111827">
              {followingCount}
            </Text>
          </Flex>
        </Flex>
      </Box>
    );
  }

  return (
    <Box borderWidth="1px" borderColor="#E5E7EB" borderRadius="18px" bg="#FFFFFF" px="20px" py="20px">
      <Flex align="center" gap="8px" mb="16px">
        <Text fontSize="18px">👤</Text>
        <Text fontSize="16px" fontWeight="700" color="#111827">
          작성자 정보
        </Text>
      </Flex>

      <Flex justify="center" mb="16px">
        <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
          <Link href={`/user/community/author/${author.id}`}>
            <Image
              src={author.avatar}
              alt={displayName}
              boxSize="80px"
              rounded="full"
              objectFit="cover"
              cursor="pointer"
            />
          </Link>
        </ChakraLink>
      </Flex>

      <Box textAlign="center" mb={author.position ? '16px' : '20px'}>
        <Text fontSize="16px" fontWeight="700" color="#111827">
          {displayName}
        </Text>
        {author.position ? (
          <Text mt="4px" fontSize="14px" color="#6B7280">
            {author.position}
          </Text>
        ) : null}
      </Box>

      <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="16px" borderY="1px solid" borderColor="#E5E7EB" py="16px" mb="16px">
        <Box textAlign="center">
          <Text fontSize="28px" fontWeight="700" color="#111827">
            {followerCount}
          </Text>
          <Text mt="2px" fontSize="11px" letterSpacing="0.08em" textTransform="uppercase" color="#6B7280">
            Followers
          </Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="28px" fontWeight="700" color="#111827">
            {followingCount}
          </Text>
          <Text mt="2px" fontSize="11px" letterSpacing="0.08em" textTransform="uppercase" color="#6B7280">
            Following
          </Text>
        </Box>
      </Grid>

      <Button
        type="button"
        w="100%"
        h="42px"
        borderRadius="12px"
        bg="#111827"
        color="#FFFFFF"
        fontSize="14px"
        fontWeight="600"
        _hover={{ bg: '#1F2937' }}
      >
        {followLabel}
      </Button>
    </Box>
  );
}

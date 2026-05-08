'use client';

import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react';
import { Heart, MessageSquare, TrendingUp } from 'lucide-react';

type PopularPost = {
  id: string | number;
  title: string;
  likes: number;
  commentCount?: number;
};

type PopularPostsWidgetProps = {
  popularPosts: PopularPost[];
};

export function PopularPostsWidget({ popularPosts }: PopularPostsWidgetProps) {
  return (
    <Box rounded="lg" borderWidth="1px" borderColor="gray.200" bg="white" p="4">
      <HStack mb="4" gap="2">
        <Icon as={TrendingUp} boxSize="4" color="orange.500" />
        <Heading as="h3" size="sm" color="gray.900">
          이번달 인기 게시글 TOP5
        </Heading>
      </HStack>

      <Flex direction="column" gap="3">
        {popularPosts.map((post, index) => (
          <Flex key={post.id} gap="3">
            <Flex
              h="6"
              w="6"
              flexShrink={0}
              align="center"
              justify="center"
              rounded="md"
              fontSize="sm"
              fontWeight="700"
              bg={
                index === 0
                  ? 'orange.500'
                  : index === 1
                    ? 'orange.100'
                    : index === 2
                      ? 'orange.50'
                      : 'transparent'
              }
              color={
                index === 0
                  ? 'white'
                  : index === 1 || index === 2
                    ? 'orange.600'
                    : 'gray.400'
              }
            >
              {index + 1}
            </Flex>

            <Box minW="0" flex="1">
              <Text
                lineClamp="2"
                fontSize="sm"
                fontWeight="500"
                color="gray.900"
                transition="color 0.2s"
                _hover={{ color: 'orange.500' }}
              >
                {post.title}
              </Text>
              <HStack mt="1.5" gap="3" fontSize="xs" color="gray.500">
                <HStack gap="1">
                  <Icon as={Heart} boxSize="3" />
                  {post.likes}
                </HStack>
                <HStack gap="1">
                  <Icon as={MessageSquare} boxSize="3" />
                  {post.commentCount ?? 0}
                </HStack>
              </HStack>
            </Box>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}

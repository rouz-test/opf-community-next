'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Flex, Grid, HStack, Icon, Image, Text } from '@chakra-ui/react';
import { Eye, Heart, MessageSquare } from 'lucide-react';
import { type CommunityPost } from '@/app/user/lib/community-content-data';

const chunkPosts = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

function HighlightPostCard({ post }: { post: CommunityPost }) {
  const router = useRouter();
  const isAnonymousPost = !post.isRealName && post.type !== 'notice';
  const authorName = isAnonymousPost ? '익명' : post.author.name;

  const handleAuthorAvatarClick = (event: React.MouseEvent) => {
    if (isAnonymousPost) return;
    event.preventDefault();
    event.stopPropagation();
    router.push(`/user/community/author/${post.author.id}`);
  };

  return (
    <Link href={`/user/community/post/${post.id}`}>
      <Box
        as="article"
        display="flex"
        h="200px"
        flexDirection="column"
        rounded="lg"
        borderWidth="2px"
        borderColor="orange.200"
        bgGradient="linear(to-br, orange.50, white)"
        p="4"
        transition="all 0.2s"
        _hover={{ borderColor: 'orange.300', boxShadow: 'md' }}
      >
        <HStack mb="2" gap="2">
          <Flex rounded="full" bg="orange.500" px="2.5" py="1" fontSize="xs" fontWeight="700" color="white">
            {post.type === 'notice' ? '공지' : '추천'}
          </Flex>
        </HStack>

        <Text mb="2" lineClamp="2" fontSize="sm" fontWeight="700" color="gray.900" transition="color 0.2s" _groupHover={{ color: 'orange.600' }}>
          {post.title}
        </Text>
        <Text mb="3" lineClamp="3" flex="1" fontSize="xs" lineHeight="6" color="gray.600">
          {post.content}
        </Text>

        <Flex mt="auto" align="center" justify="space-between" fontSize="xs" color="gray.500">
          <Button
            type="button"
            onClick={handleAuthorAvatarClick}
            gap="2"
            minW="auto"
            h="auto"
            bg="transparent"
            p="0"
            fontWeight="500"
            color="inherit"
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
            <Text>{authorName}</Text>
          </Button>

          <HStack gap="3">
            <HStack gap="1">
              <Icon as={Eye} boxSize="3.5" />
              <Text>{post.views}</Text>
            </HStack>
            <HStack gap="1">
              <Icon as={Heart} boxSize="3.5" />
              <Text>{post.likes}</Text>
            </HStack>
            <HStack gap="1">
              <Icon as={MessageSquare} boxSize="3.5" />
              <Text>{post.commentCount ?? 0}</Text>
            </HStack>
          </HStack>
        </Flex>
      </Box>
    </Link>
  );
}

export function HighlightCarousel({ posts }: { posts: CommunityPost[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [slidesPerPage, setSlidesPerPage] = useState(2);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const swipeThreshold = 50;

  useEffect(() => {
    const updateSlidesPerPage = () => {
      if (window.innerWidth < 768) setSlidesPerPage(1);
      else setSlidesPerPage(2);
    };
    updateSlidesPerPage();
    window.addEventListener('resize', updateSlidesPerPage);
    return () => window.removeEventListener('resize', updateSlidesPerPage);
  }, []);

  const pages = useMemo(() => chunkPosts(posts, slidesPerPage), [posts, slidesPerPage]);
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
    <Box position="relative" overflow="hidden">
      <Flex
        touchAction="pan-y"
        transition="transform 0.5s ease-out"
        transform={`translateX(-${safeCurrentPage * 100}%)`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pages.map((pagePosts, pageIndex) => (
          <Box key={pageIndex} w="full" flexShrink={0}>
            <Grid gap="4" templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}>
              {pagePosts.map((post) => (
                <HighlightPostCard key={post.id} post={post} />
              ))}
            </Grid>
          </Box>
        ))}
      </Flex>

      {pages.length > 1 ? (
        <Flex mt="4" align="center" justify="center" gap="2">
          {pages.map((_, pageIndex) => (
            <Button
              key={pageIndex}
              type="button"
              onClick={() => setCurrentPage(pageIndex)}
              h="2.5"
              minW={safeCurrentPage === pageIndex ? '8' : '2.5'}
              rounded="full"
              bg={safeCurrentPage === pageIndex ? 'orange.500' : 'gray.300'}
              p="0"
              transition="all 0.2s"
              _hover={{ bg: safeCurrentPage === pageIndex ? 'orange.500' : 'gray.400' }}
              aria-label={`${pageIndex + 1}번 하이라이트로 이동`}
            />
          ))}
        </Flex>
      ) : null}
    </Box>
  );
}

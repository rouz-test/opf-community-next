'use client';

import Link from 'next/link';
import { Box, Flex, HStack, Icon, Image, Text } from '@chakra-ui/react';
import { BadgeCheck, Bookmark, Heart, MessageSquare, Share2 } from 'lucide-react';

import AdminTagBadge from '@/app/admin/components/ui/tag/tag-badge';
import { extractTextFromContentBody } from '@/lib/blocked-word-validator';
import { resolveTags } from '@/lib/tags';
import tagsData from '@/data/mock/tags.json';
import type { CommunityContent } from '@/types/community-content';
import type { Tag } from '@/types/tag';

const tags = tagsData as Tag[];
const DEFAULT_REAL_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';

export type AdminCommunityPostCardData = {
  content: CommunityContent;
  commentPreview?: {
    content: string;
    createdAt: string;
  };
};

type AdminCommunityPostCardProps = {
  item: AdminCommunityPostCardData;
  formatDate: (dateString?: string) => string;
};

function getAuthorName(content: CommunityContent) {
  if (content.author.visibility === 'anonymous') return '익명';
  return content.author.displayName || content.author.identifierValue || content.author.id;
}

function getAuthorMeta(content: CommunityContent, formatDate: (dateString?: string) => string) {
  if (content.author.visibility === 'anonymous') return formatDate(content.createdAt);

  const role = content.author.type === 'admin' ? '커뮤니티 관리자' : '회원';
  return `코마소프트 · ${role} · ${formatDate(content.createdAt)}`;
}

function getContentText(content: CommunityContent) {
  return extractTextFromContentBody(content.content).trim();
}

function getContentImages(content: CommunityContent) {
  const images: string[] = [];

  const visit = (node: CommunityContent['content']) => {
    if (node.type === 'image' && typeof node.attrs?.src === 'string') {
      images.push(node.attrs.src);
    }

    node.content?.forEach(visit);
  };

  visit(content.content);
  return images;
}

function getResolvedTags(content: CommunityContent) {
  return resolveTags(content.tagIds, tags);
}

function InteractionBar({ content }: { content: CommunityContent }) {
  const isLiked = Boolean(content.viewerState?.isLikedByMe);
  const isSaved = Boolean(content.viewerState?.isSavedByMe);
  const commentCount = content.stats.commentCount + content.stats.replyCount;

  return (
    <Flex py="1" align="center" justify="space-between" color="gray.500">
      <HStack gap="4">
        <HStack gap="1.5" color={isLiked ? 'orange.500' : 'gray.500'}>
          <Icon as={Heart} boxSize="20px" fill={isLiked ? 'currentColor' : 'none'} />
          <Text fontSize="14px">{content.stats.likeCount}</Text>
        </HStack>
        <HStack gap="1.5">
          <Icon as={MessageSquare} boxSize="20px" />
          <Text fontSize="14px">{commentCount}</Text>
        </HStack>
      </HStack>

      <HStack gap="4">
        <Icon as={Share2} boxSize="20px" />
        <Icon as={Bookmark} boxSize="20px" color={isSaved ? 'orange.500' : 'gray.500'} fill={isSaved ? 'currentColor' : 'none'} />
      </HStack>
    </Flex>
  );
}

function CommentPreview({ item }: { item: AdminCommunityPostCardData }) {
  if (!item.commentPreview) return null;

  return (
    <Box mt="4" rounded="20px" borderWidth="1px" borderColor="orange.200" bg="orange.50" px="5" py="4">
      <Text mb="1.5" fontSize="12px" fontWeight="700" color="#C2410C">
        작성 댓글
      </Text>
      <Text lineClamp={3} fontSize="14px" lineHeight="1.65" color="gray.600">
        {item.commentPreview.content}
      </Text>
    </Box>
  );
}

function GridImages({ images }: { images: string[] }) {
  const visibleImages = images.slice(0, 2);
  const remainingImageCount = Math.max(images.length - 2, 0);

  if (visibleImages.length === 0) return null;

  return (
    <Box mb="3" display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap="2">
      {visibleImages.map((image, index) => (
        <Box key={`${image}-${index}`} position="relative" aspectRatio="16 / 9" overflow="hidden" rounded="lg">
          <Image src={image} alt={`post-${index}`} h="full" w="full" objectFit="cover" />
          {index === 1 && remainingImageCount > 0 ? (
            <Flex position="absolute" inset="0" align="center" justify="center" bg="blackAlpha.600" fontSize="2xl" fontWeight="700" color="white">
              +{remainingImageCount}
            </Flex>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}

export function AdminCommunityFeedPostCard({ item, formatDate }: AdminCommunityPostCardProps) {
  const content = item.content;
  const isAnonymousPost = content.author.visibility === 'anonymous';
  const authorName = getAuthorName(content);
  const resolvedTags = getResolvedTags(content);
  const images = getContentImages(content);

  return (
    <Box
      as="article"
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
      <Link href={`/admin/community/content/${content.id}`}>
        <Box display="block" px="5" pb="4" pt="5">
          <Flex mb="5" h="40px" align="center" justify="space-between" gap="3">
            <Flex align="center" gap="2" minW="0">
              {!isAnonymousPost ? (
                <Image src={DEFAULT_REAL_AVATAR} alt={authorName} h="6" w="6" rounded="full" objectFit="cover" />
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
                  {!isAnonymousPost ? <Icon as={BadgeCheck} boxSize="5" color="cyan.400" /> : null}
                </Flex>
                <Text mt="2px" fontSize="12px" color="gray.500" lineHeight="12px">
                  {getAuthorMeta(content, formatDate)}
                </Text>
              </Box>
            </Flex>
          </Flex>

          {resolvedTags.length > 0 ? (
            <HStack mb="3" flexWrap="wrap" gap="2">
              {resolvedTags.map((tag) => (
                <AdminTagBadge key={tag.id} tag={tag} />
              ))}
            </HStack>
          ) : null}

          <Flex mb="3" align="center" gap="2" wrap="wrap">
            {content.flags.isPromoted ? (
              <Flex align="center" justify="center" h="20px" borderRadius="10px" bg="#7C3AED" px="10px" fontSize="11px" fontWeight="600" color="white">
                홍보
              </Flex>
            ) : null}
            <Text fontSize="16px" fontWeight="700" color="gray.900">
              {content.title}
            </Text>
          </Flex>

          <Text mb="4" fontSize="14px" lineHeight="1.65" color="gray.700" lineClamp={3}>
            {getContentText(content) || '본문 내용이 없습니다.'}
          </Text>

          <GridImages images={images} />
        </Box>
      </Link>

      <Box px="5" pb="5">
        <InteractionBar content={content} />
        <CommentPreview item={item} />
      </Box>
    </Box>
  );
}

export function AdminCommunityBoardPostRow({ item, formatDate }: AdminCommunityPostCardProps) {
  const content = item.content;
  const isAnonymousPost = content.author.visibility === 'anonymous';
  const authorName = getAuthorName(content);
  const resolvedTags = getResolvedTags(content);
  const commentCount = content.stats.commentCount + content.stats.replyCount;
  const isLiked = Boolean(content.viewerState?.isLikedByMe);
  const isSaved = Boolean(content.viewerState?.isSavedByMe);

  return (
    <Link href={`/admin/community/content/${content.id}`}>
      <Box
        as="article"
        position="relative"
        overflow="visible"
        rounded="3xl"
        bg="white"
        boxShadow="0 12px 30px rgba(223, 223, 223, 0.9)"
        transition="transform 0.2s, box-shadow 0.2s"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 16px 36px rgba(223, 223, 223, 0.98)',
        }}
      >
        <Flex direction="column" gap="4" px="5" py="5">
          <Flex align="flex-start" justify="space-between" gap="4">
            <Box minW="0" flex="1">
              <Text lineClamp={2} fontSize="16px" fontWeight="700" color="gray.900">
                {content.title}
              </Text>
            </Box>
          </Flex>

          <Flex align="center" justify="space-between" gap="4">
            <HStack minW="0" flex="1" gap="2" flexWrap="wrap">
              {resolvedTags.length > 0 ? (
                <HStack gap="2" flexShrink={0}>
                  {resolvedTags.slice(0, 1).map((tag) => (
                    <AdminTagBadge key={tag.id} tag={tag} />
                  ))}
                  {resolvedTags.length > 1 ? (
                    <Flex align="center" justify="center" h="20px" minW="34px" borderRadius="10px" bg="gray.200" px="8px" fontSize="11px" fontWeight="600" color="gray.600">
                      +{resolvedTags.length - 1}
                    </Flex>
                  ) : null}
                </HStack>
              ) : null}

              <HStack gap="2">
                <Text fontSize="14px" fontWeight="700" color="gray.900" lineHeight="14px">
                  {authorName}
                </Text>
                {!isAnonymousPost ? <Icon as={BadgeCheck} boxSize="5" color="cyan.400" /> : null}
                <Text fontSize="12px" color="gray.500" lineHeight="14px" whiteSpace="nowrap">
                  {formatDate(content.createdAt)}
                </Text>
              </HStack>
            </HStack>

            <HStack gap="4" color="gray.500" flexShrink={0}>
              <HStack gap="1.5" color={isLiked ? 'orange.500' : 'gray.500'}>
                <Icon as={Heart} boxSize="20px" fill={isLiked ? 'currentColor' : 'none'} />
                <Text fontSize="14px">{content.stats.likeCount}</Text>
              </HStack>
              <HStack gap="1.5">
                <Icon as={MessageSquare} boxSize="20px" />
                <Text fontSize="14px">{commentCount}</Text>
              </HStack>
              <Icon as={Share2} boxSize="20px" />
              <Icon as={Bookmark} boxSize="20px" color={isSaved ? 'orange.500' : 'gray.500'} fill={isSaved ? 'currentColor' : 'none'} />
            </HStack>
          </Flex>

          {item.commentPreview ? (
            <Box borderRadius="12px" bg="#FFF7ED" px="12px" py="10px">
              <Text fontSize="12px" fontWeight="700" color="#C2410C">
                작성 댓글
              </Text>
              <Text mt="4px" fontSize="13px" color="#4B5563" lineClamp={2}>
                {item.commentPreview.content}
              </Text>
            </Box>
          ) : null}
        </Flex>
      </Box>
    </Link>
  );
}

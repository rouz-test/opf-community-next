'use client';

import { Box, Button, Flex, Image, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Eye, Heart, MessageSquare, Bookmark, Megaphone } from 'lucide-react';

import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import AdminTagBadge from '@/app/admin/components/ui/tag/tag-badge';
import contentsData from '@/data/mock/contents.json';
import tagsData from '@/data/mock/tags.json';
import usersData from '@/data/mock/users.json';
import { resolveTags } from '@/lib/tags';
import type { Content, TiptapNode } from '@/types/content';
import type { Tag } from '@/types/tag';
import type { User } from '@/types/user';

const contents = contentsData as Content[];
const tags = tagsData as Tag[];
const users = usersData as User[];

const userMap = new Map(users.map((user) => [user.id, user]));

function extractTextFromTiptapNodes(nodes?: TiptapNode[]): string {
  if (!nodes?.length) return '';

  return nodes
    .map((node) => {
      const currentText = node.text ?? '';
      const childText = extractTextFromTiptapNodes(node.content);
      return [currentText, childText].filter(Boolean).join(' ');
    })
    .filter(Boolean)
    .join(' ')
    .trim();
}

function getAuthorDisplay(content: Content) {
  const author = userMap.get(content.authorId);

  if (!author) {
    return content.authorId;
  }

  return content.isAnonymous ? author.profile.email : author.profile.name;
}

function getAuthorRealName(content: Content) {
  const author = userMap.get(content.authorId);
  return author?.profile.name ?? content.authorId;
}

function getAuthorInitial(content: Content) {
  const author = userMap.get(content.authorId);
  const base = content.isAnonymous ? author?.profile.email ?? content.authorId : author?.profile.name ?? content.authorId;
  return base.slice(0, 1).toUpperCase();
}

function getPublishedAtDisplay(content: Content) {
  if (!content.timestamps.publishedAt) return '-';

  const publishedAt = new Date(content.timestamps.publishedAt);
  if (Number.isNaN(publishedAt.getTime())) return '-';

  return publishedAt.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusLabel(content: Content) {
  if (content.publicationStatus === 'draft') return '임시';
  if (content.publicationStatus === 'archived') return '보관';
  if (content.flags.isNotice) return '공지';
  if (content.flags.isPinned) return '고정';
  return '노출';
}

function getNodeText(node?: TiptapNode): string {
  if (!node) return '';

  const currentText = node.text ?? '';
  const childText = extractTextFromTiptapNodes(node.content);

  return [currentText, childText].filter(Boolean).join(' ').trim();
}

function renderBodyNode(node: TiptapNode, index: number) {
  if (node.type === 'paragraph') {
    const paragraphText = extractTextFromTiptapNodes(node.content);

    if (!paragraphText) {
      return null;
    }

    return (
      <Text key={`paragraph-${index}`} fontSize="15px" lineHeight="1.95" color="#374151" whiteSpace="pre-wrap">
        {paragraphText}
      </Text>
    );
  }

  if (node.type === 'image') {
    const imageSrc = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
    const imageAlt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '콘텐츠 이미지';

    if (!imageSrc) {
      return null;
    }

    return (
      <Box
        key={`image-${index}`}
        overflow="hidden"
        borderRadius="12px"
        bg="#F3F4F6"
        borderWidth="1px"
        borderColor="#E5E7EB"
      >
        <Image src={imageSrc} alt={imageAlt} w="100%" maxH="520px" objectFit="cover" />
      </Box>
    );
  }

  if (node.type === 'heading') {
    const headingText = getNodeText(node);

    if (!headingText) {
      return null;
    }

    return (
      <Text key={`heading-${index}`} fontSize="21px" fontWeight="700" lineHeight="1.6" color="#111827">
        {headingText}
      </Text>
    );
  }

  if (node.type === 'bulletList') {
    const items = node.content ?? [];
    const texts = items
      .map((item) => extractTextFromTiptapNodes(item.content))
      .filter(Boolean);

    if (texts.length === 0) {
      return null;
    }

    return (
      <Flex key={`bullet-list-${index}`} direction="column" gap="10px">
        {texts.map((text, itemIndex) => (
          <Flex key={`bullet-item-${index}-${itemIndex}`} align="flex-start" gap="8px">
            <Text mt="2px" fontSize="14px" color="#F59E42">
              •
            </Text>
            <Text fontSize="15px" lineHeight="1.9" color="#374151">
              {text}
            </Text>
          </Flex>
        ))}
      </Flex>
    );
  }

  return null;
}

export default function CommunityContentDetailPage() {
  const params = useParams<{ id: string }>();
  const contentId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const content = contents.find((item) => item.id === contentId);

  if (!content) {
    return (
      <PageContainer>
        <PageHeader
          left={
            <Flex direction="column" gap="6px">
              <Text fontSize="20px" fontWeight="700" color="#111827">
                콘텐츠 상세
              </Text>
              <Text fontSize="13px" color="#9CA3AF">
                요청하신 콘텐츠를 찾을 수 없습니다.
              </Text>
            </Flex>
          }
          right={null}
        />

        <Box borderWidth="1px" borderColor="#E5E7EB" borderRadius="16px" bg="#FFFFFF" px="24px" py="32px">
          <Text fontSize="14px" color="#6B7280">
            존재하지 않거나 삭제된 콘텐츠입니다.
          </Text>
        </Box>
      </PageContainer>
    );
  }

  const resolvedTags = resolveTags(content.tagIds, tags);
  const authorDisplay = getAuthorDisplay(content);
  const authorRealName = getAuthorRealName(content);
  const authorInitial = getAuthorInitial(content);
  const publishedAtDisplay = getPublishedAtDisplay(content);
  const statusLabel = getStatusLabel(content);

  return (
    <PageContainer>
      <PageHeader left={null} right={null} />

      <Flex direction="column" gap="16px" maxW="920px">
        <Box overflow="hidden" borderWidth="1px" borderColor="#E5E7EB" borderRadius="18px" bg="#FFFFFF" px="24px" py="20px">
          <Flex align="center" justify="space-between" mb="10px">
            <Button
              asChild
              variant="ghost"
              size="sm"
              px="8px"
              color="#6B7280"
              _hover={{ bg: '#F9FAFB', color: '#111827' }}
            >
              <Link href="/admin/community/content">
                <Flex align="center" gap="6px">
                  <ArrowLeft size={16} />
                  <Text as="span" fontSize="13px" fontWeight="600">
                    목록으로
                  </Text>
                </Flex>
              </Link>
            </Button>

            <Flex align="center" gap="8px">
              {content.flags.isPromoted ? (
                <Flex
                  align="center"
                  gap="5px"
                  px="10px"
                  py="4px"
                  borderRadius="9999px"
                  bg="#FEF2F2"
                  color="#DC2626"
                >
                  <Megaphone size={14} />
                  <Text fontSize="12px" fontWeight="700">
                    홍보
                  </Text>
                </Flex>
              ) : null}
              <Box px="10px" py="4px" borderRadius="9999px" bg="#F3F4F6">
                <Text fontSize="12px" fontWeight="700" color="#374151">
                  {statusLabel}
                </Text>
              </Box>
            </Flex>
          </Flex>

          <Text fontSize="28px" fontWeight="700" lineHeight="1.45" color="#111827" mb="14px">
            {content.title}
          </Text>

          {resolvedTags.length > 0 ? (
            <Flex wrap="wrap" gap="8px" mb="16px">
              {resolvedTags.map((tag) => (
                <AdminTagBadge key={tag.id} tag={tag} />
              ))}
            </Flex>
          ) : null}

          <Flex align="center" gap="12px" borderBottom="1px solid" borderColor="#E5E7EB" pb="18px">
            <Flex
              align="center"
              justify="center"
              w="44px"
              h="44px"
              borderRadius="9999px"
              bg="#F3F4F6"
              color="#6B7280"
              fontSize="16px"
              fontWeight="700"
              flexShrink={0}
            >
              {authorInitial}
            </Flex>

            <Box minW="0">
              <Flex align="center" gap="6px">
                <Text fontSize="14px" fontWeight="700" color="#111827" lineClamp="1">
                  {authorDisplay}
                </Text>
                {!content.isAnonymous ? <BadgeCheck size={16} color="#3B82F6" /> : null}
              </Flex>
              <Text mt="2px" fontSize="13px" color="#6B7280">
                {content.isAnonymous ? `관리자 식별명 · ${authorRealName}` : '실명 프로필'} · {publishedAtDisplay}
              </Text>
            </Box>
          </Flex>

          <Flex direction="column" gap="18px" mt="22px">
            {content.body.content?.length ? (
              content.body.content.map((node, index) => renderBodyNode(node, index))
            ) : (
              <Text fontSize="14px" lineHeight="1.8" color="#6B7280">
                본문 내용이 없습니다.
              </Text>
            )}
          </Flex>

          <Flex align="center" justify="space-between" borderTop="1px solid" borderColor="#E5E7EB" mt="24px" pt="16px">
            <Flex align="center" gap="18px" color="#6B7280">
              <Flex align="center" gap="6px">
                <Eye size={16} />
                <Text fontSize="13px" fontWeight="600">{content.stats.viewCount}</Text>
              </Flex>
              <Flex align="center" gap="6px">
                <Heart size={16} />
                <Text fontSize="13px" fontWeight="600">{content.stats.likeCount}</Text>
              </Flex>
              <Flex align="center" gap="6px">
                <MessageSquare size={16} />
                <Text fontSize="13px" fontWeight="600">{content.stats.commentCount + content.stats.replyCount}</Text>
              </Flex>
              <Flex align="center" gap="6px">
                <Bookmark size={16} />
                <Text fontSize="13px" fontWeight="600">{content.stats.saveCount}</Text>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </PageContainer>
  );
}
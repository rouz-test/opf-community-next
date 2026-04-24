'use client';

import { Box, Button, Flex, Image, Link as ChakraLink, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Bookmark, Eye, Heart, Megaphone, MessageSquare } from 'lucide-react';
import { Fragment, useEffect, useState, type CSSProperties, type ReactNode } from 'react';

import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import BaseModal from '@/app/admin/components/modal/base-modal';
import AdminButton from '@/app/admin/components/ui/button';
import AdminTagBadge from '@/app/admin/components/ui/tag/tag-badge';
import tagsData from '@/data/mock/tags.json';
import { resolveTags } from '@/lib/tags';
import type { CommunityContent, CommunityContentBody } from '@/types/community-content';
import type { Tag } from '@/types/tag';
import ContentActionMenu from '@/app/admin/components/content-action-menu';

// ==============================
// 상수 및 기본 설정
// ==============================

const tags = tagsData as Tag[];
const DEFAULT_BODY_TEXT_COLOR = '#374151';
const DEFAULT_BLOCKQUOTE_TEXT_COLOR = '#111827';


// ==============================
// Tiptap 텍스트 스타일 처리
// ==============================

function normalizeFontFamily(fontFamily: string) {
  if (fontFamily === 'mono') return 'monospace';
  return fontFamily;
}

function getTextNodeStyles(node: CommunityContentBody) {
  const styles: CSSProperties = {};
  const textDecorations = new Set<string>();

  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') styles.fontWeight = 700;
    if (mark.type === 'italic') styles.fontStyle = 'italic';
    if (mark.type === 'underline') textDecorations.add('underline');
    if (mark.type === 'strike') textDecorations.add('line-through');
    if (mark.type === 'textStyle' && typeof mark.attrs?.color === 'string') {
      styles.color = mark.attrs.color;
    }
    if (mark.type === 'textStyle' && typeof mark.attrs?.fontFamily === 'string') {
      styles.fontFamily = normalizeFontFamily(mark.attrs.fontFamily);
    }
    if (mark.type === 'textStyle' && typeof mark.attrs?.fontSize === 'string') {
      styles.fontSize = mark.attrs.fontSize;
    }
    if (mark.type === 'textStyle' && typeof mark.attrs?.lineHeight === 'string') {
      styles.lineHeight = mark.attrs.lineHeight;
    }
    if (mark.type === 'highlight' && typeof mark.attrs?.color === 'string') {
      styles.backgroundColor = mark.attrs.color;
      styles.borderRadius = '4px';
      styles.paddingInline = '2px';
    }
  }

  if (textDecorations.size > 0) {
    styles.textDecoration = Array.from(textDecorations).join(' ');
  }

  return styles;
}


// ==============================
// 이미지 및 미디어 처리
// ==============================

function getYoutubeEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.replace('/', '');
      if (!videoId) return '';
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (parsedUrl.pathname === '/watch') {
        const videoId = parsedUrl.searchParams.get('v');
        if (!videoId) return '';
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsedUrl.pathname.startsWith('/embed/')) {
        return url;
      }

      if (parsedUrl.pathname.startsWith('/shorts/')) {
        const videoId = parsedUrl.pathname.split('/')[2];
        if (!videoId) return '';
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
  } catch {
    return '';
  }

  return '';
}

function getImageWidth(node: CommunityContentBody) {
  return typeof node.attrs?.width === 'string' ? node.attrs.width : '100%';
}

function getImageAlignment(node: CommunityContentBody) {
  const align = typeof node.attrs?.align === 'string' ? node.attrs.align : 'left';

  if (align === 'center') {
    return { ml: 'auto', mr: 'auto' } as const;
  }

  if (align === 'right') {
    return { ml: 'auto', mr: '0' } as const;
  }

  return { ml: '0', mr: 'auto' } as const;
}


// ==============================
// 인용문 렌더링 스타일 처리
// ==============================

function getQuoteStyle(node: CommunityContentBody) {
  return typeof node.attrs?.quoteStyle === 'string' ? node.attrs.quoteStyle : 'line';
}

function getQuoteContainerStyles(node: CommunityContentBody) {
  const quoteStyle = getQuoteStyle(node);

  if (quoteStyle === 'quote') {
    return {
      textAlign: 'center' as const,
      px: '24px',
      py: '28px',
      _before: {
        content: '"❝"',
        display: 'block',
        fontSize: '48px',
        fontWeight: '700',
        lineHeight: '1',
        mb: '8px',
      },
      _after: {
        content: '"❞"',
        display: 'block',
        fontSize: '48px',
        fontWeight: '700',
        lineHeight: '1',
        mt: '8px',
      },
    };
  }

  if (quoteStyle === 'frame') {
    return {
      borderWidth: '1px',
      borderColor: '#D1D5DB',
      borderRadius: '12px',
      px: '18px',
      py: '14px',
    };
  }

  return {
    borderLeft: '4px solid',
    borderColor: '#D1D5DB',
    pl: '12px',
  };
}

// ==============================
// 콘텐츠 메타 정보 표시 헬퍼
// ==============================

function getAuthorDisplay(content: CommunityContent) {
  if (content.author.visibility === 'anonymous') {
    return content.author.displayName || '익명';
  }

  return content.author.displayName || content.author.identifierValue || content.author.id;
}

function getAuthorRealName(content: CommunityContent) {
  return content.author.identifierValue || content.author.id;
}

function getAuthorInitial(content: CommunityContent) {
  const base =
    content.author.visibility === 'anonymous'
      ? content.author.identifierValue || content.author.id
      : content.author.displayName || content.author.identifierValue || content.author.id;

  return base.slice(0, 1).toUpperCase();
}

function getPublishedAtDisplay(content: CommunityContent) {
  if (!content.publishedAt) return '-';

  const publishedAt = new Date(content.publishedAt);
  if (Number.isNaN(publishedAt.getTime())) return '-';

  return publishedAt.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusLabel(content: CommunityContent) {
  if (content.status === 'draft') return '임시';
  if (content.status === 'archived') return '보관';
  if (content.flags.isNotice) return '공지';
  if (content.flags.isPinned) return '고정';
  return '노출';
}

function getStatusBadgeStyle(content: CommunityContent) {
  if (content.status === 'draft') {
    return { bg: '#FEF3C7', color: '#92400E' };
  }

  if (content.status === 'archived') {
    return { bg: '#F3F4F6', color: '#6B7280' };
  }

  return { bg: '#ECFDF5', color: '#047857' };
}

// ==============================
// Tiptap 인라인 노드 렌더링
// ==============================

function renderInlineContent(nodes?: CommunityContentBody[], keyPrefix = 'inline'): ReactNode {
  if (!nodes?.length) return null;

  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    if (node.type === 'text') {
      const text = node.text ?? '';
      const linkMark = node.marks?.find((mark) => mark.type === 'link');
      const textStyles = getTextNodeStyles(node);

      if (!text) {
        return null;
      }

      if (typeof linkMark?.attrs?.href === 'string' && linkMark.attrs.href) {
        return (
          <ChakraLink
            key={key}
            href={linkMark.attrs.href}
            color="#2563EB"
            textDecoration="underline"
            target="_blank"
            rel="noopener noreferrer"
            style={textStyles}
          >
            {text}
          </ChakraLink>
        );
      }

      return (
        <Text key={key} as="span" style={textStyles}>
          {text}
        </Text>
      );
    }

    if (node.type === 'hardBreak') {
      return <br key={key} />;
    }

    if (node.content?.length) {
      return <Fragment key={key}>{renderInlineContent(node.content, key)}</Fragment>;
    }

    return null;
  });
}

// ==============================
// Tiptap 블록 노드 공통 헬퍼
// ==============================

function getBlockAlignment(node: CommunityContentBody) {
  return typeof node.attrs?.textAlign === 'string' ? node.attrs.textAlign : 'left';
}

function getBlockLineHeight(node: CommunityContentBody, fallback: string) {
  return typeof node.attrs?.lineHeight === 'string' ? node.attrs.lineHeight : fallback;
}

function getListItemBlockNode(node: CommunityContentBody) {
  return node.content?.find((child) => child.type === 'paragraph' || child.type === 'heading') ?? null;
}

function getListItemAlignment(node: CommunityContentBody) {
  const blockNode = getListItemBlockNode(node);
  return blockNode ? getBlockAlignment(blockNode) : 'left';
}

function getListItemLineHeight(node: CommunityContentBody) {
  const blockNode = getListItemBlockNode(node);
  return blockNode ? getBlockLineHeight(blockNode, '1.9') : '1.9';
}

// ==============================
// Tiptap 블록 노드 렌더링
// ==============================

function renderBodyNode(node: CommunityContentBody, index: number) {
  if (node.type === 'paragraph') {
    if (!node.content?.length) {
      return null;
    }

    return (
      <Text
        key={`paragraph-${index}`}
        fontSize="15px"
        lineHeight={getBlockLineHeight(node, '1.95')}
        color={DEFAULT_BODY_TEXT_COLOR}
        whiteSpace="pre-wrap"
        textAlign={getBlockAlignment(node)}
      >
        {renderInlineContent(node.content, `paragraph-${index}`)}
      </Text>
    );
  }

  if (node.type === 'image') {
    const imageSrc = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
    const imageAlt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '콘텐츠 이미지';
    const imageWidth = getImageWidth(node);
    const imageAlignment = getImageAlignment(node);

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
        w={imageWidth}
        maxW="100%"
        {...imageAlignment}
      >
        <Image src={imageSrc} alt={imageAlt} w="100%" maxH="520px" objectFit="contain" />
      </Box>
    );
  }

  if (node.type === 'heading') {
    if (!node.content?.length) {
      return null;
    }

    return (
      <Text
        key={`heading-${index}`}
        fontSize="21px"
        fontWeight="700"
        lineHeight={getBlockLineHeight(node, '1.6')}
        color="#111827"
        textAlign={getBlockAlignment(node)}
      >
        {renderInlineContent(node.content, `heading-${index}`)}
      </Text>
    );
  }

  if (node.type === 'bulletList') {
    const items = node.content ?? [];

    if (items.length === 0) {
      return null;
    }

    return (
      <Flex key={`bullet-list-${index}`} direction="column" gap="10px">
        {items.map((item, itemIndex) => (
          <Box key={`bullet-item-${index}-${itemIndex}`} asChild color={DEFAULT_BODY_TEXT_COLOR}>
            <ul
              style={{
                paddingLeft: '24px',
                margin: '0',
                listStyleType: 'disc',
              }}
            >
              <li>
            <Text
              fontSize="15px"
              lineHeight={getListItemLineHeight(item)}
              color="inherit"
              textAlign={getListItemAlignment(item)}
            >
              {renderInlineContent(item.content, `bullet-item-${index}-${itemIndex}`)}
            </Text>
              </li>
            </ul>
          </Box>
        ))}
      </Flex>
    );
  }

  if (node.type === 'orderedList') {
    const items = node.content ?? [];

    if (items.length === 0) {
      return null;
    }

    return (
      <Flex key={`ordered-list-${index}`} direction="column" gap="10px">
        {items.map((item, itemIndex) => (
          <Box key={`ordered-item-${index}-${itemIndex}`} asChild color={DEFAULT_BODY_TEXT_COLOR}>
            <ol
              start={itemIndex + 1}
              style={{
                paddingLeft: '28px',
                margin: '0',
                listStyleType: 'decimal',
              }}
            >
              <li>
            <Text
              fontSize="15px"
              lineHeight={getListItemLineHeight(item)}
              color="inherit"
              textAlign={getListItemAlignment(item)}
            >
              {renderInlineContent(item.content, `ordered-item-${index}-${itemIndex}`)}
            </Text>
              </li>
            </ol>
          </Box>
        ))}
      </Flex>
    );
  }

  if (node.type === 'blockquote') {
    if (!node.content?.length) {
      return null;
    }

    return (
      <Box
        key={`blockquote-${index}`}
        {...getQuoteContainerStyles(node)}
      >
        <Text
          fontSize="15px"
          lineHeight={getBlockLineHeight(node, '1.95')}
          color={DEFAULT_BLOCKQUOTE_TEXT_COLOR}
          whiteSpace="pre-wrap"
          textAlign={getQuoteStyle(node) === 'quote' ? 'center' : getBlockAlignment(node)}
        >
          {renderInlineContent(node.content, `blockquote-${index}`)}
        </Text>
      </Box>
    );
  }

  if (node.type === 'youtube') {
    const rawSrc = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
    const src = getYoutubeEmbedUrl(rawSrc);
    const width = typeof node.attrs?.width === 'number' ? node.attrs.width : 640;
    const height = typeof node.attrs?.height === 'number' ? node.attrs.height : 360;

    if (!src) {
      return (
        <Box
          key={`youtube-${index}`}
          borderWidth="1px"
          borderColor="#E5E7EB"
          borderRadius="16px"
          px="20px"
          py="18px"
          bg="#F9FAFB"
        >
          <Text fontSize="14px" color="#6B7280">
            유튜브 링크를 임베드 형식으로 변환하지 못했습니다.
          </Text>
          {rawSrc ? (
            <ChakraLink href={rawSrc} target="_blank" rel="noopener noreferrer" color="#2563EB" textDecoration="underline">
              {rawSrc}
            </ChakraLink>
          ) : null}
        </Box>
      );
    }

    return (
      <Box
        key={`youtube-${index}`}
        borderRadius="16px"
        overflow="hidden"
        borderWidth="1px"
        borderColor="#E5E7EB"
        bg="#111827"
      >
        <Box
          asChild
          display="block"
          lineHeight="0"
        >
          <iframe
          src={src}
          title={`youtube-${index}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            display: 'block',
            width: '100%',
            maxWidth: `${width}px`,
            height: `${height}px`,
            margin: '0 auto',
            border: 'none',
          }}
          />
        </Box>
      </Box>
    );
  }

  return null;
}

// ==============================
// 관리자 콘텐츠 상세 페이지
// ==============================

export default function CommunityContentDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const contentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [content, setContent] = useState<CommunityContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  useEffect(() => {
    if (!contentId) {
      setContent(null);
      setLoadError('요청하신 콘텐츠를 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadContent = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response = await fetch(`/api/mock/community-contents/${contentId}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(errorData?.message || '콘텐츠 상세 정보를 불러오지 못했습니다.');
        }

        const nextContent = (await response.json()) as CommunityContent;

        if (!isCancelled) {
          setContent(nextContent);
        }
      } catch (error) {
        if (!isCancelled) {
          setContent(null);
          setLoadError(error instanceof Error ? error.message : '콘텐츠 상세 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      isCancelled = true;
    };
  }, [contentId]);

  // === Action handlers ===
  const handlePatchContent = async (payload: Partial<CommunityContent>) => {
    if (!contentId || !content || isSubmittingAction) return;

    try {
      setIsSubmittingAction(true);

      const response = await fetch(`/api/mock/community-contents/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorData?.message || '콘텐츠 정보를 수정하지 못했습니다.');
      }

      const nextContent = (await response.json()) as CommunityContent;
      setContent(nextContent);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '콘텐츠 정보를 수정하지 못했습니다.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleDeleteContent = async () => {
    if (!contentId || isSubmittingAction) return;

    try {
      setIsSubmittingAction(true);

      const response = await fetch(`/api/mock/community-contents/${contentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorData?.message || '콘텐츠를 삭제하지 못했습니다.');
      }

      setIsDeleteModalOpen(false);
      router.push('/admin/community/content');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '콘텐츠를 삭제하지 못했습니다.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleEditContent = () => {
    if (!contentId) return;
    router.push(`/admin/community/content/${contentId}/edit`);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader left={null} right={null} />

        <Box borderWidth="1px" borderColor="#E5E7EB" borderRadius="16px" bg="#FFFFFF" px="24px" py="32px">
          <Text fontSize="14px" color="#6B7280">
            콘텐츠를 불러오는 중입니다.
          </Text>
        </Box>
      </PageContainer>
    );
  }

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
                {loadError || '요청하신 콘텐츠를 찾을 수 없습니다.'}
              </Text>
            </Flex>
          }
          right={null}
        />

        <Box borderWidth="1px" borderColor="#E5E7EB" borderRadius="16px" bg="#FFFFFF" px="24px" py="32px">
          <Text fontSize="14px" color="#6B7280">
            {loadError || '존재하지 않거나 삭제된 콘텐츠입니다.'}
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
          <Flex align="center" justify="space-between" mb="10px" position="relative">
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

            <ContentActionMenu
              content={content}
              isSubmitting={isSubmittingAction}
              onArchiveToggle={() =>
                handlePatchContent({
                  status: content.status === 'archived' ? 'published' : 'archived',
                })
              }
              onPinnedToggle={() =>
                handlePatchContent({
                  flags: { ...content.flags, isPinned: !content.flags.isPinned },
                })
              }
              onNoticeToggle={() =>
                handlePatchContent({
                  flags: { ...content.flags, isNotice: !content.flags.isNotice },
                })
              }
              onEdit={handleEditContent}
              onDelete={() => setIsDeleteModalOpen(true)}
            />
          </Flex>

          <Flex align="center" gap="8px" mb="14px">
            <Box px="10px" py="4px" borderRadius="9999px" {...getStatusBadgeStyle(content)}>
              <Text fontSize="12px" fontWeight="700">
                {statusLabel}
              </Text>
            </Box>
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
                {content.author.visibility !== 'anonymous' ? <BadgeCheck size={16} color="#3B82F6" /> : null}
              </Flex>
              <Text mt="2px" fontSize="13px" color="#6B7280">
                {content.author.visibility === 'anonymous' ? `관리자 식별명 · ${authorRealName}` : '실명 프로필'} · {publishedAtDisplay}
              </Text>
            </Box>
          </Flex>

          <Flex direction="column" gap="18px" mt="22px">
            {content.content.content?.length ? (
              content.content.content.map((node, index) => renderBodyNode(node, index))
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

      <BaseModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (isSubmittingAction) return;
          setIsDeleteModalOpen(false);
        }}
        title="콘텐츠 삭제"
        footer={
          <Flex gap="8px" w="100%">
            <AdminButton
              type="button"
              variantStyle="outline"
              size="md"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmittingAction}
              flex={1}
            >
              취소
            </AdminButton>
            <AdminButton
              type="button"
              variantStyle="primary"
              size="md"
              onClick={() => {
                void handleDeleteContent();
              }}
              disabled={isSubmittingAction}
              flex={1}
            >
              삭제하기
            </AdminButton>
          </Flex>
        }
      >
        <Flex direction="column" gap="8px">
          <Text fontSize="14px" fontWeight="600" color="#111827">
            이 콘텐츠를 삭제하시겠습니까?
          </Text>
          <Text fontSize="13px" color="#6B7280">
            삭제 후에는 목록에서 확인할 수 없습니다.
          </Text>
        </Flex>
      </BaseModal>
    </PageContainer>
  );
}

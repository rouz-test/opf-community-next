'use client';

import { Box, Button, Flex, Image, Link as ChakraLink, Spinner, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Bookmark, Eye, Heart, Megaphone, MessageSquare } from 'lucide-react';
import { Fragment, useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';

import CommentEditor from '@/app/admin/components/comment/comment-editor';
import CommentItem from '@/app/admin/components/comment/comment-item';
import BlockedWordAlertModal from '@/app/admin/components/modal/blocked-word-alert-modal';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import BaseModal from '@/app/admin/components/modal/base-modal';
import AdminButton from '@/app/admin/components/ui/button';
import AdminTagBadge from '@/app/admin/components/ui/tag/tag-badge';
import { toaster } from '@/app/admin/components/ui/toaster';
import tagsData from '@/data/mock/tags.json';
import { getBlockedWords } from '@/lib/blocked-words';
import { findMatchedBlockedWords } from '@/lib/blocked-word-validator';
import { resolveTags } from '@/lib/tags';
import type { CommunityContent, CommunityContentBody } from '@/types/community-content';
import type {
  CommunityComment,
  CommunityCommentListResponse,
  CommunityContentCommentStats,
} from '@/types/community-comment';
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

async function parseErrorMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as { message?: string } | null;
  return data?.message || fallback;
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
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [commentValue, setCommentValue] = useState('');
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyTargetName, setReplyTargetName] = useState<string | null>(null);
  const [replyValue, setReplyValue] = useState('');
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);
  const [blockedWordModalTitle, setBlockedWordModalTitle] = useState('금지 키워드가 포함되어 진행할 수 없습니다.');
  const [blockedWordModalDescription, setBlockedWordModalDescription] = useState('금지 키워드를 수정한 뒤 다시 시도해주세요.');
  const [matchedBlockedKeywords, setMatchedBlockedKeywords] = useState<string[]>([]);
  const [blockedWordSourceText, setBlockedWordSourceText] = useState('');
  const [isBlockedWordModalOpen, setIsBlockedWordModalOpen] = useState(false);

  const applyCommentStats = useCallback((stats: CommunityContentCommentStats) => {
    setContent((prevContent) => {
      if (!prevContent) return prevContent;

      return {
        ...prevContent,
        stats: {
          ...prevContent.stats,
          commentCount: stats.commentCount,
          replyCount: stats.replyCount,
        },
      };
    });
  }, []);

  const loadComments = useCallback(async () => {
    if (!contentId) {
      setComments([]);
      setCommentsError(null);
      return;
    }

    try {
      setIsCommentsLoading(true);
      setCommentsError(null);

      const response = await fetch(`/api/mock/community-comments?contentId=${contentId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response, '댓글 목록을 불러오지 못했습니다.'));
      }

      const data = (await response.json()) as CommunityCommentListResponse;
      setComments(data.items);
      applyCommentStats(data.stats);
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : '댓글 목록을 불러오지 못했습니다.');
    } finally {
      setIsCommentsLoading(false);
    }
  }, [applyCommentStats, contentId]);

  const openBlockedWordModal = useCallback((title: string, description: string, matchedKeywords: string[], sourceText: string) => {
    setBlockedWordModalTitle(title);
    setBlockedWordModalDescription(description);
    setMatchedBlockedKeywords(matchedKeywords);
    setBlockedWordSourceText(sourceText);
    setIsBlockedWordModalOpen(true);
  }, []);

  const validateBlockedWords = useCallback(
    async (text: string, title: string, description: string) => {
      const blockedWords = await getBlockedWords();
      const matchResult = findMatchedBlockedWords(text, blockedWords);

      if (matchResult.hasBlockedWords) {
        openBlockedWordModal(title, description, matchResult.matchedKeywords, text);
        return false;
      }

      return true;
    },
    [openBlockedWordModal],
  );

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

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

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

  const handleCreateComment = async () => {
    if (!contentId || isCommentSubmitting) return;

    try {
      const isAllowed = await validateBlockedWords(
        commentValue,
        '금지 키워드가 포함되어 댓글을 등록할 수 없습니다.',
        '댓글 내용에서 금지 키워드를 수정한 뒤 다시 등록해주세요.',
      );

      if (!isAllowed) {
        return;
      }

      setIsCommentSubmitting(true);

      const response = await fetch('/api/mock/community-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          content: commentValue,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | { message?: string; matchedKeywords?: string[] }
          | null;

        if (errorData?.matchedKeywords?.length) {
          openBlockedWordModal(
            '금지 키워드가 포함되어 댓글을 등록할 수 없습니다.',
            '댓글 내용에서 금지 키워드를 수정한 뒤 다시 등록해주세요.',
            errorData.matchedKeywords,
            commentValue,
          );
          return;
        }

        throw new Error(errorData?.message || '댓글을 등록하지 못했습니다.');
      }

      setCommentValue('');
      toaster.create({
        type: 'success',
        description: '댓글이 등록되었습니다.',
      });
      await loadComments();
    } catch (error) {
      toaster.create({
        type: 'error',
        description: error instanceof Error ? error.message : '댓글을 등록하지 못했습니다.',
      });
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleCreateReply = async (comment: CommunityComment) => {
    if (!contentId || isReplySubmitting) return;

    try {
      const isAllowed = await validateBlockedWords(
        replyValue,
        '금지 키워드가 포함되어 답글을 등록할 수 없습니다.',
        '답글 내용에서 금지 키워드를 수정한 뒤 다시 등록해주세요.',
      );

      if (!isAllowed) {
        return;
      }

      setIsReplySubmitting(true);

      const response = await fetch('/api/mock/community-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          parentId: comment.id,
          content: replyValue,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | { message?: string; matchedKeywords?: string[] }
          | null;

        if (errorData?.matchedKeywords?.length) {
          openBlockedWordModal(
            '금지 키워드가 포함되어 답글을 등록할 수 없습니다.',
            '답글 내용에서 금지 키워드를 수정한 뒤 다시 등록해주세요.',
            errorData.matchedKeywords,
            replyValue,
          );
          return;
        }

        throw new Error(errorData?.message || '답글을 등록하지 못했습니다.');
      }

      setReplyTargetId(null);
      setReplyTargetName(null);
      setReplyValue('');
      toaster.create({
        type: 'success',
        description: '답글이 등록되었습니다.',
      });
      await loadComments();
    } catch (error) {
      toaster.create({
        type: 'error',
        description: error instanceof Error ? error.message : '답글을 등록하지 못했습니다.',
      });
    } finally {
      setIsReplySubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: string, nextCommentValue: string) => {
    const isAllowed = await validateBlockedWords(
      nextCommentValue,
      '금지 키워드가 포함되어 댓글을 수정할 수 없습니다.',
      '댓글 내용에서 금지 키워드를 수정한 뒤 다시 저장해주세요.',
    );

    if (!isAllowed) {
      return false;
    }

    const response = await fetch(`/api/mock/community-comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: nextCommentValue,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as
        | { message?: string; matchedKeywords?: string[] }
        | null;

      if (errorData?.matchedKeywords?.length) {
        openBlockedWordModal(
          '금지 키워드가 포함되어 댓글을 수정할 수 없습니다.',
          '댓글 내용에서 금지 키워드를 수정한 뒤 다시 저장해주세요.',
          errorData.matchedKeywords,
          nextCommentValue,
        );
        return false;
      }

      toaster.create({
        type: 'error',
        description: errorData?.message || '댓글을 수정하지 못했습니다.',
      });
      return false;
    }

    toaster.create({
      type: 'success',
      description: '댓글이 수정되었습니다.',
    });
    await loadComments();
    return true;
  };

  const handleDeleteComment = async (commentId: string) => {
    const response = await fetch(`/api/mock/community-comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actionActor: 'admin',
      }),
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, '댓글을 삭제하지 못했습니다.'));
    }

    toaster.create({
      type: 'success',
      description: '댓글이 삭제되었습니다.',
    });
    await loadComments();
  };

  const handleArchiveComment = async (
    commentId: string,
    nextStatus: 'published' | 'archived',
  ) => {
    const response = await fetch(`/api/mock/community-comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: nextStatus,
        actionActor: 'admin',
      }),
    });

    if (!response.ok) {
      throw new Error(
        await parseErrorMessage(
          response,
          nextStatus === 'archived'
            ? '댓글을 보관하지 못했습니다.'
            : '댓글을 노출 전환하지 못했습니다.',
        ),
      );
    }

    toaster.create({
      type: 'success',
      description:
        nextStatus === 'archived'
          ? '댓글이 보관되었습니다.'
          : '댓글이 다시 노출되었습니다.',
    });
    await loadComments();
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

        <Box overflow="hidden" borderWidth="1px" borderColor="#E5E7EB" borderRadius="18px" bg="#FFFFFF">
          <Box px="24px" py="20px" borderBottom="1px solid" borderColor="#E5E7EB">
            <Flex align="center" gap="6px" mb="16px">
              <Text fontSize="18px" fontWeight="700" color="#111827">
                댓글
              </Text>
              <Text fontSize="13px" color="#6B7280">
                {content.stats.commentCount + content.stats.replyCount}개
              </Text>
            </Flex>
            {replyTargetId && replyTargetName ? (
              <Box
                mb="12px"
                px="12px"
                py="10px"
                borderRadius="12px"
                bg="#FFF7ED"
                borderWidth="1px"
                borderColor="#FED7AA"
              >
                <Text fontSize="12px" color="#9A3412">
                  현재 <Text as="span" fontWeight="700">{replyTargetName}</Text> 님의 댓글에 답글을 작성 중입니다.
                </Text>
              </Box>
            ) : null}

            <CommentEditor
              value={commentValue}
              onChange={setCommentValue}
              onSubmit={() => {
                void handleCreateComment();
              }}
              submitLabel="댓글 등록"
              isSubmitting={isCommentSubmitting}
              placeholder="댓글을 입력하세요."
            />
          </Box>

          <Box px="24px" py="20px">
            {isCommentsLoading ? (
              <Flex minH="120px" align="center" justify="center" gap="10px" color="#6B7280">
                <Spinner size="sm" />
                <Text fontSize="13px">댓글을 불러오는 중입니다.</Text>
              </Flex>
            ) : commentsError ? (
              <Box
                borderWidth="1px"
                borderColor="#FECACA"
                bg="#FEF2F2"
                borderRadius="14px"
                px="16px"
                py="14px"
              >
                <Text fontSize="13px" color="#B91C1C">
                  {commentsError}
                </Text>
              </Box>
            ) : comments.length > 0 ? (
              <Flex direction="column" gap="12px">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    replyTargetId={replyTargetId}
                    replyDraft={replyValue}
                    isReplySubmitting={isReplySubmitting}
                    onReplyDraftChange={setReplyValue}
                    onReplyStart={(targetComment) => {
                      setReplyTargetId(targetComment.id);
                      setReplyTargetName(targetComment.author.displayName);
                      setReplyValue('');
                    }}
                    onReplyCancel={() => {
                      setReplyTargetId(null);
                      setReplyTargetName(null);
                      setReplyValue('');
                    }}
                    onReplySubmit={handleCreateReply}
                    onUpdateComment={handleUpdateComment}
                    onArchiveToggle={handleArchiveComment}
                    onDeleteComment={handleDeleteComment}
                    currentUserRole="admin"
                  />
                ))}
              </Flex>
            ) : null}
          </Box>
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

      <BlockedWordAlertModal
        isOpen={isBlockedWordModalOpen}
        onClose={() => setIsBlockedWordModalOpen(false)}
        title={blockedWordModalTitle}
        description={blockedWordModalDescription}
        matchedKeywords={matchedBlockedKeywords}
        sourceText={blockedWordSourceText}
      />
    </PageContainer>
  );
}

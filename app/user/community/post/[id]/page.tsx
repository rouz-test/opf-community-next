'use client';

import {
  Box,
  Button,
  Flex,
  Grid,
  Image,
  Link as ChakraLink,
  Spinner,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Megaphone,
  Trash2,
} from 'lucide-react';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import CommentEditor from '@/app/user/components/comment/comment-editor';
import CommentItem from '@/app/user/components/comment/comment-item';
import { WritePostModal } from '@/app/user/components/community/WritePostModal';
import BackIcon from '@/app/user/components/icons/BackIcon';
import BookmarkFilledIcon from '@/app/user/components/icons/BookmarkFilledIcon';
import BookmarkIcon from '@/app/user/components/icons/BookmarkIcon';
import CheckBadgeIcon from '@/app/user/components/icons/CheckBadgeIcon';
import CommentFilledIcon from '@/app/user/components/icons/CommentFilledIcon';
import CommentIcon from '@/app/user/components/icons/CommentIcon';
import EyeClosedIcon from '@/app/user/components/icons/EyeClosedIcon';
import EyeIcon from '@/app/user/components/icons/EyeIcon';
import HeartFilledIcon from '@/app/user/components/icons/HeartFilledIcon';
import HeartIcon from '@/app/user/components/icons/HeartIcon';
import MoreIcon from '@/app/user/components/icons/MoreIcon';
import PenIcon from '@/app/user/components/icons/PenIcon';
import ShareIcon from '@/app/user/components/icons/ShareIcon';
import ActivitySuspendedModal from '@/app/user/components/modal/activity-suspended-modal';
import BlockedWordAlertModal from '@/app/user/components/modal/blocked-word-alert-modal';
import ActionConfirmModal from '@/app/user/components/modal/action-confirm-modal';
import { AuthorProfileCard } from '@/app/user/components/community/AuthorProfileCard';
import { CommunityProfileCard } from '@/app/user/components/community/CommunityProfileCard';
import { useAuth } from '@/app/user/components/providers/AuthProvider';
import UserTagBadge from '@/app/user/components/ui/tag/tag-badge';
import { toaster } from '@/app/user/components/ui/toaster';
import {
  COMMUNITY_CURRENT_USER,
  mockCommunityPosts,
} from '@/app/user/lib/community-content-data';
import { copyPostUrlToClipboard } from '@/app/user/lib/share-post-url';
import {
  COMMUNITY_ACTIVITY_SUSPENDED_MESSAGE,
  fetchCommunitySuspensionStatus,
} from '@/app/user/lib/community-suspension';
import tagsData from '@/data/mock/tags.json';
import usersData from '@/data/mock/users.json';
import { resolveTags } from '@/lib/tags';
import type { CommunityContent, CommunityContentBody } from '@/types/community-content';
import type {
  CommunityComment,
  CommunityCommentListResponse,
  CommunityContentCommentStats,
} from '@/types/community-comment';
import type { Tag } from '@/types/tag';
import type { UserAccount } from '@/types/user';

const tags = tagsData as Tag[];
const users = usersData as UserAccount[];
const DEFAULT_BODY_TEXT_COLOR = '#374151';
const DEFAULT_BLOCKQUOTE_TEXT_COLOR = '#111827';
const DEFAULT_REAL_PROFILE_IMAGE = '/images/profiles/real-large.png';
const DEFAULT_REAL_COMMENT_PROFILE_IMAGE = '/images/profiles/real-medium.png';
const ANONYMOUS_PROFILE_IMAGE = '/images/profiles/anonymous-large.png';
const ANONYMOUS_COMMENT_PROFILE_IMAGE = '/images/profiles/anonymous-medium.png';

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
    if (items.length === 0) return null;

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
    if (items.length === 0) return null;

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
      <Box key={`blockquote-${index}`} {...getQuoteContainerStyles(node)}>
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
      <Box key={`youtube-${index}`} display="block" lineHeight="0">
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
    );
  }

  return null;
}

function getAuthorDisplay(content: CommunityContent) {
  if (content.author.visibility === 'anonymous') {
    return '익명';
  }

  return content.author.displayName || content.author.identifierValue || content.author.id;
}

function findAuthorAccount(accountId: string) {
  return users.find((user) => user.accountId === accountId);
}

function getAuthorAvatar(content: CommunityContent) {
  if (content.author.visibility === 'anonymous') {
    return ANONYMOUS_PROFILE_IMAGE;
  }

  if (content.author.type === 'admin') {
    return DEFAULT_REAL_PROFILE_IMAGE;
  }

  return findAuthorAccount(content.author.id)?.profile.avatar || DEFAULT_REAL_PROFILE_IMAGE;
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

const compactAuthorMeta = (parts: Array<string | null | undefined>) =>
  parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part)).join(' · ');

function getAuthorMetaDisplay(content: CommunityContent) {
  const publishedAtDisplay = getPublishedAtDisplay(content);

  if (content.author.visibility === 'anonymous') {
    return publishedAtDisplay;
  }

  const authorAccount = findAuthorAccount(content.author.id);

  return compactAuthorMeta([
    authorAccount?.profile.company,
    authorAccount?.profile.position,
    publishedAtDisplay,
  ]);
}

function getCommentTotalCount(commentCount: number, replyCount: number) {
  return commentCount + replyCount;
}

function parseErrorMessage(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
    return data.message;
  }

  return fallback;
}

function decorateCommentAuthorName(comment: CommunityComment, postAuthorId: string) {
  if (comment.author.visibility !== 'anonymous') {
    return comment.author.displayName;
  }

  return comment.author.id === postAuthorId ? '익명, 작성자' : '익명';
}

function mapCommentsForUser(comments: CommunityComment[], postAuthorId: string): CommunityComment[] {
  return comments.map((comment) => ({
    ...comment,
    author: {
      ...comment.author,
      displayName: decorateCommentAuthorName(comment, postAuthorId),
      avatar:
        comment.author.visibility === 'anonymous'
          ? ANONYMOUS_COMMENT_PROFILE_IMAGE
          : comment.author.type === 'admin'
            ? DEFAULT_REAL_COMMENT_PROFILE_IMAGE
            : comment.author.avatar || findAuthorAccount(comment.author.id)?.profile.avatar || DEFAULT_REAL_COMMENT_PROFILE_IMAGE,
    },
    replies: mapCommentsForUser(comment.replies, postAuthorId),
  }));
}

export default function CommunityPostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const contentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const {
    isLoggedIn,
    defaultCommunityIdentity,
    setDefaultCommunityIdentity,
  } = useAuth();

  const [content, setContent] = useState<CommunityContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [commentValue, setCommentValue] = useState('');
  const [commentIdentity, setCommentIdentity] = useState<'real' | 'anonymous'>(defaultCommunityIdentity);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyTargetName, setReplyTargetName] = useState<string | null>(null);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);
  const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);
  const [isSaveSubmitting, setIsSaveSubmitting] = useState(false);
  const [blockedWordModalTitle, setBlockedWordModalTitle] = useState('금지 키워드가 포함되어 진행할 수 없습니다.');
  const [blockedWordModalDescription, setBlockedWordModalDescription] = useState('금지 키워드를 수정한 뒤 다시 시도해주세요.');
  const [matchedBlockedKeywords, setMatchedBlockedKeywords] = useState<string[]>([]);
  const [blockedWordSourceText, setBlockedWordSourceText] = useState('');
  const [isBlockedWordModalOpen, setIsBlockedWordModalOpen] = useState(false);
  const [isActivitySuspendedModalOpen, setIsActivitySuspendedModalOpen] = useState(false);
  const [isOwnPostMenuOpen, setIsOwnPostMenuOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<CommunityContent | null>(null);
  const [deleteTargetContent, setDeleteTargetContent] = useState<CommunityContent | null>(null);
  const [hideTargetContent, setHideTargetContent] = useState<CommunityContent | null>(null);
  const [isDeletingContent, setIsDeletingContent] = useState(false);
  const [isHidingContent, setIsHidingContent] = useState(false);
  const [deleteTargetComment, setDeleteTargetComment] = useState<CommunityComment | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const ownPostMenuRef = useRef<HTMLDivElement | null>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setCommentIdentity(defaultCommunityIdentity);
  }, [defaultCommunityIdentity]);

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

  const loadComments = useCallback(async (authorId?: string) => {
    if (!contentId) {
      setComments([]);
      setCommentsError(null);
      return;
    }

    try {
      setIsCommentsLoading(true);
      setCommentsError(null);

      const response = await fetch(`/api/mock/community-comments?contentId=${contentId}&accountId=${COMMUNITY_CURRENT_USER.accountId}`, {
        cache: 'no-store',
      });
      const data = (await response.json().catch(() => null)) as CommunityCommentListResponse | { message?: string } | null;

      if (!response.ok || !data || !('items' in data)) {
        throw new Error(parseErrorMessage(data, '댓글 목록을 불러오지 못했습니다.'));
      }

      setComments(authorId ? mapCommentsForUser(data.items, authorId) : data.items);
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : '댓글 목록을 불러오지 못했습니다.');
    } finally {
      setIsCommentsLoading(false);
    }
  }, [contentId]);

  const openBlockedWordModal = useCallback(
    (title: string, description: string, matchedKeywords: string[], sourceText: string) => {
      setBlockedWordModalTitle(title);
      setBlockedWordModalDescription(description);
      setMatchedBlockedKeywords(matchedKeywords);
      setBlockedWordSourceText(sourceText);
      setIsBlockedWordModalOpen(true);
    },
    [],
  );

  useEffect(() => {
    if (!contentId) {
      setContent(null);
      setLoadError('요청하신 게시글을 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadContent = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response = await fetch(`/api/mock/community-contents/${contentId}?accountId=${COMMUNITY_CURRENT_USER.accountId}`, {
          cache: 'no-store',
        });
        const data = (await response.json().catch(() => null)) as CommunityContent | { message?: string } | null;

        if (!response.ok || !data || !('id' in data)) {
          throw new Error(parseErrorMessage(data, '게시글 상세 정보를 불러오지 못했습니다.'));
        }

        if (isCancelled) return;
        setContent(data);
        void loadComments(data.author.id);
      } catch (error) {
        if (isCancelled) return;
        setContent(null);
        setLoadError(error instanceof Error ? error.message : '게시글 상세 정보를 불러오지 못했습니다.');
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
  }, [contentId, loadComments]);

  const toggleProfileMode = () => {
    setDefaultCommunityIdentity(defaultCommunityIdentity === 'real' ? 'anonymous' : 'real');
  };

  const buildCommentAuthorPayload = useCallback(
    (identity: 'real' | 'anonymous') => ({
      type: 'user' as const,
      id: COMMUNITY_CURRENT_USER.accountId,
      visibility: identity === 'anonymous' ? 'anonymous' as const : 'public' as const,
      displayName: identity === 'anonymous' ? '익명' : COMMUNITY_CURRENT_USER.name,
      identifierType: 'name' as const,
      identifierValue: COMMUNITY_CURRENT_USER.name,
      avatar: identity === 'anonymous' ? '/images/profiles/anonymous-medium.png' : COMMUNITY_CURRENT_USER.avatar,
    }),
    [],
  );

  const refreshComments = useCallback(async () => {
    if (!content) return;
    await loadComments(content.author.id);
  }, [content, loadComments]);

  const syncContentCommentStats = useCallback((stats: CommunityContentCommentStats) => {
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

  const handleTogglePostLike = useCallback(async () => {
    if (!contentId || !content || isLikeSubmitting) return;

    try {
      setIsLikeSubmitting(true);

      const isLikedByMe = Boolean(content.viewerState?.isLikedByMe);
      const response = await fetch(`/api/mock/community-contents/${contentId}/like?accountId=${COMMUNITY_CURRENT_USER.accountId}`, {
        method: isLikedByMe ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = (await response.json().catch(() => null)) as
        | { content?: CommunityContent; liked?: boolean; message?: string }
        | null;

      if (!response.ok || !data?.content) {
        throw new Error(parseErrorMessage(data, '좋아요를 처리하지 못했습니다.'));
      }

      setContent({
        ...data.content,
        viewerState: {
          ...content.viewerState,
          isLikedByMe: Boolean(data.liked),
        },
      });
    } catch (error) {
      console.error('[CommunityPostDetailPage] failed to toggle like:', error);
      toaster.create({
        description: error instanceof Error ? error.message : '좋아요를 처리하지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
    } finally {
      setIsLikeSubmitting(false);
    }
  }, [content, contentId, isLikeSubmitting]);

  const handleTogglePostSave = useCallback(async () => {
    if (!contentId || !content || isSaveSubmitting) return;

    try {
      setIsSaveSubmitting(true);

      const isSavedByMe = Boolean(content.viewerState?.isSavedByMe);
      const response = await fetch(`/api/mock/community-contents/${contentId}/save?accountId=${COMMUNITY_CURRENT_USER.accountId}`, {
        method: isSavedByMe ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = (await response.json().catch(() => null)) as
        | { content?: CommunityContent; saved?: boolean; message?: string }
        | null;

      if (!response.ok || !data?.content) {
        throw new Error(parseErrorMessage(data, '저장을 처리하지 못했습니다.'));
      }

      setContent({
        ...data.content,
        viewerState: {
          ...content.viewerState,
          isSavedByMe: Boolean(data.saved),
        },
      });
    } catch (error) {
      console.error('[CommunityPostDetailPage] failed to toggle save:', error);
      toaster.create({
        description: error instanceof Error ? error.message : '저장을 처리하지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
    } finally {
      setIsSaveSubmitting(false);
    }
  }, [content, contentId, isSaveSubmitting]);

  const handleToggleCommentLike = useCallback(async (comment: CommunityComment) => {
    try {
      const method = comment.isLikedByMe ? 'DELETE' : 'POST';
      const response = await fetch(`/api/mock/community-comments/${comment.id}/like?accountId=${COMMUNITY_CURRENT_USER.accountId}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = (await response.json().catch(() => null)) as
        | { item?: CommunityComment; liked?: boolean; message?: string }
        | null;

      if (!response.ok || !data?.item) {
        throw new Error(data?.message || '댓글 좋아요를 처리하지 못했습니다.');
      }

      await refreshComments();
      return {
        ...data.item,
        isLikedByMe: Boolean(data.liked),
      };
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : '댓글 좋아요를 처리하지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
      throw error;
    }
  }, [refreshComments]);

  const handleRequestEditContent = async () => {
    if (!contentId) return;

    try {
      const response = await fetch(`/api/mock/community-contents/${contentId}`, {
        cache: 'no-store',
      });

      const data = (await response.json().catch(() => null)) as CommunityContent | { message?: string } | null;

      if (!response.ok || !data || !('id' in data)) {
        throw new Error(parseErrorMessage(data, '게시글 정보를 불러오지 못했습니다.'));
      }

      setEditingContent(data);
      setIsWriteModalOpen(true);
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : '게시글 정보를 불러오지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
    }
  };

  const handleUpdatedContent = (updatedContent: CommunityContent) => {
    setContent(updatedContent);
    setEditingContent(null);
    setIsWriteModalOpen(false);
  };

  const handleConfirmDeleteContent = async () => {
    if (!deleteTargetContent || isDeletingContent) return;

    try {
      setIsDeletingContent(true);

      const response = await fetch(`/api/mock/community-contents/${deleteTargetContent.id}`, {
        method: 'DELETE',
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message || '게시글을 삭제하지 못했습니다.');
      }

      setDeleteTargetContent(null);
      toaster.create({
        description: '게시글이 삭제되었습니다.',
        type: 'success',
        duration: 2000,
      });
      router.push('/user/community');
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : '게시글을 삭제하지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
    } finally {
      setIsDeletingContent(false);
    }
  };

  const handleConfirmHideContent = async () => {
    if (!hideTargetContent || isHidingContent) return;

    try {
      setIsHidingContent(true);

      const response = await fetch(`/api/mock/community-contents/${hideTargetContent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flags: {
            isHiddenByAuthor: true,
          },
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message || '게시글을 숨기지 못했습니다.');
      }

      setHideTargetContent(null);
      toaster.create({
        description: '게시글이 숨김 처리되었습니다.',
        type: 'success',
        duration: 2000,
      });
      router.push('/user/community');
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : '게시글을 숨기지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
    } finally {
      setIsHidingContent(false);
    }
  };

  const handleCreateComment = async () => {
    if (!contentId || !content || isCommentSubmitting) return;

    try {
      setIsCommentSubmitting(true);

      if (await fetchCommunitySuspensionStatus(COMMUNITY_CURRENT_USER.accountId)) {
        setIsActivitySuspendedModalOpen(true);
        return;
      }

      const response = await fetch('/api/mock/community-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          content: commentValue,
          author: buildCommentAuthorPayload(commentIdentity),
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; matchedKeywords?: string[]; stats?: CommunityContentCommentStats }
        | null;

      if (!response.ok) {
        if (data?.matchedKeywords?.length) {
          openBlockedWordModal(
            '금지 키워드가 포함되어 댓글을 등록할 수 없습니다.',
            '댓글 내용에서 금지 키워드를 수정한 뒤 다시 등록해주세요.',
            data.matchedKeywords,
            commentValue,
          );
          return;
        }

        if (data?.message === COMMUNITY_ACTIVITY_SUSPENDED_MESSAGE) {
          setIsActivitySuspendedModalOpen(true);
          return;
        }

        throw new Error(parseErrorMessage(data, '댓글을 등록하지 못했습니다.'));
      }

      setCommentValue('');
      setCommentIdentity(defaultCommunityIdentity);
      if (data?.stats) {
        syncContentCommentStats(data.stats);
      }
      await refreshComments();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '댓글을 등록하지 못했습니다.');
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleCreateReply = async () => {
    if (!contentId || !content || !replyTargetId || isReplySubmitting) return;

    const targetComment = comments.find((comment) => comment.id === replyTargetId);
    if (!targetComment) return;

    try {
      setIsReplySubmitting(true);

      if (await fetchCommunitySuspensionStatus(COMMUNITY_CURRENT_USER.accountId)) {
        setIsActivitySuspendedModalOpen(true);
        return;
      }

      const response = await fetch('/api/mock/community-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          parentId: targetComment.id,
          content: commentValue,
          author: buildCommentAuthorPayload(commentIdentity),
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; matchedKeywords?: string[]; stats?: CommunityContentCommentStats }
        | null;

      if (!response.ok) {
        if (data?.matchedKeywords?.length) {
          openBlockedWordModal(
            '금지 키워드가 포함되어 답글을 등록할 수 없습니다.',
            '답글 내용에서 금지 키워드를 수정한 뒤 다시 등록해주세요.',
            data.matchedKeywords,
            commentValue,
          );
          return;
        }

        if (data?.message === COMMUNITY_ACTIVITY_SUSPENDED_MESSAGE) {
          setIsActivitySuspendedModalOpen(true);
          return;
        }

        throw new Error(parseErrorMessage(data, '답글을 등록하지 못했습니다.'));
      }

      setReplyTargetId(null);
      setReplyTargetName(null);
      setCommentValue('');
      setCommentIdentity(defaultCommunityIdentity);
      if (data?.stats) {
        syncContentCommentStats(data.stats);
      }
      await refreshComments();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '답글을 등록하지 못했습니다.');
    } finally {
      setIsReplySubmitting(false);
    }
  };

  const handleCancelReply = () => {
    setReplyTargetId(null);
    setReplyTargetName(null);
    setCommentValue('');
    setCommentIdentity(defaultCommunityIdentity);
  };

  const handleUpdateComment = async (commentId: string, nextCommentValue: string) => {
    const response = await fetch(`/api/mock/community-comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: nextCommentValue,
        actionActor: 'author',
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | { message?: string; matchedKeywords?: string[] }
      | null;

    if (!response.ok) {
      if (data?.matchedKeywords?.length) {
        openBlockedWordModal(
          '금지 키워드가 포함되어 댓글을 수정할 수 없습니다.',
          '댓글 내용에서 금지 키워드를 수정한 뒤 다시 저장해주세요.',
          data.matchedKeywords,
          nextCommentValue,
        );
        return false;
      }

      window.alert(parseErrorMessage(data, '댓글을 수정하지 못했습니다.'));
      return false;
    }

    await refreshComments();
    return true;
  };

  const handleRequestDeleteComment = (comment: CommunityComment) => {
    setDeleteTargetComment(comment);
  };

  const handleConfirmDeleteComment = async () => {
    if (!deleteTargetComment || isDeletingComment) return;

    try {
      setIsDeletingComment(true);

      const response = await fetch(`/api/mock/community-comments/${deleteTargetComment.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionActor: 'author',
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; stats?: CommunityContentCommentStats }
        | null;

      if (!response.ok) {
        throw new Error(parseErrorMessage(data, '댓글을 삭제하지 못했습니다.'));
      }

      setDeleteTargetComment(null);
      if (data?.stats) {
        syncContentCommentStats(data.stats);
      }
      await refreshComments();
      toaster.create({
        description: '댓글이 삭제되었습니다.',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : '댓글을 삭제하지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
    } finally {
      setIsDeletingComment(false);
    }
  };

  const handleArchiveComment = async () => {
    return;
  };

  const isAnonymousContent = content?.author.visibility === 'anonymous';
  const isOwnContent = content?.author.id === COMMUNITY_CURRENT_USER.accountId;
  const canNavigateContentAuthor = Boolean(
    content && content.author.visibility !== 'anonymous' && content.author.type !== 'admin',
  );
  const resolvedTags = useMemo(() => (content ? resolveTags(content.tagIds, tags) : []), [content]);
  const authorDisplay = content ? getAuthorDisplay(content) : '';
  const authorAvatar = content ? getAuthorAvatar(content) : DEFAULT_REAL_PROFILE_IMAGE;
  const authorMetaDisplay = content ? getAuthorMetaDisplay(content) : '-';
  const hasCommentedByMe = useMemo(() => {
    const hasOwnComment = (comment: CommunityComment): boolean =>
      comment.author.id === COMMUNITY_CURRENT_USER.accountId || comment.replies.some(hasOwnComment);

    return comments.some(hasOwnComment);
  }, [comments]);

  const authorOtherPosts = useMemo(() => {
    if (!content || content.author.visibility === 'anonymous') return [];

    return mockCommunityPosts
      .filter((item) => item.author.id === content.author.id && item.id !== content.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [content]);

  const navigateToAuthorPage = useCallback(
    (authorId: string) => {
      if (!authorId) return;
      router.push(`/user/community/author/${authorId}`);
    },
    [router],
  );

  if (isLoading) {
    return (
      <Flex minH="calc(100vh - 160px)" align="center" justify="center" color="#6B7280" gap="10px">
        <Spinner size="sm" />
        <Text fontSize="14px">게시글을 불러오는 중입니다.</Text>
      </Flex>
    );
  }

  if (!content) {
    return (
      <Flex minH="calc(100vh - 160px)" align="center" justify="center" px="20px">
        <Box
          borderWidth="1px"
          borderColor="#E5E7EB"
          borderRadius="18px"
          bg="#FFFFFF"
          px="28px"
          py="32px"
          textAlign="center"
          maxW="420px"
          w="100%"
        >
          <Text fontSize="22px" fontWeight="700" color="#111827" mb="8px">
            게시글을 찾을 수 없습니다
          </Text>
          <Text fontSize="14px" color="#6B7280" mb="18px">
            {loadError || '삭제되었거나 존재하지 않는 게시글입니다.'}
          </Text>
          <Button asChild bg="#F59E42" color="#FFFFFF" _hover={{ bg: '#EC8A2E' }}>
            <Link href="/user/community">커뮤니티 홈으로</Link>
          </Button>
        </Box>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={{ base: '#FFFFFF', md: '#F9FAFB' }}>
      <Box maxW="1400px" mx="auto" px={{ base: '0', md: '24px' }} py={{ base: '0', md: '28px' }}>
        <Grid templateColumns={{ base: '1fr', lg: '280px minmax(0, 1fr) 320px' }} gap={{ base: '0', md: '24px' }} alignItems="start">
          <Box display={{ base: 'none', lg: 'block' }}>
            <CommunityProfileCard
              profileMode={defaultCommunityIdentity}
              onToggleProfileMode={toggleProfileMode}
              currentUser={COMMUNITY_CURRENT_USER}
            />
          </Box>

          <Flex direction="column" gap={{ base: '28px', md: '16px' }} minW="0">
            <Box
              overflow={{ base: 'visible', md: 'hidden' }}
              borderRadius={{ base: '0', md: '20px' }}
              bg="#FFFFFF"
              boxShadow={{ base: 'none', md: '0 12px 30px rgba(223, 223, 223, 0.9)' }}
              px={{ base: '20px', md: '24px' }}
              py={{ base: '20px', md: '20px' }}
            >
              <Flex align="center" justify="space-between" mb="10px">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  minW="24px"
                  h="24px"
                  p="0"
                  color="#888888"
                  _hover={{ bg: '#F9FAFB', color: '#888888' }}
                >
                  <Link href="/user/community" aria-label="커뮤니티 목록으로 이동">
                    <Flex align="center" justify="center">
                      <BackIcon size={24} />
                    </Flex>
                  </Link>
                </Button>

                {isOwnContent ? (
                  <Box ref={ownPostMenuRef} position="relative">
                    <Button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsOwnPostMenuOpen((prev) => !prev);
                      }}
                      minW="8"
                      h="8"
                      rounded="full"
                      bg="transparent"
                      p="0"
                      color="#888888"
                      _hover={{ bg: 'transparent', color: '#888888' }}
                      aria-label="내 게시글 메뉴 열기"
                    >
                      <MoreIcon size={24} />
                    </Button>

                    {isOwnPostMenuOpen ? (
                      <Box
                        position="absolute"
                        top="10"
                        right="0"
                        zIndex="20"
                        w="176px"
                        overflow="hidden"
                        rounded="xl"
                        borderWidth="1px"
                        borderColor="gray.200"
                        bg="white"
                        py="1.5"
                        boxShadow="lg"
                      >
                        <Button
                          type="button"
                          onClick={() => {
                            setIsOwnPostMenuOpen(false);
                            void handleRequestEditContent();
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
                          <PenIcon size={16} />
                          <Text>수정</Text>
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setIsOwnPostMenuOpen(false);
                            setDeleteTargetContent(content);
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
                          <Trash2 size={16} />
                          <Text>삭제</Text>
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setIsOwnPostMenuOpen(false);
                            setHideTargetContent(content);
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
                          <EyeClosedIcon size={16} />
                          <Text>숨김</Text>
                        </Button>
                      </Box>
                    ) : null}
                  </Box>
                ) : null}
              </Flex>

              <Flex align="center" gap="8px" mb="14px" wrap="wrap">
                {content.flags.isNotice ? (
                  <Box px="10px" py="4px" borderRadius="9999px" bg="#ECFDF5" color="#047857">
                    <Text fontSize="12px" fontWeight="700">
                      공지
                    </Text>
                  </Box>
                ) : null}
                {content.flags.isPromoted ? (
                  <Flex align="center" gap="5px" px="10px" py="4px" borderRadius="9999px" bg="#FEF2F2" color="#DC2626">
                    <Megaphone size={14} />
                    <Text fontSize="12px" fontWeight="700">
                      홍보
                    </Text>
                  </Flex>
                ) : null}
              </Flex>

              <Text fontSize="18px" fontWeight="700" lineHeight="1.45" color="#111827" mb="14px">
                {content.title}
              </Text>

              {resolvedTags.length > 0 ? (
              <Flex wrap="wrap" gap="8px" mb="16px">
                {resolvedTags.map((tag) => (
                  <UserTagBadge key={tag.id} tag={tag} />
                ))}
              </Flex>
            ) : null}

              <Flex
                as={canNavigateContentAuthor ? 'button' : 'div'}
                align="center"
                gap="12px"
                pb="18px"
                textAlign="left"
                cursor={canNavigateContentAuthor ? 'pointer' : 'default'}
                onClick={() => {
                  if (!content || !canNavigateContentAuthor) return;
                  navigateToAuthorPage(content.author.id);
                }}
                aria-label={canNavigateContentAuthor ? `${authorDisplay} 작성자 페이지로 이동` : undefined}
              >
                <Image
                  src={authorAvatar}
                  alt={authorDisplay}
                  w="44px"
                  h="44px"
                  borderRadius="9999px"
                  objectFit="cover"
                  flexShrink={0}
                />

                <Box minW="0">
                  <Flex align="center" gap="6px">
                    <Text fontSize="14px" fontWeight="700" color="#111827" lineClamp="1">
                      {authorDisplay}
                    </Text>
                    {!isAnonymousContent ? <CheckBadgeIcon size={16} color="#11B3E9" /> : null}
                  </Flex>
                  <Text mt="2px" fontSize="12px" color="#6B7280">
                    {authorMetaDisplay}
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

              <Flex align="center" justify="space-between" mt="24px" color="#6B7280">
                <Flex align="center" gap="16px" wrap="wrap">
                  <Flex align="center" gap="6px">
                    <EyeIcon size={20} />
                    <Text fontSize="14px">{content.stats.viewCount}</Text>
                  </Flex>
                  <Button
                    type="button"
                    onClick={() => {
                      void handleTogglePostLike();
                    }}
                    minW="auto"
                    h="auto"
                    bg="transparent"
                    p="0"
                    color={content.viewerState?.isLikedByMe ? '#F97316' : '#6B7280'}
                    _hover={{ bg: 'transparent', color: '#F97316' }}
                    disabled={isLikeSubmitting}
                  >
                    <Flex align="center" gap="6px">
                      {content.viewerState?.isLikedByMe ? <HeartFilledIcon size={20} /> : <HeartIcon size={20} />}
                      <Text fontSize="14px">{content.stats.likeCount}</Text>
                    </Flex>
                  </Button>
                  <Flex align="center" gap="6px" color={hasCommentedByMe ? 'orange.500' : 'inherit'}>
                    {hasCommentedByMe ? <CommentFilledIcon size={20} /> : <CommentIcon size={20} />}
                    <Text fontSize="14px">
                      {getCommentTotalCount(content.stats.commentCount, content.stats.replyCount)}
                    </Text>
                  </Flex>
                </Flex>

                <Flex align="center" gap="16px">
                  <Button
                    type="button"
                    minW="auto"
                    h="auto"
                    bg="transparent"
                    p="0"
                    color="#6B7280"
                    _hover={{ bg: 'transparent', color: '#3B82F6' }}
                    aria-label="공유"
                    title="공유하기"
                    onClick={() => {
                      void copyPostUrlToClipboard(content.id);
                    }}
                  >
                    <ShareIcon size={20} />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      void handleTogglePostSave();
                    }}
                    minW="auto"
                    h="auto"
                    bg="transparent"
                    p="0"
                    color={content.viewerState?.isSavedByMe ? '#F97316' : '#6B7280'}
                    _hover={{ bg: 'transparent', color: '#F97316' }}
                    disabled={isSaveSubmitting}
                  >
                    <Flex align="center" gap="6px">
                      {content.viewerState?.isSavedByMe ? (
                        <BookmarkFilledIcon size={20} />
                      ) : (
                        <BookmarkIcon size={20} />
                      )}
                    </Flex>
                  </Button>
                </Flex>
              </Flex>
            </Box>

            <Box
              overflow={{ base: 'visible', md: 'hidden' }}
              borderRadius={{ base: '0', md: '20px' }}
              bg="#FFFFFF"
              boxShadow={{ base: 'none', md: '0 12px 30px rgba(223, 223, 223, 0.9)' }}
            >
              <Box px={{ base: '20px', md: '24px' }} py={{ base: '0', md: '20px' }}>
                <Flex align="center" gap="6px" mb="16px">
                  <Text fontSize="16px" fontWeight="700" color="#111827">
                    댓글
                  </Text>
                  <Text fontSize="13px" color="#6B7280">
                    {getCommentTotalCount(content.stats.commentCount, content.stats.replyCount)}개
                  </Text>
                </Flex>

                {replyTargetId && replyTargetName ? (
                  <Flex mb="12px" align="center" justify="space-between" gap="12px">
                    <Text fontSize="14px" color="#4B5563" lineHeight="1.4">
                      <Text as="span" color="#FF6900">
                        @{replyTargetName}
                      </Text>
                      님에게 답글 작성하기
                    </Text>
                    <Button
                      type="button"
                      variant="ghost"
                      h="auto"
                      minW="auto"
                      flexShrink={0}
                      px="0"
                      py="0"
                      color="#FF6900"
                      fontSize="14px"
                      _hover={{ bg: 'transparent', color: '#E85A00' }}
                      onClick={handleCancelReply}
                    >
                      작성 취소
                    </Button>
                  </Flex>
                ) : null}

                {!isLoggedIn ? (
                  <Text fontSize="13px" color="#6B7280">
                    댓글을 작성하려면 로그인해주세요.
                  </Text>
                ) : (
                  <CommentEditor
                    textareaRef={commentTextareaRef}
                    value={commentValue}
                    onChange={setCommentValue}
                    onSubmit={() => {
                      if (replyTargetId) {
                        void handleCreateReply();
                        return;
                      }

                      void handleCreateComment();
                    }}
                    submitLabel={replyTargetId ? '답글 등록' : '댓글 등록'}
                    isSubmitting={replyTargetId ? isReplySubmitting : isCommentSubmitting}
                    placeholder={replyTargetId ? '답글을 입력하세요.' : '댓글을 입력하세요.'}
                    identity={commentIdentity}
                    onChangeIdentity={setCommentIdentity}
                    displayName={COMMUNITY_CURRENT_USER.name}
                    profileImageUrl={commentIdentity === 'real' ? COMMUNITY_CURRENT_USER.avatar : undefined}
                  />
                )}
              </Box>

              <Box px={{ base: '20px', md: '24px' }} py={{ base: '18px', md: '20px' }}>
                {isCommentsLoading ? (
                  <Flex minH="120px" align="center" justify="center" gap="10px" color="#6B7280">
                    <Spinner size="sm" />
                    <Text fontSize="13px">댓글을 불러오는 중입니다.</Text>
                  </Flex>
                ) : commentsError ? (
                  <Box borderWidth="1px" borderColor="#FECACA" bg="#FEF2F2" borderRadius="14px" px="16px" py="14px">
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
                        currentUserId={COMMUNITY_CURRENT_USER.accountId}
                        currentUserRole="user"
                        currentUserDisplayName={COMMUNITY_CURRENT_USER.name}
                        currentUserProfileImageUrl={commentIdentity === 'real' ? COMMUNITY_CURRENT_USER.avatar : undefined}
                        onReplyStart={(targetComment) => {
                          setReplyTargetId(targetComment.id);
                          setReplyTargetName(targetComment.author.displayName);
                          setCommentValue('');
                          setCommentIdentity(defaultCommunityIdentity);
                          window.requestAnimationFrame(() => {
                            commentTextareaRef.current?.focus();
                          });
                        }}
                        onUpdateComment={handleUpdateComment}
                        onArchiveToggle={handleArchiveComment}
                        onDeleteComment={handleRequestDeleteComment}
                        onToggleLike={handleToggleCommentLike}
                        onAuthorClick={navigateToAuthorPage}
                      />
                    ))}
                  </Flex>
                ) : (
                  <Box borderWidth="1px" borderColor="#E5E7EB" borderRadius="14px" px="16px" py="18px" bg="#F9FAFB">
                    <Text fontSize="13px" color="#6B7280">
                      아직 등록된 댓글이 없습니다.
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          </Flex>

          <Flex direction="column" gap="16px" display={{ base: 'none', lg: 'flex' }}>
            {!isAnonymousContent ? (
              <AuthorProfileCard
                author={{
                  id: content.author.id,
                  name: content.author.displayName,
                  nickname: content.author.displayName,
                  avatar: COMMUNITY_CURRENT_USER.avatar,
                }}
                displayMode="real"
                currentUserAccountId={COMMUNITY_CURRENT_USER.accountId}
              />
            ) : null}

            {!isAnonymousContent && authorOtherPosts.length > 0 ? (
              <Box
                borderRadius="20px"
                bg="#FFFFFF"
                boxShadow="0 12px 30px rgba(223, 223, 223, 0.9)"
                px="18px"
                py="18px"
              >
                <Text fontSize="15px" fontWeight="700" color="#111827" mb="12px">
                  작성자의 다른 글
                </Text>
                <Flex direction="column" gap="10px">
                  {authorOtherPosts.map((post) => (
                    <Box key={post.id} borderBottom="1px solid" borderColor="#F3F4F6" pb="10px" _last={{ borderBottom: 'none', pb: 0 }}>
                      <ChakraLink asChild display="block" w="100%" _hover={{ textDecoration: 'none' }}>
                        <Link href={`/user/community/post/${post.id}`}>
                          <Flex align="center" justify="space-between" gap="12px" w="100%">
                            <Box minW="0" flex="1">
                              <Text display="block" fontSize="13px" fontWeight="600" color="#111827">
                                {post.title}
                              </Text>
                              <Text display="block" mt="4px" fontSize="12px" color="#9CA3AF">
                                {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                              </Text>
                            </Box>
                            {post.images?.[0] ? (
                              <Image
                                src={post.images[0]}
                                alt={`${post.title} 대표 이미지`}
                                boxSize="64px"
                                flexShrink={0}
                                borderRadius="12px"
                                objectFit="cover"
                              />
                            ) : null}
                          </Flex>
                        </Link>
                      </ChakraLink>
                    </Box>
                  ))}
                </Flex>
              </Box>
            ) : null}
          </Flex>
        </Grid>
      </Box>

      <BlockedWordAlertModal
        isOpen={isBlockedWordModalOpen}
        onClose={() => setIsBlockedWordModalOpen(false)}
        title={blockedWordModalTitle}
        description={blockedWordModalDescription}
        matchedKeywords={matchedBlockedKeywords}
        sourceText={blockedWordSourceText}
      />
      <ActivitySuspendedModal
        isOpen={isActivitySuspendedModalOpen}
        onClose={() => setIsActivitySuspendedModalOpen(false)}
      />

      <WritePostModal
        isOpen={isWriteModalOpen}
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingContent(null);
        }}
        onUpdated={handleUpdatedContent}
        editingContent={editingContent}
        currentUser={COMMUNITY_CURRENT_USER}
      />

      <ActionConfirmModal
        isOpen={Boolean(deleteTargetContent)}
        title="게시글을 삭제하시겠습니까?"
        description="삭제한 게시글은 복구할 수 없습니다."
        confirmLabel="삭제"
        isLoading={isDeletingContent}
        onCancel={() => setDeleteTargetContent(null)}
        onConfirm={handleConfirmDeleteContent}
      />

      <ActionConfirmModal
        isOpen={Boolean(hideTargetContent)}
        title="게시글을 숨기시겠습니까?"
        description="숨김 처리된 게시글은 커뮤니티 메인에서 보이지 않고, 마이페이지의 숨김 탭에서 확인할 수 있습니다."
        confirmLabel="숨김"
        isLoading={isHidingContent}
        onCancel={() => setHideTargetContent(null)}
        onConfirm={handleConfirmHideContent}
      />

      <ActionConfirmModal
        isOpen={Boolean(deleteTargetComment)}
        title="댓글을 삭제하시겠습니까?"
        description="삭제한 댓글은 복구할 수 없습니다."
        confirmLabel="삭제"
        isLoading={isDeletingComment}
        onCancel={() => setDeleteTargetComment(null)}
        onConfirm={handleConfirmDeleteComment}
      />
    </Box>
  );
}

'use client';

import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { Archive, CornerDownRight, Heart, MoreHorizontal, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import CommentEditor from '@/app/user/components/comment/comment-editor';
import PenIcon from '@/app/user/components/icons/PenIcon';
import type { CommunityComment } from '@/types/community-comment';

type CommentItemProps = {
  comment: CommunityComment;
  depth?: 0 | 1;
  currentUserId?: string;
  currentUserRole?: 'admin' | 'user';
  currentUserDisplayName?: string;
  currentUserProfileImageUrl?: string;
  replyTargetId: string | null;
  replyDraft: string;
  replyIdentity?: 'real' | 'anonymous';
  isReplySubmitting: boolean;
  onReplyDraftChange: (value: string) => void;
  onReplyIdentityChange?: (value: 'real' | 'anonymous') => void;
  onReplyStart: (comment: CommunityComment) => void;
  onReplyCancel: () => void;
  onReplySubmit: (comment: CommunityComment) => Promise<void>;
  onUpdateComment: (commentId: string, content: string) => Promise<boolean>;
  onArchiveToggle: (commentId: string, nextStatus: 'published' | 'archived') => Promise<void>;
  onDeleteComment: (comment: CommunityComment) => void;
  onToggleLike?: (comment: CommunityComment) => Promise<CommunityComment | void>;
};

function formatCommentDate(dateString: string) {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitial(name: string) {
  return name.slice(0, 1).toUpperCase();
}

function getArchivedMessage(comment: CommunityComment) {
  if (comment.archivedBy === 'author') {
    return '작성자에 의해 보관된 댓글입니다.';
  }

  if (comment.archivedBy === 'admin') {
    return '관리자에 의해 보관된 댓글입니다.';
  }

  return '보관된 댓글입니다.';
}

function getDeletedMessage(comment: CommunityComment) {
  if (comment.deletedBy === 'author') {
    return '작성자에 의해 삭제된 댓글입니다.';
  }

  if (comment.deletedBy === 'admin') {
    return '관리자에 의해 삭제된 댓글입니다.';
  }

  return '삭제된 댓글입니다.';
}

export default function CommentItem({
  comment,
  depth = 0,
  currentUserId,
  currentUserRole = 'user',
  currentUserDisplayName = '사용자',
  currentUserProfileImageUrl,
  replyTargetId,
  replyDraft,
  replyIdentity = 'real',
  isReplySubmitting,
  onReplyDraftChange,
  onReplyIdentityChange,
  onReplyStart,
  onReplyCancel,
  onReplySubmit,
  onUpdateComment,
  onArchiveToggle,
  onDeleteComment,
  onToggleLike,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isLikedByMe, setIsLikedByMe] = useState(comment.isLikedByMe);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const actionRootRef = useRef<HTMLDivElement | null>(null);

  const isDeleted = comment.status === 'deleted';
  const isArchived = comment.status === 'archived';
  const isReplyComposerOpen = replyTargetId === comment.id;
  const canArchive = currentUserRole === 'admin';

  const isMine = currentUserId ? comment.author.id === currentUserId : comment.author.type === 'admin';
  const canManage = !isDeleted && (isMine || currentUserRole === 'admin');

  useEffect(() => {
    if (!isActionMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (actionRootRef.current?.contains(target)) return;

      setIsActionMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsActionMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActionMenuOpen]);

  useEffect(() => {
    setIsLikedByMe(comment.isLikedByMe);
    setLikeCount(comment.likeCount);
  }, [comment.isLikedByMe, comment.likeCount]);

  const handleUpdate = async () => {
    if (isUpdating) return;
    try {
      setIsUpdating(true);
      const isUpdated = await onUpdateComment(comment.id, editValue);
      if (isUpdated) {
        setIsEditing(false);
        setIsActionMenuOpen(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (isArchiving) return;

    try {
      setIsArchiving(true);
      await onArchiveToggle(comment.id, isArchived ? 'published' : 'archived');
      setIsActionMenuOpen(false);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleToggleLike = async () => {
    if (isLikeSubmitting) return;

    const nextIsLiked = !isLikedByMe;
    const previousIsLiked = isLikedByMe;
    const previousLikeCount = likeCount;

    setIsLikedByMe(nextIsLiked);
    setLikeCount((current) => Math.max(0, current + (nextIsLiked ? 1 : -1)));

    if (!onToggleLike) return;

    try {
      setIsLikeSubmitting(true);
      const nextComment = await onToggleLike({
        ...comment,
        isLikedByMe: previousIsLiked,
        likeCount: previousLikeCount,
      });

      if (nextComment) {
        setIsLikedByMe(nextComment.isLikedByMe);
        setLikeCount(nextComment.likeCount);
      }
    } catch {
      setIsLikedByMe(previousIsLiked);
      setLikeCount(previousLikeCount);
    } finally {
      setIsLikeSubmitting(false);
    }
  };

  return (
    <Box>
      <Flex align="flex-start" gap={depth === 0 ? '12px' : '10px'}>
        <Flex
          align="center"
          justify="center"
          w="34px"
          h="34px"
          mt="2px"
          borderRadius="9999px"
          bg={
            isMine
              ? '#FB923C'
              : comment.author.visibility === 'anonymous'
              ? '#F3F4F6'
              : '#E0F2FE'
          }
          color={
            isMine
              ? '#FFFFFF'
              : comment.author.visibility === 'anonymous'
              ? '#D1D5DB'
              : '#64748B'
          }
          fontSize="12px"
          fontWeight="700"
          flexShrink={0}
        >
          {getInitial(comment.author.displayName)}
        </Flex>

        <Box flex="1" minW="0">
          <Box
            position="relative"
            borderRadius="10px"
            bg={isMine ? '#FFF1E6' : '#F8FAFC'}
            px="14px"
            py="12px"
          >
            <Flex align="flex-start" justify="space-between" gap="10px">
              <Box minW="0">
                <Flex align="center" gap="8px" wrap="wrap">
                  <Text fontSize="13px" fontWeight="700" color="#111827">
                    {comment.author.displayName}
                  </Text>
                  {isDeleted ? (
                    <Box px="8px" py="2px" borderRadius="9999px" bg="#F3F4F6">
                      <Text fontSize="11px" fontWeight="700" color="#6B7280">
                        삭제됨
                      </Text>
                    </Box>
                  ) : isArchived ? (
                    <Box px="8px" py="2px" borderRadius="9999px" bg="#F3F4F6">
                      <Text fontSize="11px" fontWeight="700" color="#6B7280">
                        보관됨
                      </Text>
                    </Box>
                  ) : null}
                </Flex>

                <Text mt="1px" fontSize="11px" color="#9CA3AF">
                  {formatCommentDate(comment.createdAt)}
                </Text>
              </Box>

              {!isDeleted ? (
                canManage ? (
                  <Box ref={actionRootRef} position="relative" flexShrink={0}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      minW="24px"
                      h="24px"
                      px="2px"
                      color="#9CA3AF"
                      _hover={{ bg: 'transparent', color: '#6B7280' }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsActionMenuOpen((prev) => !prev);
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </Button>

                    {isActionMenuOpen ? (
                      <Box
                        position="absolute"
                        top="30px"
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
                          {canArchive ? (
                            <Button
                              type="button"
                              variant="ghost"
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
                              disabled={isArchiving}
                              _hover={{ bg: 'gray.50' }}
                              onClick={() => {
                                void handleArchiveToggle();
                              }}
                            >
                              <Flex align="center" gap="8px">
                                <Archive size={14} />
                                <Text as="span">{isArchived ? '노출 전환' : '보관'}</Text>
                              </Flex>
                            </Button>
                          ) : null}

                          {!isArchived ? (
                            <Button
                              type="button"
                              variant="ghost"
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
                              onClick={() => {
                                setEditValue(comment.content);
                                setIsEditing(true);
                                setIsActionMenuOpen(false);
                              }}
                            >
                              <Flex align="center" gap="8px">
                                <PenIcon size={14} />
                                <Text as="span">수정</Text>
                              </Flex>
                            </Button>
                          ) : null}

                          <Button
                            type="button"
                            variant="ghost"
                            justifyContent="flex-start"
                            gap="2"
                            w="full"
                            rounded="none"
                            bg="transparent"
                            px="3"
                            py="2"
                            fontSize="sm"
                            fontWeight="400"
                            color="#DC2626"
                            _hover={{ bg: '#FEF2F2' }}
                            onClick={() => {
                              setIsActionMenuOpen(false);
                              onDeleteComment(comment);
                            }}
                          >
                            <Flex align="center" gap="8px">
                              <Trash2 size={14} />
                              <Text as="span">삭제</Text>
                            </Flex>
                          </Button>
                        </Box>
                    ) : null}
                  </Box>
                ) : null
              ) : null}
            </Flex>

            <Box mt="8px">
              {isEditing && !isArchived ? (
                <CommentEditor
                  value={editValue}
                  onChange={setEditValue}
                  onSubmit={() => {
                    void handleUpdate();
                  }}
                  submitLabel="수정 저장"
                  onCancel={() => {
                    setEditValue(comment.content);
                    setIsEditing(false);
                  }}
                  isSubmitting={isUpdating}
                  autoFocus
                />
              ) : (
                <Text
                  fontSize="13px"
                  lineHeight="1.65"
                  color={isDeleted || isArchived ? '#9CA3AF' : '#374151'}
                  whiteSpace="pre-wrap"
                >
                  {isDeleted
                    ? getDeletedMessage(comment)
                    : isArchived
                      ? getArchivedMessage(comment)
                      : comment.content}
                </Text>
              )}
            </Box>

            {!isDeleted && !isArchived ? (
              <Flex align="center" gap="12px" mt="8px" pl="2px">
                <Button
                  type="button"
                  variant="ghost"
                  h="24px"
                  minW="auto"
                  px="0"
                  color="#6B7280"
                  fontSize="12px"
                  fontWeight="500"
                  _hover={{ bg: 'transparent', color: '#374151' }}
                  disabled={isLikeSubmitting}
                  onClick={() => {
                    void handleToggleLike();
                  }}
                >
                  <Flex align="center" gap="4px">
                    <Heart
                      size={13}
                      color={isLikedByMe ? '#F97316' : '#9CA3AF'}
                      fill={isLikedByMe ? '#F97316' : 'none'}
                    />
                    <Text as="span">좋아요 {likeCount}</Text>
                  </Flex>
                </Button>

                {depth === 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    h="24px"
                    minW="auto"
                    px="0"
                    color="#6B7280"
                    fontSize="12px"
                    fontWeight="500"
                    _hover={{ bg: 'transparent', color: '#374151' }}
                    onClick={() => onReplyStart(comment)}
                  >
                    답글 달기
                  </Button>
                ) : null}
              </Flex>
            ) : null}
          </Box>

          {!isDeleted && !isArchived && isReplyComposerOpen ? (
            <Box mt="14px" pl={{ base: '0', md: '8px' }}>
              <Flex align="center" gap="6px" mb="8px" color="#6B7280">
                <CornerDownRight size={14} />
                <Text fontSize="12px">이 댓글에 답글 작성 중</Text>
              </Flex>

              <CommentEditor
                value={replyDraft}
                onChange={onReplyDraftChange}
                onSubmit={() => {
                  void onReplySubmit(comment);
                }}
                submitLabel="답글 등록"
                onCancel={onReplyCancel}
                isSubmitting={isReplySubmitting}
                placeholder="답글을 입력하세요."
                autoFocus
                identity={replyIdentity}
                onChangeIdentity={onReplyIdentityChange}
                displayName={currentUserDisplayName}
                profileImageUrl={currentUserProfileImageUrl}
              />
            </Box>
          ) : null}

          {comment.replies.length > 0 ? (
            <Flex direction="column" gap="10px" mt="14px" pl={{ base: '0', md: '20px' }}>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={1}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  currentUserDisplayName={currentUserDisplayName}
                  currentUserProfileImageUrl={currentUserProfileImageUrl}
                  replyTargetId={replyTargetId}
                  replyDraft={replyDraft}
                  replyIdentity={replyIdentity}
                  isReplySubmitting={isReplySubmitting}
                  onReplyDraftChange={onReplyDraftChange}
                  onReplyIdentityChange={onReplyIdentityChange}
                  onReplyStart={onReplyStart}
                  onReplyCancel={onReplyCancel}
                  onReplySubmit={onReplySubmit}
                  onUpdateComment={onUpdateComment}
                  onArchiveToggle={onArchiveToggle}
                  onDeleteComment={onDeleteComment}
                  onToggleLike={onToggleLike}
                />
              ))}
            </Flex>
          ) : null}
        </Box>
      </Flex>
    </Box>
  );
}

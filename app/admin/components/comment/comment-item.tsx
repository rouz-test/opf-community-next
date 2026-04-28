'use client';

import { Box, Button, Flex, Portal, Text } from '@chakra-ui/react';
import { Archive, CornerDownRight, Heart, MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import CommentEditor from '@/app/admin/components/comment/comment-editor';
import type { CommunityComment } from '@/types/community-comment';

type CommentItemProps = {
  comment: CommunityComment;
  depth?: 0 | 1;
  currentUserId?: string;
  currentUserRole?: 'admin' | 'user';
  replyTargetId: string | null;
  replyDraft: string;
  isReplySubmitting: boolean;
  onReplyDraftChange: (value: string) => void;
  onReplyStart: (comment: CommunityComment) => void;
  onReplyCancel: () => void;
  onReplySubmit: (comment: CommunityComment) => Promise<void>;
  onUpdateComment: (commentId: string, content: string) => Promise<boolean>;
  onArchiveToggle: (commentId: string, nextStatus: 'published' | 'archived') => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
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
  replyTargetId,
  replyDraft,
  isReplySubmitting,
  onReplyDraftChange,
  onReplyStart,
  onReplyCancel,
  onReplySubmit,
  onUpdateComment,
  onArchiveToggle,
  onDeleteComment,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isLikedByMe, setIsLikedByMe] = useState(comment.isLikedByMe);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const actionRootRef = useRef<HTMLDivElement | null>(null);
  const actionPanelRef = useRef<HTMLDivElement | null>(null);

  const isDeleted = comment.status === 'deleted';
  const isArchived = comment.status === 'archived';
  const isReplyComposerOpen = replyTargetId === comment.id;

  const isMine = currentUserId ? comment.author.id === currentUserId : comment.author.type === 'admin';
  const canManage = !isDeleted && (isMine || currentUserRole === 'admin');

  useEffect(() => {
    if (!isActionMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (actionRootRef.current?.contains(target)) return;
      if (actionPanelRef.current?.contains(target)) return;

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

  const handleDelete = async () => {
    const confirmed = window.confirm('이 댓글을 삭제하시겠습니까?');
    if (!confirmed) return;
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await onDeleteComment(comment.id);
      setIsActionMenuOpen(false);
    } finally {
      setIsDeleting(false);
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

  const handleToggleLike = () => {
    const nextIsLiked = !isLikedByMe;

    setIsLikedByMe(nextIsLiked);
    setLikeCount((current) => Math.max(0, current + (nextIsLiked ? 1 : -1)));
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
                      <Portal>
                        <Box
                          ref={actionPanelRef}
                          position="fixed"
                          top={`${actionRootRef.current?.getBoundingClientRect().bottom ?? 0}px`}
                          left={`${Math.max(8, (actionRootRef.current?.getBoundingClientRect().right ?? 0) - 132)}px`}
                          zIndex="popover"
                          minW="132px"
                          borderWidth="1px"
                          borderColor="#E5E7EB"
                          borderRadius="12px"
                          bg="#FFFFFF"
                          boxShadow="0 12px 24px rgba(15, 23, 42, 0.12)"
                          py="6px"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            justifyContent="flex-start"
                            w="100%"
                            h="34px"
                            px="12px"
                            borderRadius="0"
                            fontSize="13px"
                            fontWeight="600"
                            color="#374151"
                            disabled={isArchiving}
                            _hover={{ bg: '#F9FAFB' }}
                            onClick={() => {
                              void handleArchiveToggle();
                            }}
                          >
                            <Flex align="center" gap="8px">
                              <Archive size={14} />
                              <Text as="span">{isArchived ? '노출 전환' : '보관'}</Text>
                            </Flex>
                          </Button>

                          {!isArchived ? (
                            <Button
                            type="button"
                            variant="ghost"
                            justifyContent="flex-start"
                            w="100%"
                            h="34px"
                            px="12px"
                            borderRadius="0"
                            fontSize="13px"
                            fontWeight="600"
                            color="#374151"
                            _hover={{ bg: '#F9FAFB' }}
                            onClick={() => {
                              setEditValue(comment.content);
                              setIsEditing(true);
                              setIsActionMenuOpen(false);
                            }}
                          >
                            <Flex align="center" gap="8px">
                              <PencilLine size={14} />
                              <Text as="span">수정</Text>
                            </Flex>
                          </Button>
                          ) : null}

                          <Button
                            type="button"
                            variant="ghost"
                            justifyContent="flex-start"
                            w="100%"
                            h="34px"
                            px="12px"
                            borderRadius="0"
                            fontSize="13px"
                            fontWeight="600"
                            color="#DC2626"
                            disabled={isDeleting}
                            _hover={{ bg: '#FEF2F2' }}
                            onClick={() => {
                              void handleDelete();
                            }}
                          >
                            <Flex align="center" gap="8px">
                              <Trash2 size={14} />
                              <Text as="span">삭제</Text>
                            </Flex>
                          </Button>
                        </Box>
                      </Portal>
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
                  onClick={handleToggleLike}
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
                  replyTargetId={replyTargetId}
                  replyDraft={replyDraft}
                  isReplySubmitting={isReplySubmitting}
                  onReplyDraftChange={onReplyDraftChange}
                  onReplyStart={onReplyStart}
                  onReplyCancel={onReplyCancel}
                  onReplySubmit={onReplySubmit}
                  onUpdateComment={onUpdateComment}
                  onArchiveToggle={onArchiveToggle}
                  onDeleteComment={onDeleteComment}
                />
              ))}
            </Flex>
          ) : null}
        </Box>
      </Flex>
    </Box>
  );
}

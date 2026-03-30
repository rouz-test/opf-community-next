

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import type { Comment } from '@/data/mockCommunityPosts';

type LocalComment = Omit<Comment, 'replies'> & {
  isDeleted?: boolean;
  isEdited?: boolean;
  authorDisplayMode?: 'real' | 'nickname';
  replies?: LocalComment[];
};

const getProfileActorId = (authorLike?: { id?: string; profileId?: string }) =>
  authorLike?.profileId ?? authorLike?.id ?? '';

type CommunityCommentsSectionProps = {
  postId: string;
  postType: string;
  currentUser: {
    name: string;
    nickname: string;
    avatar: string;
  };
  profileMode: 'real' | 'nickname';
  mockComments: Comment[];
};

export function CommunityCommentsSection({
  postId,
  postType,
  currentUser,
  profileMode,
  mockComments,
}: CommunityCommentsSectionProps) {
  const [isCommentProfileMenuOpen, setIsCommentProfileMenuOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const isCommentTooLong = commentText.length > 1000;
  const [replyTo, setReplyTo] = useState<{ commentId: string; nickname: string } | null>(null);
  const [comments, setComments] = useState<LocalComment[]>(
    mockComments.filter((c) => c.postId === postId) as LocalComment[],
  );
  const [localProfileMode, setLocalProfileMode] = useState<'real' | 'nickname'>(profileMode);

  useEffect(() => {
    setLocalProfileMode(profileMode);
  }, [profileMode]);

  const handleCommentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!commentText.trim() || isCommentTooLong) return;

    const newComment: LocalComment = {
      id: `comment-${Date.now()}`,
      postId,
      parentId: replyTo?.commentId,
      author: {
        id: 'current-user',
        profileId: 'current-user',
        mode: localProfileMode,
        name: currentUser.name,
        nickname: localProfileMode === 'real' ? currentUser.name : currentUser.nickname,
        avatar: currentUser.avatar,
      },
      authorDisplayMode: localProfileMode,
      content: commentText,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLikedByMe: false,
    };

    if (replyTo) {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === replyTo.commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment],
            };
          }
          return comment;
        }),
      );
    } else {
      setComments((prev) => [...prev, newComment]);
    }

    setCommentText('');
    setReplyTo(null);
    setIsCommentProfileMenuOpen(false);
  };

  const handleUpdateComment = (commentId: string, content: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              content,
              isEdited: true,
            }
          : comment,
      ),
    );
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) =>
      prev.flatMap((comment) => {
        if (comment.id !== commentId) return [comment];

        if (comment.replies && comment.replies.length > 0) {
          return [
            {
              ...comment,
              isDeleted: true,
              content: '삭제된 댓글입니다.',
            },
          ];
        }

        return [];
      }),
    );
  };

  const handleUpdateReply = (commentId: string, replyId: string, content: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id !== commentId) return comment;

        return {
          ...comment,
          replies: (comment.replies || []).map((reply) =>
            reply.id === replyId
              ? {
                  ...reply,
                  content,
                  isEdited: true,
                }
              : reply,
          ),
        };
      }),
    );
  };

  const handleDeleteReply = (commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id !== commentId) return comment;

        return {
          ...comment,
          replies: (comment.replies || []).filter((reply) => reply.id !== replyId),
        };
      }),
    );
  };

  const handleToggleCommentAuthorMode = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              authorDisplayMode:
                (comment.authorDisplayMode ?? 'nickname') === 'nickname' ? 'real' : 'nickname',
            }
          : comment,
      ),
    );
  };

  const handleToggleReplyAuthorMode = (commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id !== commentId) return comment;

        return {
          ...comment,
          replies: (comment.replies || []).map((reply) =>
            reply.id === replyId
              ? {
                  ...reply,
                  authorDisplayMode:
                    (reply.authorDisplayMode ?? 'nickname') === 'nickname' ? 'real' : 'nickname',
                }
              : reply,
          ),
        };
      }),
    );
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">
        댓글 {comments.length}개
      </h2>

      {postType !== 'notice' && (
        <form onSubmit={handleCommentSubmit} className="mb-6">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                <span className="font-medium text-orange-600">@{replyTo.nickname}</span>님에게 답글 작성 중
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                취소
              </button>
            </div>
          )}

          <div className="flex items-start gap-3">
            <img
              src={currentUser.avatar}
              alt={localProfileMode === 'real' ? currentUser.name : currentUser.nickname}
              className="hidden h-10 w-10 rounded-full object-cover sm:block"
            />
            <div className="w-full flex-1">
              <div className="relative mb-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCommentProfileMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-700 transition-colors hover:bg-gray-50 sm:px-3 sm:py-1.5 sm:text-xs"
                >
                  <span className="font-medium">댓글 작성 프로필</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                    {localProfileMode === 'real' ? '실명' : '닉네임'}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>

                {isCommentProfileMenuOpen && (
                  <div className="absolute left-0 top-full z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setLocalProfileMode('nickname');
                        setIsCommentProfileMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                        localProfileMode === 'nickname' ? 'text-orange-600' : 'text-gray-700'
                      }`}
                    >
                      <span>닉네임으로 작성</span>
                      {localProfileMode === 'nickname' && <span>✓</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalProfileMode('real');
                        setIsCommentProfileMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                        localProfileMode === 'real' ? 'text-orange-600' : 'text-gray-700'
                      }`}
                    >
                      <span>실명으로 작성</span>
                      {localProfileMode === 'real' && <span>✓</span>}
                    </button>
                  </div>
                )}
              </div>

              <textarea
                placeholder={replyTo ? `@${replyTo.nickname}님에게 답글을 입력하세요...` : '댓글을 입력하세요...'}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                rows={3}
                className={`mb-2 w-full rounded-lg border px-3 py-2 text-[13px] text-gray-700 outline-none transition-colors placeholder:text-gray-400 sm:text-sm ${
                  isCommentTooLong
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-orange-400'
                }`}
              />
              {isCommentTooLong && (
                <p className="mb-2 text-xs text-red-500">
                  최대 입력 가능 글자 수는 1,000자 입니다.
                </p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-gray-500 sm:text-xs">
                  현재 <span className="font-medium text-gray-700">{localProfileMode === 'real' ? currentUser.name : currentUser.nickname}</span>으로 작성됩니다.
                </p>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
                  disabled={!commentText.trim() || isCommentTooLong}
                >
                  {replyTo ? '답글 작성' : '댓글 작성'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={(commentId, nickname) => setReplyTo({ commentId, nickname })}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onToggleCommentAuthorMode={handleToggleCommentAuthorMode}
            onUpdateReply={handleUpdateReply}
            onDeleteReply={handleDeleteReply}
            onToggleReplyAuthorMode={handleToggleReplyAuthorMode}
          />
        ))}

        {comments.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
          </div>
        )}
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  onReply,
  onUpdateComment,
  onDeleteComment,
  onToggleCommentAuthorMode,
  onUpdateReply,
  onDeleteReply,
  onToggleReplyAuthorMode,
}: {
  comment: LocalComment;
  onReply: (commentId: string, nickname: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onToggleCommentAuthorMode: (commentId: string) => void;
  onUpdateReply: (commentId: string, replyId: string, content: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
  onToggleReplyAuthorMode: (commentId: string, replyId: string) => void;
}) {
  const [isLiked, setIsLiked] = useState(comment.isLikedByMe);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setEditText(comment.content);
  }, [comment.content]);

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  };

  const displayName =
    (comment.authorDisplayMode ?? 'nickname') === 'real' ? comment.author.name : comment.author.nickname;

  const router = useRouter();

  const handleCommentAuthorClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/community/author/${getProfileActorId(comment.author)}`);
  };

  return (
    <div className="space-y-3">
      {comment.isDeleted ? (
        <div className="rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-400">
          삭제된 댓글입니다.
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCommentAuthorClick}
            className="flex-shrink-0 rounded-full"
            aria-label={`${displayName} 작성자 페이지로 이동`}
          >
            <img
              src={comment.author.avatar}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          </button>
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="rounded-lg bg-gray-50 p-3">
                <textarea
                  value={editText}
                  onChange={(event) => setEditText(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-orange-400"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(comment.content);
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editText.trim()) return;
                      onUpdateComment(comment.id, editText.trim());
                      setIsEditing(false);
                    }}
                    className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleCommentAuthorClick}
                      className="flex min-w-0 items-center gap-2 text-left"
                      aria-label={`${displayName} 작성자 페이지로 이동`}
                    >
                      <span className="text-sm font-medium text-gray-900">{displayName}</span>
                      <span className="text-xs text-gray-500">{formatCommentDate(comment.createdAt)}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      {comment.isEdited && (
                        <span className="shrink-0 text-[11px] text-gray-400">수정됨</span>
                      )}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsMenuOpen((prev) => !prev)}
                          className="text-gray-400 transition-colors hover:text-gray-600"
                          aria-label="댓글 더보기"
                        >
                          ⋯
                        </button>
                        {isMenuOpen && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditing(true);
                                setIsMenuOpen(false);
                              }}
                              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsDeleteConfirmOpen(true);
                                setIsMenuOpen(false);
                              }}
                              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              삭제
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onToggleCommentAuthorMode(comment.id);
                                setIsMenuOpen(false);
                              }}
                              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {(comment.authorDisplayMode ?? 'nickname') === 'nickname'
                                ? '실명으로 전환'
                                : '닉네임으로 전환'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">{comment.content}</p>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLiked(!isLiked);
                      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
                    }}
                    className={`flex items-center gap-1 ${isLiked ? 'text-orange-600' : 'text-gray-500'} hover:text-orange-600`}
                  >
                    <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
                    좋아요 {likeCount > 0 && likeCount}
                  </button>
                  <button
                    type="button"
                    onClick={() => onReply(comment.id, displayName)}
                    className="text-gray-500 hover:text-orange-600"
                  >
                    답글
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-5 space-y-2 sm:ml-12 sm:space-y-3">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              parentCommentId={comment.id}
              reply={reply}
              formatCommentDate={formatCommentDate}
              onUpdateReply={onUpdateReply}
              onDeleteReply={onDeleteReply}
              onToggleReplyAuthorMode={onToggleReplyAuthorMode}
            />
          ))}
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setIsDeleteConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900">댓글을 삭제하시겠습니까?</h3>
            <p className="mt-2 text-sm text-gray-500">
              삭제 후에는 현재 화면에서 댓글이 제거되거나 삭제된 댓글 상태로 표시됩니다.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteComment(comment.id);
                  setIsDeleteConfirmOpen(false);
                }}
                className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReplyItem({
  parentCommentId,
  reply,
  formatCommentDate,
  onUpdateReply,
  onDeleteReply,
  onToggleReplyAuthorMode,
}: {
  parentCommentId: string;
  reply: LocalComment;
  formatCommentDate: (dateString: string) => string;
  onUpdateReply: (commentId: string, replyId: string, content: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
  onToggleReplyAuthorMode: (commentId: string, replyId: string) => void;
}) {
  const [isLiked, setIsLiked] = useState(reply.isLikedByMe);
  const [likeCount, setLikeCount] = useState(reply.likes);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.content);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setEditText(reply.content);
  }, [reply.content]);

  const displayName =
    (reply.authorDisplayMode ?? 'nickname') === 'real' ? reply.author.name : reply.author.nickname;

  const router = useRouter();

  const handleReplyAuthorClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/community/author/${getProfileActorId(reply.author)}`);
  };

  return (
    <div className="flex gap-2 sm:gap-3">
      <button
        type="button"
        onClick={handleReplyAuthorClick}
        className="flex-shrink-0 rounded-full"
        aria-label={`${displayName} 작성자 페이지로 이동`}
      >
        <img
          src={reply.author.avatar}
          alt={displayName}
          className="h-7 w-7 rounded-full object-cover sm:h-8 sm:w-8"
        />
      </button>
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <div className="rounded-lg bg-gray-50 p-2.5 sm:p-3">
            <textarea
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] text-gray-700 outline-none transition-colors focus:border-orange-400 sm:text-sm"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(reply.content);
                }}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] text-gray-600 sm:text-xs"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editText.trim()) return;
                  onUpdateReply(parentCommentId, reply.id, editText.trim());
                  setIsEditing(false);
                }}
                className="rounded-lg bg-orange-500 px-3 py-1.5 text-[11px] font-medium text-white sm:text-xs"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-lg bg-gray-50 p-2.5 sm:p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={handleReplyAuthorClick}
                  className="flex min-w-0 items-center gap-1.5 text-left sm:gap-2"
                  aria-label={`${displayName} 작성자 페이지로 이동`}
                >
                  <span className="text-[13px] font-medium text-gray-900 sm:text-sm">{displayName}</span>
                  <span className="text-[11px] text-gray-500 sm:text-xs">{formatCommentDate(reply.createdAt)}</span>
                </button>
                <div className="flex items-center gap-2">
                  {reply.isEdited && (
                    <span className="shrink-0 text-[10px] text-gray-400 sm:text-[11px]">수정됨</span>
                  )}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen((prev) => !prev)}
                      className="text-gray-400 transition-colors hover:text-gray-600"
                      aria-label="대댓글 더보기"
                    >
                      ⋯
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(true);
                            setIsMenuOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDeleteConfirmOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          삭제
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onToggleReplyAuthorMode(parentCommentId, reply.id);
                            setIsMenuOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {(reply.authorDisplayMode ?? 'nickname') === 'nickname'
                            ? '실명으로 전환'
                            : '닉네임으로 전환'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-[13px] text-gray-700 sm:text-sm">{reply.content}</p>
            </div>
            <div className="mt-1.5 flex items-center gap-2.5 text-[11px] sm:mt-2 sm:gap-3 sm:text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsLiked(!isLiked);
                  setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
                }}
                className={`flex items-center gap-1 ${isLiked ? 'text-orange-600' : 'text-gray-500'} hover:text-orange-600`}
              >
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
                좋아요 {likeCount > 0 && likeCount}
              </button>
            </div>
          </>
        )}

        {isDeleteConfirmOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={() => setIsDeleteConfirmOpen(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-gray-900">댓글을 삭제하시겠습니까?</h3>
              <p className="mt-2 text-sm text-gray-500">
                삭제 후에는 현재 화면에서 댓글이 제거됩니다.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteReply(parentCommentId, reply.id);
                    setIsDeleteConfirmOpen(false);
                  }}
                  className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
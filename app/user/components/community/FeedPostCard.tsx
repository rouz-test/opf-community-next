'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Pencil,
  Trash2,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/app/user/components/providers/AuthProvider';
import { type CommunityPost } from '@/data/mockCommunityPosts';

type FeedPostCardProps = {
  post: CommunityPost;
  formatDate: (dateString?: string) => string;
  searchQuery: string;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightMatchedText = (text: string, searchQuery: string) => {
  const keyword = searchQuery.trim();

  if (!keyword) return text;

  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === keyword.toLowerCase()) {
      return (
        <mark key={`${part}-${index}`} className="rounded bg-yellow-200 px-0.5 text-inherit">
          {part}
        </mark>
      );
    }

    return part;
  });
};

export function FeedPostCard({ post, formatDate, searchQuery }: FeedPostCardProps) {
  const authorName = post.isRealName ? post.author.name : post.author.nickname;
  const highlightedCommentAuthorName = post.highlightedComment
    ? post.highlightedComment.author.mode === 'real'
      ? post.highlightedComment.author.name
      : post.highlightedComment.author.nickname
    : '';
  const isHighlightedCommentRealName = post.highlightedComment?.author.mode === 'real';
  const isOwnPost = post.author.accountId === 'account-user-1';
  const router = useRouter();
  const commentCount = post.commentCount ?? 0;
  const { isLoggedIn } = useAuth();
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [postLikeCount, setPostLikeCount] = useState(post.likes);
  const [isPostBookmarked, setIsPostBookmarked] = useState(false);
  const [isOwnPostMenuOpen, setIsOwnPostMenuOpen] = useState(false);
  const ownPostMenuRef = useRef<HTMLDivElement | null>(null);
  const images = post.images ?? [];
  const visibleImages = images.slice(0, 2);
  const remainingImageCount = Math.max(images.length - 2, 0);
  const handleAuthorAvatarClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/user/community/author/${post.author.id}`);
  };

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

  return (
    <article className="relative rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-300">
      {isOwnPost ? (
        <div ref={ownPostMenuRef} className="absolute right-4 top-4 z-10">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsOwnPostMenuOpen((prev) => !prev);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="내 게시글 메뉴 열기"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {isOwnPostMenuOpen ? (
            <div className="absolute right-0 top-10 w-[176px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsOwnPostMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                수정
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsOwnPostMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Trash2 className="h-4 w-4" />
                삭제
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsOwnPostMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <EyeOff className="h-4 w-4" />
                숨김
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsOwnPostMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                {post.isRealName ? '닉네임으로 전환' : '실명으로 전환'}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {post.highlightedComment && (
        <div className="border-b border-gray-100 px-4 pb-3 pt-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {post.highlightedComment.author.avatar ? (
              <img
                src={post.highlightedComment.author.avatar}
                alt={highlightedCommentAuthorName}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-gray-200" />
            )}
            <div className="min-w-0 flex items-center gap-1.5 text-sm text-gray-600">
              <span className="truncate font-medium text-gray-800">
                {highlightedCommentAuthorName}
              </span>
              {isHighlightedCommentRealName ? (
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              ) : null}
              <span className="shrink-0">님이 댓글을 남김</span>
            </div>
          </div>
        </div>
      )}

      <Link href={`/user/community/post/${post.id}`} className="block p-4 pb-3">
        <div className="mb-3 flex items-center justify-between gap-3 pr-10">
          <button
            type="button"
            onClick={handleAuthorAvatarClick}
            className="flex items-center gap-3 text-left"
            aria-label={`${authorName} 작성자 페이지로 이동`}
          >
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={authorName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{authorName}</span>
                {post.isRealName && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                {post.author.position && (
                  <span className="text-xs text-gray-500">· {post.author.position}</span>
                )}
              </div>
              <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </button>

          {post.isPromotion && (
            <span className="rounded-full bg-purple-500 px-2.5 py-1 text-xs font-medium text-white">
              홍보
            </span>
          )}
        </div>

        {(post.tags || []).length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {(post.tags || []).slice(0, 3).map((tag, index) => (
              <span
                key={tag}
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                  index === 0
                    ? 'border-green-200 bg-green-100 text-green-700'
                    : index === 1
                      ? 'border-orange-200 bg-orange-100 text-orange-700'
                      : 'border-gray-200 bg-gray-100 text-gray-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="mb-2 text-base font-bold text-gray-900 hover:text-orange-500">
          {highlightMatchedText(post.title, searchQuery)}
        </h3>
        <p className="mb-3 line-clamp-4 text-sm leading-relaxed text-gray-700">
          {highlightMatchedText(post.content, searchQuery)}
        </p>

        {images.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            {visibleImages.map((image, index) => (
              <div key={index} className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                <img src={image} alt={`post-${index}`} className="h-full w-full object-cover" />
                {index === 1 && images.length > 2 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl font-bold text-white">
                    +{remainingImageCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {post.highlightedComment && (
          <div className="mb-3 rounded-xl border border-orange-100 bg-orange-50/60 px-3 py-3 sm:px-4">
            <div className="flex items-start gap-3">
              {post.highlightedComment.author.avatar ? (
                <img
                  src={post.highlightedComment.author.avatar}
                  alt={highlightedCommentAuthorName}
                  className="h-8 w-8 flex-shrink-0 rounded-full object-cover sm:h-9 sm:w-9"
                />
              ) : (
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 sm:h-9 sm:w-9" />
              )}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900">
                    {highlightedCommentAuthorName}
                  </span>
                  {isHighlightedCommentRealName ? (
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                  ) : null}
                  <span className="text-xs text-gray-500">댓글</span>
                </div>
                <p className="line-clamp-2 text-sm leading-relaxed text-gray-700 sm:line-clamp-3">
                  {post.highlightedComment.content}
                </p>
              </div>
            </div>
          </div>
        )}
      </Link>

      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setIsPostLiked((prev) => {
                  const next = !prev;
                  setPostLikeCount(next ? post.likes + 1 : post.likes);
                  return next;
                });
              }}
              className={`flex items-center gap-1.5 transition-colors ${
                isPostLiked ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
              }`}
              aria-label="좋아요"
              title="좋아요 표시"
            >
              <Heart className={`h-5 w-5 ${isPostLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{postLikeCount}</span>
            </button>
            <button type="button" className="group flex items-center gap-1.5 text-gray-600 transition-colors hover:text-blue-500">
              <MessageSquare className="h-5 w-5 group-hover:fill-blue-100" />
              <span className="text-sm font-medium">{commentCount}</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-gray-400 transition-colors hover:text-orange-500"
              aria-label="게시글 공유"
              title="공유 기능은 추후 연결 예정"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => setIsPostBookmarked((prev) => !prev)}
                className={`transition-colors ${
                  isPostBookmarked ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'
                }`}
                aria-label="북마크"
                title="로그인 사용자용 북마크"
              >
                <Bookmark className={`h-4 w-4 ${isPostBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
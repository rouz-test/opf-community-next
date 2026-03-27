'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  BadgeCheck,
  Heart,
  MessageSquare,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  getCommunityCategoryLabel,
  type CommunityPost,
} from '@/data/mockCommunityPosts';

type Props = {
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

export function BoardPostRow({ post, formatDate, searchQuery }: Props) {
  const authorName = post.author.nickname;
  const likeCount = post.likes;
  const commentCount = post.commentCount ?? 0;
  const { isLoggedIn } = useAuth();
  const [isPostBookmarked, setIsPostBookmarked] = useState(false);

  return (
    <Link href={`/community/post/${post.id}`} className="block">
      <article className="rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-sm">
        {post.highlightedComment && (
          <div className="border-b border-gray-100 px-5 pb-3 pt-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {post.highlightedComment.author.avatar ? (
                <img
                  src={post.highlightedComment.author.avatar}
                  alt={post.highlightedComment.author.nickname}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-gray-200" />
              )}
              <div className="min-w-0 flex items-center gap-1.5 text-sm text-gray-600">
                <span className="truncate font-medium text-gray-800">
                  {post.highlightedComment.author.nickname}
                </span>
                <span className="shrink-0">님이 댓글을 남김</span>
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-4 p-5">
          <div className="min-w-0 flex-1">
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {post.category && (
                <span className="rounded-full border border-pink-200 bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
                  {getCommunityCategoryLabel(post.category)}
                </span>
              )}
              {(post.tags || []).slice(0, 2).map((tag, index) => (
                <span
                  key={tag}
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                    index === 0
                      ? 'border-green-200 bg-green-100 text-green-700'
                      : 'border-blue-200 bg-blue-100 text-blue-700'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="line-clamp-2 text-base font-semibold text-gray-900 hover:text-orange-500">
              {highlightMatchedText(post.title, searchQuery)}
            </h3>
          </div>

          <div className="hidden min-w-[200px] flex-shrink-0 flex-col items-end justify-between md:flex">
            <div className="flex items-center gap-2">
              {post.author.avatar && (
                <img
                  src={post.author.avatar}
                  alt={authorName}
                  className="h-6 w-6 rounded-full object-cover"
                />
              )}
              <div className="flex items-center gap-1.5 text-right">
                <p className="text-sm font-medium text-gray-900">{authorName}</p>
                {post.isRealName && <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />}
                {post.author.position && (
                  <span className="text-xs text-gray-500">· {post.author.position}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="text-xs">{formatDate(post.createdAt)}</span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {likeCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {commentCount}
              </span>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsPostBookmarked((prev) => !prev);
                  }}
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
    </Link>
  );
}
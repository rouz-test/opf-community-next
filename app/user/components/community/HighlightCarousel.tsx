'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Heart, MessageSquare } from 'lucide-react';
import { type CommunityPost } from '@/data/mockCommunityPosts';

const chunkPosts = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

function HighlightPostCard({ post }: { post: CommunityPost }) {
  const router = useRouter();

  const handleAuthorAvatarClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/user/community/author/${post.author.id}`);
  };

  return (
    <Link href={`/user/community/post/${post.id}`} className="block">
      <article className="flex h-[200px] flex-col rounded-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 transition-all hover:border-orange-300 hover:shadow-md">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
            {post.type === 'notice' ? '공지' : '추천'}
          </span>
         
        </div>

        <h3 className="mb-2 line-clamp-2 text-sm font-bold text-gray-900 transition-colors hover:text-orange-600">
          {post.title}
        </h3>
        <p className="mb-3 line-clamp-3 flex-1 text-xs leading-6 text-gray-600">{post.content}</p>

        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          <button
            type="button"
            onClick={handleAuthorAvatarClick}
            className="flex items-center gap-2 text-left"
            aria-label={`${post.author.nickname} 작성자 페이지로 이동`}
          >
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.nickname} className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-200" />
            )}
            <span>{post.author.nickname}</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {post.commentCount ?? 0}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function HighlightCarousel({ posts }: { posts: CommunityPost[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [slidesPerPage, setSlidesPerPage] = useState(2);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const swipeThreshold = 50;

  useEffect(() => {
    const updateSlidesPerPage = () => {
      if (window.innerWidth < 768) setSlidesPerPage(1);
      else setSlidesPerPage(2);
    };
    updateSlidesPerPage();
    window.addEventListener('resize', updateSlidesPerPage);
    return () => window.removeEventListener('resize', updateSlidesPerPage);
  }, []);

  const pages = useMemo(() => chunkPosts(posts, slidesPerPage), [posts, slidesPerPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [slidesPerPage]);

  useEffect(() => {
    if (pages.length <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % pages.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [pages.length]);

  if (pages.length === 0) return null;

  const goToPrev = () => setCurrentPage((prev) => (prev === 0 ? pages.length - 1 : prev - 1));
  const goToNext = () => setCurrentPage((prev) => (prev + 1) % pages.length);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
    touchEndXRef.current = null;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = () => {
    if (touchStartXRef.current == null || touchEndXRef.current == null) {
      touchStartXRef.current = null;
      touchEndXRef.current = null;
      return;
    }
    const deltaX = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(deltaX) >= swipeThreshold) {
      if (deltaX > 0) goToNext();
      else goToPrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <section className="relative overflow-hidden">
      <div
        className="flex touch-pan-y transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentPage * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pages.map((pagePosts, pageIndex) => (
          <div key={pageIndex} className="w-full flex-shrink-0">
            <div className="grid gap-4 md:grid-cols-2">
              {pagePosts.map((post) => (
                <HighlightPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {pages.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {pages.map((_, pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              onClick={() => setCurrentPage(pageIndex)}
              className={`h-2.5 rounded-full transition-all ${
                currentPage === pageIndex ? 'w-8 bg-orange-500' : 'w-2.5 bg-gray-300'
              }`}
              aria-label={`${pageIndex + 1}번 하이라이트로 이동`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
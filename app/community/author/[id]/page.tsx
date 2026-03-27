'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Search, LayoutGrid, List, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { mockCommunityPosts } from '@/data/mockCommunityPosts';
import { AuthorProfileCard } from '@/components/community/AuthorProfileCard';
import { CommunityProfileCard } from '@/components/community/CommunityProfileCard';
import { FeedPostCard } from '@/components/community/FeedPostCard';
import { BoardPostRow } from '@/components/community/BoardPostRow';

const formatRelativeDate = (dateString?: string) => {
  if (!dateString) return '방금 전';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '방금 전';

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

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const COMMUNITY_PROFILE_MODE_STORAGE_KEY = 'community-profile-mode';

const COMMUNITY_CURRENT_USER = {
  id: 'current-user',
  name: '박민수',
  nickname: 'StartupHero',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  position: '스타트업 개발자',
  postsCount: 12,
  commentsCount: 45,
};

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

export default function CommunityAuthorPage() {
  const params = useParams<{ id: string }>();
  const authorId = typeof params?.id === 'string' ? params.id : '';

  const [viewMode, setViewMode] = useState<'feed' | 'board'>('feed');
  const [sortBy, setSortBy] = useState<'recommended' | 'latest'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileMode, setProfileMode] = useState<'real' | 'nickname'>('nickname');

  const authorPosts = useMemo(
    () => mockCommunityPosts.filter((post) => post.author.id === authorId),
    [authorId],
  );

  const author = authorPosts[0]?.author;

  const syncProfileMode = (nextMode: 'real' | 'nickname') => {
    setProfileMode(nextMode);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COMMUNITY_PROFILE_MODE_STORAGE_KEY, nextMode);
      window.dispatchEvent(
        new CustomEvent('community-profile-mode-change', {
          detail: { mode: nextMode },
        }),
      );
    }
  };

  const toggleProfileMode = () => {
    syncProfileMode(profileMode === 'real' ? 'nickname' : 'real');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedMode = window.localStorage.getItem(COMMUNITY_PROFILE_MODE_STORAGE_KEY);
    if (savedMode === 'real' || savedMode === 'nickname') {
      setProfileMode(savedMode);
    }

    const handleProfileModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode?: 'real' | 'nickname' }>;
      const nextMode = customEvent.detail?.mode;

      if (nextMode === 'real' || nextMode === 'nickname') {
        setProfileMode(nextMode);
      }
    };

    window.addEventListener('community-profile-mode-change', handleProfileModeChange as EventListener);

    return () => {
      window.removeEventListener(
        'community-profile-mode-change',
        handleProfileModeChange as EventListener,
      );
    };
  }, []);

  const visiblePosts = useMemo(() => {
    let posts = [...authorPosts];

    if (searchQuery.trim()) {
      const keyword = searchQuery.trim().toLowerCase();
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(keyword) ||
          post.content.toLowerCase().includes(keyword) ||
          (post.tags || []).some((tag) => tag.toLowerCase().includes(keyword)),
      );
    }

    if (sortBy === 'recommended') {
      posts.sort((a, b) => b.likes - a.likes);
    } else {
      posts.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );
    }

    return posts;
  }, [authorPosts, searchQuery, sortBy]);

  if (!author) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-[1200px] px-4 py-10">
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-base font-semibold text-gray-900">작성자 정보를 찾을 수 없습니다.</p>
            <p className="mt-2 text-sm text-gray-500">존재하지 않거나 게시글이 없는 작성자입니다.</p>
            <Link
              href="/community"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              커뮤니티로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const displayMode: 'real' | 'nickname' = author.name === author.nickname ? 'real' : 'nickname';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="space-y-4 lg:hidden">
          <AuthorProfileCard author={author} displayMode={displayMode} variant="mobile" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="hidden xl:block">
            <div className="sticky top-4 space-y-4">
              <CommunityProfileCard
                profileMode={profileMode}
                onToggleProfileMode={toggleProfileMode}
                currentUser={COMMUNITY_CURRENT_USER}
              />
            </div>
          </aside>

          <section className="min-w-0 space-y-6 overflow-hidden">
            <div className="text-sm font-medium text-gray-500">
              {displayMode === 'real' ? author.name : author.nickname}님의 글
            </div>

            <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`${displayMode === 'real' ? author.name : author.nickname}님의 게시글 검색...`}
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center gap-2 self-end lg:self-auto">
                  <div className="inline-flex rounded-lg bg-gray-100 p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('feed')}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        viewMode === 'feed'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      피드뷰
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('board')}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        viewMode === 'board'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <List className="h-4 w-4" />
                      게시판뷰
                    </button>
                  </div>

                  <div className="inline-flex rounded-lg bg-gray-100 p-1">
                    <button
                      type="button"
                      onClick={() => setSortBy('latest')}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        sortBy === 'latest'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      최신순
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy('recommended')}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        sortBy === 'recommended'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      추천순
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              {visiblePosts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
                  작성한 게시글이 없거나 검색 결과가 없습니다.
                </div>
              ) : viewMode === 'feed' ? (
                visiblePosts.map((post) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    formatDate={formatRelativeDate}
                    searchQuery={searchQuery}
                  />
                ))
              ) : (
                visiblePosts.map((post) => (
                  <BoardPostRow
                    key={post.id}
                    post={post}
                    formatDate={formatRelativeDate}
                    searchQuery={searchQuery}
                  />
                ))
              )}
            </section>
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-4 space-y-4">
              <AuthorProfileCard author={author} displayMode={displayMode} variant="sidebar" />

              <section className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <h2 className="text-base font-bold text-gray-900">활동 요약</h2>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>전체 게시글</span>
                    <span className="font-semibold text-gray-900">{authorPosts.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>피드형 게시글</span>
                    <span className="font-semibold text-gray-900">
                      {authorPosts.filter((post) => (post.images || []).length > 0).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>게시판형 게시글</span>
                    <span className="font-semibold text-gray-900">
                      {authorPosts.filter((post) => (post.images || []).length === 0).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>누적 좋아요</span>
                    <span className="font-semibold text-gray-900">
                      {authorPosts.reduce((sum, post) => sum + post.likes, 0)}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
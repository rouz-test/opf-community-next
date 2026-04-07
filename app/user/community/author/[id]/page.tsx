'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  mockCommunityPosts,
  mockComments,
  type CommunityPost,
  type HighlightedComment,
} from '@/data/mockCommunityPosts';
import { AuthorProfileCard } from '@/app/user/components/community/AuthorProfileCard';
import { CommunityProfileCard } from '@/app/user/components/community/CommunityProfileCard';
import { CommunityToolbar } from '@/app/user/components/community/CommunityToolbar';
import { CommunityTagFilter } from '@/app/user/components/community/CommunityTagFilter';
import { FeedPostCard } from '@/app/user/components/community/FeedPostCard';
import { BoardPostRow } from '@/app/user/components/community/BoardPostRow';

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

const getProfileActorId = (authorLike?: { id?: string; profileId?: string }) =>
  authorLike?.profileId ?? authorLike?.id ?? '';

type AuthorCommentPreview = HighlightedComment;

type AuthorCommentEntry = {
  post: CommunityPost;
  comment: AuthorCommentPreview;
  activityDate?: string;
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

  const [activityTab, setActivityTab] = useState<'posts' | 'comments'>('posts');
  const [viewMode, setViewMode] = useState<'feed' | 'board'>('feed');
  const [sortBy, setSortBy] = useState<'recommended' | 'latest'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileMode, setProfileMode] = useState<'real' | 'nickname'>('nickname');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);

  const authorPosts = useMemo(
    () => mockCommunityPosts.filter((post) => getProfileActorId(post.author) === authorId),
    [authorId],
  );

  const authorCommentEntries = useMemo<AuthorCommentEntry[]>(() => {
    const entries = new Map<string | number, AuthorCommentEntry>();
    const postMap = new Map(mockCommunityPosts.map((post) => [post.id, post]));
  
    mockComments.forEach((comment) => {
      if (getProfileActorId(comment.author) !== authorId) return;
  
      const post = postMap.get(comment.postId);
      if (!post) return;
  
      const latestComment: AuthorCommentPreview = {
        id: comment.id,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          nickname: comment.author.nickname,
          avatar: comment.author.avatar,
          isFollowing: comment.author.isFollowing ?? false,
        },
        content: comment.content,
        createdAt: comment.createdAt,
        likes: comment.likes,
        replyCount: comment.replies?.length ?? 0,
      };
  
      const entry: AuthorCommentEntry = {
        post: {
          ...post,
          highlightedComment: latestComment,
        },
        comment: latestComment,
        activityDate: latestComment.createdAt ?? post.createdAt,
      };
  
      const existingEntry = entries.get(post.id);
      if (!existingEntry) {
        entries.set(post.id, entry);
        return;
      }
  
      const existingTime = new Date(existingEntry.activityDate || 0).getTime();
      const nextTime = new Date(entry.activityDate || 0).getTime();
  
      if (nextTime > existingTime) {
        entries.set(post.id, entry);
      }
    });
  
    return Array.from(entries.values());
  }, [authorId]);

  const author =
    authorPosts[0]?.author ??
    (authorCommentEntries[0]
      ? {
          id: authorCommentEntries[0].comment.author.id,
          accountId: authorCommentEntries[0].comment.author.accountId,
          profileId: authorCommentEntries[0].comment.author.profileId,
          mode: authorCommentEntries[0].comment.author.mode,
          name: authorCommentEntries[0].comment.author.name,
          nickname: authorCommentEntries[0].comment.author.nickname,
          avatar: authorCommentEntries[0].comment.author.avatar,
        }
      : undefined);

  const activeSourcePosts = useMemo(
    () => (activityTab === 'posts' ? authorPosts : authorCommentEntries.map((entry) => entry.post)),
    [activityTab, authorPosts, authorCommentEntries],
  );

  const commentEntryMap = useMemo(
    () => new Map(authorCommentEntries.map((entry) => [entry.post.id, entry])),
    [authorCommentEntries],
  );

  const allTags = useMemo(
    () => Array.from(new Set(activeSourcePosts.flatMap((post) => post.tags || []))),
    [activeSourcePosts],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const clearSelectedTags = () => {
    setSelectedTags([]);
  };

  const toggleFilterOpen = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const closeFilterOpen = () => {
    setIsFilterOpen(false);
  };

  const toggleTagFilterOpen = () => {
    setIsTagFilterOpen((prev) => !prev);
  };

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

  useEffect(() => {
    setSelectedTags([]);
    setIsFilterOpen(false);
    setIsTagFilterOpen(false);
  }, [activityTab]);

  const visiblePosts = useMemo(() => {
    let posts = [...activeSourcePosts];

    if (selectedTags.length > 0) {
      posts = posts.filter((post) =>
        selectedTags.every((tag) => (post.tags || []).includes(tag)),
      );
    }

    if (searchQuery.trim()) {
      const keyword = searchQuery.trim().toLowerCase();
      posts = posts.filter((post) => {
        const matchesPost =
          post.title.toLowerCase().includes(keyword) ||
          post.content.toLowerCase().includes(keyword) ||
          (post.tags || []).some((tag) => tag.toLowerCase().includes(keyword));

        if (matchesPost) return true;
        if (activityTab !== 'comments') return false;

        const entry = commentEntryMap.get(post.id);
        return entry?.comment.content.toLowerCase().includes(keyword) ?? false;
      });
    }

    if (sortBy === 'recommended') {
      posts.sort((a, b) => b.likes - a.likes);
    } else if (activityTab === 'comments') {
      posts.sort((a, b) => {
        const aTime = new Date(commentEntryMap.get(a.id)?.activityDate || 0).getTime();
        const bTime = new Date(commentEntryMap.get(b.id)?.activityDate || 0).getTime();
        return bTime - aTime;
      });
    } else {
      posts.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );
    }

    return posts;
  }, [activeSourcePosts, selectedTags, searchQuery, sortBy, activityTab, commentEntryMap]);

  if (!author) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-[1200px] px-4 py-10">
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-base font-semibold text-gray-900">작성자 정보를 찾을 수 없습니다.</p>
            <p className="mt-2 text-sm text-gray-500">존재하지 않거나 게시글이 없는 작성자입니다.</p>
            <Link
              href="/user/community"
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

              <CommunityTagFilter
                allTags={allTags}
                selectedTags={selectedTags}
                onToggleTag={toggleTag}
                onClearTags={clearSelectedTags}
              />
            </div>
          </aside>

          <section className="min-w-0 space-y-5 overflow-hidden">
            <CommunityToolbar
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              searchPlaceholder={`${displayMode === 'real' ? author.name : author.nickname}님의 ${activityTab === 'posts' ? '글' : '댓글'} 검색하기`}
              showFollowingOnly={false}
              onToggleFollowingOnly={() => {}}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isFilterOpen={isFilterOpen}
              onToggleFilterOpen={toggleFilterOpen}
              onCloseFilterOpen={closeFilterOpen}
              isTagFilterOpen={isTagFilterOpen}
              onToggleTagFilterOpen={toggleTagFilterOpen}
              allTags={allTags}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
              onClearTags={clearSelectedTags}
              showFollowingFilter={false}
            />

            <div className="space-y-2">
              {/* Mobile: segmented control */}
              <div className="sm:hidden">
                <div className="inline-flex rounded-lg bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setActivityTab('posts')}
                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                      activityTab === 'posts'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    게시글
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityTab('comments')}
                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                      activityTab === 'comments'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    댓글
                  </button>
                </div>
              </div>

              {/* Desktop: tab */}
              <div className="hidden sm:flex items-center gap-6 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActivityTab('posts')}
                  className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                    activityTab === 'posts'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  게시글
                </button>
                <button
                  type="button"
                  onClick={() => setActivityTab('comments')}
                  className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                    activityTab === 'comments'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  댓글
                </button>
              </div>

              <section className="space-y-4">
                {visiblePosts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
                    {activityTab === 'posts'
                      ? '작성한 게시글이 없거나 검색 결과가 없습니다.'
                      : '작성한 댓글이 없거나 검색 결과가 없습니다.'}
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
            </div>
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-4">
              <AuthorProfileCard author={author} displayMode={displayMode} variant="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
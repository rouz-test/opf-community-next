'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Eye,
  Share2,
  BadgeCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Ellipsis,
} from 'lucide-react';
import {
  mockCommunityPosts,
  mockNotices,
} from '@/data/mockCommunityPosts';
import { CommunityCommentsSection } from '@/components/community/CommunityCommentsSection';
import { CommunityProfileCard } from '@/components/community/CommunityProfileCard';
import { AuthorProfileCard } from '@/components/community/AuthorProfileCard';
import { useAuth } from '@/components/providers/AuthProvider';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTimeAgo = (dateString: string) => {
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


const getPreviewImages = (images?: string[]) => {
  if (!images || images.length === 0) return [];
  return images.slice(0, 2);
};

const COMMUNITY_PROFILE_MODE_STORAGE_KEY = 'community-profile-mode';

const getProfileActorId = (authorLike?: { id?: string; profileId?: string }) =>
  authorLike?.profileId ?? authorLike?.id ?? '';


export default function CommunityPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [profileMode, setProfileMode] = useState<'real' | 'nickname'>('nickname');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const swipeThreshold = 50;
  const id = params.id as string;

  const [isOtherPostsOpen, setIsOtherPostsOpen] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [postLikeCount, setPostLikeCount] = useState(0);
  const [isPostBookmarked, setIsPostBookmarked] = useState(false);
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  const [isPostEditing, setIsPostEditing] = useState(false);
  const [isPostDeleted, setIsPostDeleted] = useState(false);
  const [postAuthorDisplayMode, setPostAuthorDisplayMode] = useState<'real' | 'nickname'>('nickname');
  const [editedPostTitle, setEditedPostTitle] = useState('');
  const [editedPostContent, setEditedPostContent] = useState('');

  const allPosts = [...mockNotices, ...mockCommunityPosts];
  const post = allPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">게시글을 찾을 수 없습니다</h2>
          <p className="mb-4 text-gray-600">삭제되었거나 존재하지 않는 게시글입니다.</p>
          <button
            type="button"
            onClick={() => router.push('/community')}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            커뮤니티 홈으로
          </button>
        </div>
      </div>
    );
  }

  const authorOtherPosts = mockCommunityPosts
    .filter(
      (item) =>
        getProfileActorId(item.author) === getProfileActorId(post.author) && item.id !== post.id,
    )
    .slice(0, 5);

  const currentUser = {
    name: '박민수',
    nickname: 'StartupHero',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    position: '스타트업 개발자',
    postsCount: 12,
    commentsCount: 45,
  };

  const postImages = post.images ?? [];
  const hasPostImages = postImages.length > 0;
  const isOwnPost = post.author.accountId === 'account-user-1';
  const previewImages = useMemo(() => getPreviewImages(postImages), [postImages]);
  const selectedImage =
    selectedImageIndex !== null && selectedImageIndex >= 0 && selectedImageIndex < postImages.length
      ? postImages[selectedImageIndex]
      : null;

  useEffect(() => {
    setPostLikeCount(post.likes);
  }, [post.likes]);

  useEffect(() => {
    setPostAuthorDisplayMode(post.isRealName ? 'real' : 'nickname');
    setEditedPostTitle(post.title);
    setEditedPostContent(post.content);
  }, [post.id, post.isRealName, post.title, post.content]);

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

  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
  };


  const goToPrevImage = () => {
    if (postImages.length === 0) return;
    setSelectedImageIndex((prev) => {
      if (prev === null) return 0;
      return prev === 0 ? postImages.length - 1 : prev - 1;
    });
  };

  const goToNextImage = () => {
    if (postImages.length === 0) return;
    setSelectedImageIndex((prev) => {
      if (prev === null) return 0;
      return prev === postImages.length - 1 ? 0 : prev + 1;
    });
  };

  const handleImageTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchEndXRef.current = null;
  };

  const handleImageTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleImageTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) {
      touchStartXRef.current = null;
      touchEndXRef.current = null;
      return;
    }

    const deltaX = touchStartXRef.current - touchEndXRef.current;

    if (Math.abs(deltaX) >= swipeThreshold) {
      if (deltaX > 0) {
        goToNextImage();
      } else {
        goToPrevImage();
      }
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeImageModal();
      } else if (event.key === 'ArrowLeft') {
        goToPrevImage();
      } else if (event.key === 'ArrowRight') {
        goToNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIndex, postImages]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_320px]">
          <aside className="hidden lg:block">
            <div className="space-y-4">
              <CommunityProfileCard
                profileMode={profileMode}
                onToggleProfileMode={toggleProfileMode}
                currentUser={currentUser}
              />
            </div>
          </aside>
          <main className="min-w-0 space-y-4">


            <article className="overflow-hidden rounded-lg border border-gray-200 bg-white px-6 pb-6 pt-4">
              {isPostDeleted ? (
                <div className="py-10 text-center">
                  <p className="text-base font-semibold text-gray-700">삭제된 게시글입니다.</p>
                  <p className="mt-2 text-sm text-gray-500">목록으로 돌아가 다른 글을 확인해보세요.</p>
                </div>
              ) : (
                <>
                  <div className="mb-2 -mx-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="-ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      aria-label="뒤로가기"
                      title="뒤로가기"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    {isOwnPost ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsPostMenuOpen((prev) => !prev)}
                          className="-mr-1 inline-flex h-7 w-7 items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
                          aria-label="게시글 더보기"
                        >
                          <Ellipsis className="h-5 w-5" />
                        </button>
                        {isPostMenuOpen && (
                          <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                setIsPostEditing(true);
                                setIsPostMenuOpen(false);
                              }}
                              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsPostDeleted(true);
                                setIsPostMenuOpen(false);
                              }}
                              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              삭제
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsPostMenuOpen(false);
                              }}
                              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              숨김
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPostAuthorDisplayMode((prev) => (prev === 'nickname' ? 'real' : 'nickname'));
                                setIsPostMenuOpen(false);
                              }}
                              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {postAuthorDisplayMode === 'nickname' ? '실명으로 전환' : '닉네임으로 전환'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <h1 className="mb-4 text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
                    {editedPostTitle}
                  </h1>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {post.type === 'notice' && (
                      <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white sm:px-2.5 sm:py-1 sm:text-xs">
                        공지
                      </span>
                    )}
                    {post.type === 'study' && (
                      <span className="rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-600 sm:px-2.5 sm:py-1 sm:text-xs">
                        스터디
                      </span>
                    )}
                    {post.isPromotion && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white sm:px-2.5 sm:py-1 sm:text-xs">
                        홍보
                      </span>
                    )}
                  
                    {(post.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600 sm:px-2.5 sm:py-1 sm:text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {isPostEditing ? (
                    <div className="mb-6 rounded-lg bg-gray-50 p-4">
                      <div className="mb-3">
                        <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
                        <input
                          type="text"
                          value={editedPostTitle}
                          onChange={(event) => setEditedPostTitle(event.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-orange-400"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">본문</label>
                        <textarea
                          value={editedPostContent}
                          onChange={(event) => setEditedPostContent(event.target.value)}
                          rows={8}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm leading-7 text-gray-700 outline-none transition-colors focus:border-orange-400"
                        />
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPostEditing(false);
                            setEditedPostTitle(post.title);
                            setEditedPostContent(post.content);
                          }}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editedPostTitle.trim() || !editedPostContent.trim()) return;
                            setEditedPostTitle(editedPostTitle.trim());
                            setEditedPostContent(editedPostContent.trim());
                            setIsPostEditing(false);
                          }}
                          className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 flex items-center gap-2.5 border-b border-gray-200 pb-4 sm:gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.nickname}
                          className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-gray-900 sm:text-sm">
                              {postAuthorDisplayMode === 'real' ? post.author.name : post.author.nickname}
                            </span>
                            {postAuthorDisplayMode === 'real' && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                          </div>
                          <div className="text-xs text-gray-500 sm:text-sm">
                            {post.author.position ? `${post.author.position} · ` : ''}
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                      </div>

                      {post.studyTitle && (
                        <div className="mb-4 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-700">
                          📚 {post.studyTitle}
                        </div>
                      )}

                      <div className="mb-6 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                        {editedPostContent}
                      </div>
                    </>
                  )}

                  {hasPostImages && !isPostEditing && (
                    <div className="mb-6">
                      {postImages.length === 1 ? (
                        <button
                          type="button"
                          onClick={() => openImageModal(0)}
                          className="block w-full overflow-hidden rounded-lg bg-gray-100"
                        >
                          <img
                            src={postImages[0]}
                            alt="게시글 이미지"
                            className="max-h-[520px] w-full object-cover"
                          />
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {previewImages.map((image, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => openImageModal(index)}
                              className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 text-left"
                            >
                              <img
                                src={image}
                                alt={`게시글 이미지 ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                              {index === 1 && postImages.length > 2 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl font-bold text-white">
                                  +{postImages.length - 2}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-200 pt-4 sm:pt-6">
                    <div className="flex items-center gap-3 text-xs text-gray-600 sm:gap-4 sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>{post.views}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPostLiked((prev) => {
                            const next = !prev;
                            setPostLikeCount(next ? post.likes + 1 : post.likes);
                            return next;
                          });
                        }}
                        className={`flex items-center gap-1.5 transition-colors sm:gap-2 ${
                          isPostLiked ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
                        }`}
                        aria-label="좋아요"
                        title="좋아요 표시"
                      >
                        <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isPostLiked ? 'fill-current' : ''}`} />
                        <span>{postLikeCount}</span>
                      </button>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>{post.commentCount ?? 0}</span>
                      </div>
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
                </>
              )}
            </article>
            {/* 모바일 전용 작성자 영역 */}
            <div className="space-y-4 lg:hidden">
              {/* 작성자 카드 */}
              <AuthorProfileCard
                author={post.author}
                displayMode={post.isRealName ? 'real' : 'nickname'}
                variant="mobile"
              />

              {/* 작성자 다른 글 (아코디언) */}
              {authorOtherPosts.length > 0 && (
                <section className="rounded-lg border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsOtherPostsOpen(!isOtherPostsOpen)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-gray-900">
                      작성자 다른 글 ({authorOtherPosts.length})
                    </span>
                    <span className="text-xs text-gray-500">
                      {isOtherPostsOpen ? '닫기' : '열기'}
                    </span>
                  </button>

                  {isOtherPostsOpen && (
                    <div className="border-t border-gray-200 px-4 py-3 space-y-3">
                      {authorOtherPosts.map((otherPost) => (
                        <Link
                          key={otherPost.id}
                          href={`/community/post/${otherPost.id}`}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {otherPost.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTimeAgo(otherPost.createdAt)}
                            </p>
                          </div>
                          {otherPost.images && otherPost.images.length > 0 && (
                            <img
                              src={otherPost.images[0]}
                              alt=""
                              className="h-12 w-12 rounded object-cover"
                            />
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>

            <CommunityCommentsSection
              postId={id}
              postType={post.type}
              currentUser={{
                name: currentUser.name,
                nickname: currentUser.nickname,
                avatar: currentUser.avatar,
              }}
              profileMode={profileMode}
              mockComments={require('@/data/mockCommunityPosts').mockComments}
            />
          </main>

          <aside className="hidden space-y-4 lg:block">
            <AuthorProfileCard
              author={post.author}
              displayMode={post.isRealName ? 'real' : 'nickname'}
              variant="sidebar"
            />

            {authorOtherPosts.length > 0 && (
              <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="mb-4 text-base font-bold text-gray-900">작성자 다른 글</h3>
                <div className="space-y-4">
                  {authorOtherPosts.map((otherPost) => (
                    <Link
                      key={otherPost.id}
                      href={`/community/post/${otherPost.id}`}
                      className="-m-2 flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                    >
                      <div className="min-w-0 flex-1">
                        {otherPost.tags && otherPost.tags.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1">
                            {otherPost.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={tag}
                                className={`rounded-full border px-1.5 py-0 text-xs ${
                                  index === 0
                                    ? 'border-green-200 bg-green-100 text-green-700'
                                    : 'border-orange-200 bg-orange-100 text-orange-700'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="mb-2 line-clamp-2 text-sm font-medium text-gray-900">
                          {otherPost.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.author.nickname} • {formatTimeAgo(otherPost.createdAt)}
                        </p>
                      </div>
                      {otherPost.images && otherPost.images.length > 0 && (
                        <img
                          src={otherPost.images[0]}
                          alt="다른 글 이미지"
                          className="h-16 w-16 flex-shrink-0 rounded object-cover"
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4 py-8"
          onClick={closeImageModal}
        >
          <button
            type="button"
            onClick={closeImageModal}
            className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="이미지 모달 닫기"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
            {selectedImageIndex! + 1} / {postImages.length}
          </div>

          {postImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goToPrevImage();
              }}
              className="absolute left-4 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          <div
            className="relative w-full max-w-6xl px-12 md:px-20"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleImageTouchStart}
            onTouchMove={handleImageTouchMove}
            onTouchEnd={handleImageTouchEnd}
          >
            <div className="overflow-hidden rounded-xl bg-black">
              <img
                src={selectedImage}
                alt={`확대 이미지 ${selectedImageIndex! + 1}`}
                className="max-h-[80vh] w-full object-contain"
              />
            </div>
          </div>

          {postImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goToNextImage();
              }}
              className="absolute right-4 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="다음 이미지"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}

          {postImages.length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 z-20 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-full bg-black/50 px-4 py-2"
              onClick={(event) => event.stopPropagation()}
            >
              {postImages.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    index === selectedImageIndex
                      ? 'scale-110 border-orange-500 opacity-100'
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`${index + 1}번 이미지로 이동`}
                >
                  <img
                    src={image}
                    alt={`썸네일 ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

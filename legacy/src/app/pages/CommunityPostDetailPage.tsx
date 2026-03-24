import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Heart, MessageSquare, Eye, Share2, MoreVertical, Edit, Trash2, Flag, RefreshCw, BadgeCheck, TrendingUp, MoreHorizontal, EyeOff, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Avatar } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { 
  mockCommunityPosts, 
  mockNotices, 
  mockComments,
  communityCategories,
  CommunityPost,
  Comment 
} from '@/data/mockCommunityPosts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

export function CommunityPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 프로필 모드 상태
  const [profileMode, setProfileMode] = useState<'real' | 'nickname'>('nickname');
  
  // 현재 사용자 정보 (데모용)
  const currentUser = {
    name: '박민수',
    nickname: 'StartupHero',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    position: '스타트업 개발자',
    company: '테크스타트',
    postsCount: 12,
    commentsCount: 45
  };
  
  // 게시글 찾기
  const allPosts = [...mockNotices, ...mockCommunityPosts];
  const post = allPosts.find(p => p.id === id);
  
  // 작성자의 다른 글
  const authorOtherPosts = mockCommunityPosts
    .filter(p => p.author.id === post?.author.id && p.id !== id)
    .slice(0, 5);

  const [isLiked, setIsLiked] = useState(post?.isLikedByMe || false);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ commentId: string; nickname: string } | null>(null);
  const [comments, setComments] = useState<Comment[]>(mockComments.filter(c => c.postId === id));
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">게시글을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">삭제되었거나 존재하지 않는 게시글입니다.</p>
          <Button onClick={() => navigate('/community')}>
            커뮤니티 홈으로
          </Button>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId: id!,
      parentId: replyTo?.commentId,
      author: {
        id: 'current-user',
        name: '나',
        nickname: 'MyNickname',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      },
      content: commentText,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLikedByMe: false,
    };

    if (replyTo) {
      // 대댓글 추가
      setComments(prev => prev.map(comment => {
        if (comment.id === replyTo.commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment]
          };
        }
        return comment;
      }));
    } else {
      // 댓글 추가
      setComments([...comments, newComment]);
    }

    setCommentText('');
    setReplyTo(null);
  };

  const handleDeletePost = () => {
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      // TODO: API 호출
      navigate('/community');
    }
  };

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

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    const category = communityCategories.find(c => c.id === categoryId);
    return category ? `${category.icon} ${category.name}` : categoryId;
  };

  const isMyPost = post.author.id === 'current-user'; // TODO: 실제 사용자 ID와 비교

  // 이미지 네비게이션 핸들러
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (post.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === (post.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  // ESC 키로 모달 닫기
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowImageModal(false);
    } else if (e.key === 'ArrowLeft') {
      handlePrevImage();
    } else if (e.key === 'ArrowRight') {
      handleNextImage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
          {/* 좌측 - 사용자 프로필 카드 (홈과 동일) */}
          <aside className="hidden lg:block">
            <div className="space-y-4">
              {/* 프로필 카드 */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                {/* 상단 오렌지 배경 */}
                <div className="h-24 bg-gradient-to-br from-orange-400 to-orange-500 relative">
                  {/* 실명/닉네임 배지 - 우측 상단 */}
                  <div className="absolute top-3 right-3">
                    {profileMode === 'real' ? (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-2 py-0.5">
                        ✓ 실명 인증
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-xs px-2 py-0.5">
                        닉네임
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 프로필 이미지 (오렌지와 흰색 영역 사이) */}
                <div className="relative px-6">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <img 
                      src={currentUser.avatar} 
                      alt={profileMode === 'real' ? currentUser.name : currentUser.nickname}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                </div>

                {/* 하단 정보 영역 */}
                <div className="pt-14 pb-5 px-6 text-center">
                  {/* 이름/닉네임 */}
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="font-semibold text-base text-gray-900">
                      {profileMode === 'real' ? currentUser.name : currentUser.nickname}
                    </h3>
                    {/* 실명 인증 아이콘 */}
                    {profileMode === 'real' && (
                      <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>

                  {/* 직책 */}
                  {currentUser.position && (
                    <p className="text-sm text-gray-600 mb-0.5">
                      {currentUser.position}
                    </p>
                  )}

                  {/* 계정 전환 버튼 */}
                  <button
                    onClick={() => setProfileMode(profileMode === 'real' ? 'nickname' : 'real')}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>계정 전환</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="space-y-4 min-w-0 overflow-hidden">
            {/* 뒤로가기 */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>목록으로</span>
            </button>

            {/* 게시글 본문 */}
            <article className="bg-white rounded-lg border border-gray-200 p-6 relative">
              {/* 더보기 버튼 - 우측 상단 */}
              <div className="absolute top-4 right-4">
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMoreMenu(!showMoreMenu);
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  {/* 더보기 드롭다운 메뉴 */}
                  {showMoreMenu && (
                    <>
                      {/* 오버레이 */}
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowMoreMenu(false);
                        }}
                      />
                      
                      {/* 메뉴 */}
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                        {isMyPost ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/community/write?edit=${post.id}`);
                                setShowMoreMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              <span>수정</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeletePost();
                                setShowMoreMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>삭제</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('숨김');
                                setShowMoreMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <EyeOff className="w-4 h-4" />
                              <span>숨김</span>
                            </button>
                            <div className="my-1 border-t border-gray-200"></div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('프로필 전환');
                                setShowMoreMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>{post.isRealName ? '닉네임으로 전환' : '실명으로 전환'}</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('신고');
                              setShowMoreMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Flag className="w-4 h-4" />
                            <span>신고하기</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 태그와 카테고리 */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {post.type === 'notice' && (
                  <Badge className="bg-orange-500 text-white">공지</Badge>
                )}
                {post.type === 'study' && (
                  <Badge variant="outline" className="border-orange-300 text-orange-600">
                    스터디
                  </Badge>
                )}
                {post.isPromotion && (
                  <Badge className="bg-red-500 text-white">홍보</Badge>
                )}
                {post.category && (
                  <Badge variant="secondary">
                    {getCategoryName(post.category)}
                  </Badge>
                )}
                {post.tags && post.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-orange-50 hover:text-orange-600">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* 제목 */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

              {/* 작성자 정보 */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <img 
                  src={post.author.avatar} 
                  alt={post.author.nickname}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {post.isRealName ? post.author.name : post.author.nickname}
                    </span>
                    {post.isRealName && (
                      <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {post.author.position && (
                      <>
                        <span>{post.author.position}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* 스터디 제목 */}
              {post.studyTitle && (
                <div className="mb-4 px-3 py-2 bg-orange-50 rounded text-sm text-orange-700">
                  📚 {post.studyTitle}
                </div>
              )}

              {/* 내용 */}
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </div>

              {/* 이미지 - 최대 2개까지 표시, 3개 이상이면 갤러리 */}
              {post.images && post.images.length > 0 && (
                <div className="mb-6">
                  {post.images.length === 1 && (
                    <img
                      src={post.images[0]}
                      alt="게시글 이미지"
                      className="w-full rounded-lg object-cover max-h-[500px] cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(0)}
                    />
                  )}
                  {post.images.length === 2 && (
                    <div className="grid grid-cols-2 gap-2">
                      {post.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`게시글 이미지 ${idx + 1}`}
                          className="w-full h-64 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleImageClick(idx)}
                        />
                      ))}
                    </div>
                  )}
                  {post.images.length >= 3 && (
                    <div className="grid grid-cols-2 gap-2 relative">
                      <img
                        src={post.images[0]}
                        alt="게시글 이미지 1"
                        className="w-full h-64 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleImageClick(0)}
                      />
                      <div 
                        className="relative cursor-pointer"
                        onClick={() => handleImageClick(1)}
                      >
                        <img
                          src={post.images[1]}
                          alt="게시글 이미지 2"
                          className="w-full h-64 rounded-lg object-cover"
                        />
                        {post.images.length > 2 && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center hover:bg-black/60 transition-colors">
                            <span className="text-white text-2xl font-semibold">
                              +{post.images.length - 2}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 text-sm ${
                      isLiked ? 'text-orange-600' : 'text-gray-600'
                    } hover:text-orange-600 transition-colors`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likeCount}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span>{comments.length}</span>
                  </button>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Share2 className="w-4 h-4 mr-2" />
                  공유
                </Button>
              </div>
            </article>

            {/* 댓글 섹션 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-lg text-gray-900 mb-4">
                댓글 {comments.length}개
              </h2>

              {/* 댓글 작성 폼 */}
              {post.type !== 'notice' && (
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
                  <div className="flex gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                      alt="내 프로필"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <Textarea
                        placeholder={replyTo ? `@${replyTo.nickname}님에게 답글을 입력하세요...` : "댓글을 입력하세요..."}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={3}
                        className="mb-2"
                      />
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          disabled={!commentText.trim()}
                        >
                          {replyTo ? '답글 작성' : '댓글 작성'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {comments.map(comment => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    onReply={(commentId, nickname) => setReplyTo({ commentId, nickname })}
                  />
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* 사이드바 */}
          <aside className="hidden lg:block space-y-4">
            {/* 작성자 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">👤</span>
                <h3 className="font-bold text-base text-gray-900">작성자 정보</h3>
              </div>
              
              {/* 프로필 이미지 - 중앙 정렬 */}
              <div className="flex justify-center mb-4">
                <img 
                  src={post.author.avatar} 
                  alt={post.author.nickname}
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>

              {/* 이름 */}
              <div className="text-center mb-1">
                <p className="font-bold text-gray-900">
                  {post.isRealName ? post.author.name : post.author.nickname}
                </p>
              </div>

              {/* 직책 */}
              {post.author.position && (
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">{post.author.position}</p>
                </div>
              )}

              {/* 팔로워/팔로잉 통계 */}
              <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">892</p>
                  <p className="text-xs text-gray-500 uppercase">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">124</p>
                  <p className="text-xs text-gray-500 uppercase">Following</p>
                </div>
              </div>

              {/* 팔로우 버튼 */}
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                팔로우
              </Button>
            </div>

            {/* 작성자의 다른 글 */}
            {authorOtherPosts.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="font-bold text-base text-gray-900 mb-4">
                  작성자 다른 글
                </h3>
                <div className="space-y-4">
                  {authorOtherPosts.map(otherPost => (
                    <Link
                      key={otherPost.id}
                      to={`/community/post/${otherPost.id}`}
                      className="flex gap-3 items-start hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        {/* 태그 */}
                        {otherPost.tags && otherPost.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {otherPost.tags.slice(0, 2).map((tag, index) => (
                              <Badge 
                                key={tag}
                                className={`text-xs px-1.5 py-0 ${
                                  index === 0 
                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                    : 'bg-orange-100 text-orange-700 border-orange-200'
                                }`}
                                variant="outline"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                          {otherPost.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.author.nickname} • {formatTimeAgo(otherPost.createdAt)}
                        </p>
                      </div>
                      {otherPost.images && otherPost.images.length > 0 && (
                        <img 
                          src={otherPost.images[0]}
                          alt=""
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* 이미지 갤러리 모달 */}
      {showImageModal && post.images && post.images.length > 0 && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setShowImageModal(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* 이미지 카운터 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
            {currentImageIndex + 1} / {post.images.length}
          </div>

          {/* 이전 버튼 */}
          {post.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* 이미지 */}
          <div 
            className="max-w-7xl max-h-[90vh] mx-auto px-20"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={post.images[currentImageIndex]}
              alt={`게시글 이미지 ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain mx-auto rounded-lg"
            />
          </div>

          {/* 다음 버튼 */}
          {post.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}

          {/* 하단 썸네일 리스트 */}
          {post.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 bg-black/50 rounded-full">
              {post.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentImageIndex 
                      ? 'border-orange-500 opacity-100 scale-110' 
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`썸네일 ${idx + 1}`}
                    className="w-full h-full object-cover"
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

// 댓글 아이템 컴포넌트
function CommentItem({ comment, onReply }: { comment: Comment; onReply: (commentId: string, nickname: string) => void }) {
  const [isLiked, setIsLiked] = useState(comment.isLikedByMe);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const formatDate = (dateString: string) => {
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

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <img 
          src={comment.author.avatar} 
          alt={comment.author.nickname}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900">{comment.author.nickname}</span>
              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <button
              onClick={() => {
                setIsLiked(!isLiked);
                setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
              }}
              className={`flex items-center gap-1 ${isLiked ? 'text-orange-600' : 'text-gray-500'} hover:text-orange-600`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              좋아요 {likeCount > 0 && likeCount}
            </button>
            <button
              onClick={() => onReply(comment.id, comment.author.nickname)}
              className="text-gray-500 hover:text-orange-600"
            >
              답글
            </button>
          </div>
        </div>
      </div>

      {/* 대댓글 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 space-y-3">
          {comment.replies.map(reply => (
            <div key={reply.id} className="flex gap-3">
              <img 
                src={reply.author.avatar} 
                alt={reply.author.nickname}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">{reply.author.nickname}</span>
                    <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <button className="flex items-center gap-1 text-gray-500 hover:text-orange-600">
                    <Heart className="w-3 h-3" />
                    좋아요
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
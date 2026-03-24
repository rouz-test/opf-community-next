import { useState } from 'react';
import { Link } from 'react-router';
import { RefreshCw, TrendingUp, Sparkles, Eye, Heart, MessageSquare, ChevronRight, HelpCircle, Lightbulb, MessageCircle, Star, Users, LayoutGrid, List, ChevronLeft, Search, PenSquare, UserCheck, Share2, Bookmark, MoreHorizontal, X, ThumbsUp, Filter, Edit, Trash2, EyeOff, Megaphone, BadgeCheck } from 'lucide-react';
import { 
  mockCommunityPosts, 
  mockNotices, 
  communityCategories, 
  getPopularPosts,
  orangePickArticles,
  CommunityPost 
} from '@/data/mockCommunityPosts';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { WritePostModal } from '@/app/components/WritePostModal';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export function CommunityHomePage() {
  // 로그인 상태 (데모용 - 실제로는 auth context 사용)
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [profileMode, setProfileMode] = useState<'real' | 'nickname'>('nickname');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  
  // 게시글 탐색 상태
  const [viewMode, setViewMode] = useState<'feed' | 'board'>('feed');
  const [sortBy, setSortBy] = useState<'recommended' | 'latest'>('recommended');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState(5); // 피드뷰 더보기용
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // 필터 모달 상태
  const postsPerPage = 10;
  
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

  // 하이라이트 게시글 (관리자 지정)
  const highlightPosts = [...mockNotices, ...mockCommunityPosts].filter(post => post.isHighlight);
  
  // 이번달 인기 게시글 TOP5
  const popularPosts = getPopularPosts(undefined, 5);

  // 모든 태그 추출
  const allTags = Array.from(
    new Set(mockCommunityPosts.flatMap(post => post.tags || []))
  );

  // 게시글 필터링 및 정렬
  const getFilteredAndSortedPosts = () => {
    let posts = [...mockCommunityPosts];

    // 태그 필터링
    if (selectedTags.length > 0) {
      posts = posts.filter(post => 
        post.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    // 정렬
    if (sortBy === 'recommended') {
      posts.sort((a, b) => b.likes - a.likes);
    } else {
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return posts;
  };

  const filteredPosts = getFilteredAndSortedPosts();

  // 피드뷰용 게시글 (더보기)
  const feedPosts = filteredPosts.slice(0, displayCount);

  // 게시판뷰용 게시글 (페이지네이션)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // 태그 토글
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setCurrentPage(1); // 페이지 초기화
    setDisplayCount(5); // 표시 개수 초기화
  };

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

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    const category = communityCategories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  // 캐러셀 설정
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    swipe: true,
    swipeToSlide: true,
    touchMove: true,
    draggable: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  // 게시글 제출 핸들러
  const handlePostSubmit = (postData: {
    title: string;
    content: string;
    tags: string[];
    isPromotion: boolean;
    images: File[];
  }) => {
    console.log('새 게시글:', postData);
    // TODO: 실제 API 호출로 게시글 저장
    alert('게시글이 성공적으로 등록되었습니다!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-6 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
          {/* 좌측 - 사용자 프로필 카드 */}
          <aside className="hidden lg:block">
            {isLoggedIn ? (
              <div className="sticky top-4 space-y-4">
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

                {/* 태그 필터 카드 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-xs font-semibold text-gray-900 mb-3">태그 필터</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="mt-3 text-xs text-orange-500 hover:text-orange-600 font-medium"
                    >
                      필터 초기화
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // 게스트 사용자는 공백으로 표시
              <div className="h-0"></div>
            )}
          </aside>

          {/* 중앙 - 하이라이트 & 게시글 탐색 */}
          <main className="space-y-6 min-w-0 overflow-hidden">
            {/* 검색 & 필터 & 글쓰기 */}
            <section>
              <div className="flex items-center gap-3">
                {/* 검색 필드 */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="게시글 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* 필터 버튼 */}
                <div className="relative">
                  <button
                    onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">필터</span>
                  </button>

                  {/* 필터 모달 */}
                  {isFilterModalOpen && (
                    <>
                      {/* 오버레이 */}
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsFilterModalOpen(false)}
                      />
                      
                      {/* 모달 컨텐츠 */}
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-sm text-gray-900">필터 설정</h3>
                          <button
                            onClick={() => setIsFilterModalOpen(false)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>

                        {/* 팔로잉 글 보기 */}
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <label className="text-xs font-medium text-gray-700 mb-2 block">
                            표시 옵션
                          </label>
                          <button
                            onClick={() => setShowFollowingOnly(!showFollowingOnly)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              showFollowingOnly
                                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4" />
                              <span>팔로잉 글만 보기</span>
                            </div>
                            {showFollowingOnly && (
                              <span className="text-orange-500">✓</span>
                            )}
                          </button>
                        </div>

                        {/* 정렬 순서 */}
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <label className="text-xs font-medium text-gray-700 mb-2 block">
                            정렬 순서
                          </label>
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                setSortBy('recommended');
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                sortBy === 'recommended'
                                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                <span>추천순</span>
                              </div>
                              {sortBy === 'recommended' && (
                                <span className="text-orange-500">✓</span>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSortBy('latest');
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                sortBy === 'latest'
                                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                <span>최신순</span>
                              </div>
                              {sortBy === 'latest' && (
                                <span className="text-orange-500">✓</span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* 뷰 모드 */}
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-2 block">
                            보기 방식
                          </label>
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                setViewMode('feed');
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                viewMode === 'feed'
                                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4" />
                                <span>피드뷰</span>
                              </div>
                              {viewMode === 'feed' && (
                                <span className="text-orange-500">✓</span>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setViewMode('board');
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                viewMode === 'board'
                                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <List className="w-4 h-4" />
                                <span>게시판뷰</span>
                              </div>
                              {viewMode === 'board' && (
                                <span className="text-orange-500">✓</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 글쓰기 버튼 */}
                <WritePostModal onSubmit={handlePostSubmit} currentUser={currentUser} />
              </div>
            </section>

            {/* 하이라이트 게시글 영역 */}
            {highlightPosts.length > 0 && (
              <section>
                <div className="highlight-carousel overflow-hidden">
                  <Slider {...carouselSettings}>
                    {highlightPosts.map(post => (
                      <div key={post.id} className="px-2">
                        <HighlightPostCard post={post} formatDate={formatDate} getCategoryName={getCategoryName} />
                      </div>
                    ))}
                  </Slider>
                </div>
              </section>
            )}

            {/* 게시글 목록 (피드뷰/게시판뷰) */}
            <section>
              {/* 게시글 목록 */}
              {viewMode === 'feed' ? (
                <>
                  <div className="space-y-4">
                    {feedPosts.map(post => (
                      <FeedPostCard key={post.id} post={post} formatDate={formatDate} getCategoryName={getCategoryName} />
                    ))}
                  </div>
                  {displayCount < filteredPosts.length && (
                    <div className="flex justify-center mt-6">
                      <Button
                        onClick={() => setDisplayCount(prev => prev + 5)}
                        variant="outline"
                        className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
                      >
                        더보기
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedPosts.map(post => (
                      <BoardPostRow key={post.id} post={post} formatDate={formatDate} getCategoryName={getCategoryName} />
                    ))}
                  </div>
                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-orange-500 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </main>

          {/* 우측 - 위젯 영역 */}
          <aside className="hidden lg:block space-y-4">
            {/* 이번달 인기 게시글 TOP5 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <h3 className="font-semibold text-sm text-gray-900">이번달 인기 게시글 TOP5</h3>
              </div>
              <div className="space-y-3">
                {popularPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/community/post/${post.id}`}
                    className="block"
                  >
                    <div className="flex gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-sm font-bold rounded ${
                        index === 0 ? 'bg-orange-500 text-white' :
                        index === 1 ? 'bg-orange-100 text-orange-600' :
                        index === 2 ? 'bg-orange-50 text-orange-600' :
                        'text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 line-clamp-2 hover:text-orange-500 transition-colors font-medium">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.commentCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 오렌지픽 콘텐츠 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900">오렌지픽</h3>
              </div>
              <div className="space-y-4">
                {orangePickArticles.map(article => (
                  <div key={article.id} className="group cursor-pointer">
                    <div className="aspect-video rounded-lg overflow-hidden mb-2 bg-gray-100">
                      <img 
                        src={article.thumbnail} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-orange-500 transition-colors mb-1">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                    <div className="text-xs text-gray-400">
                      {article.author}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// 하이라이트 게시글 카드 컴포넌트
function HighlightPostCard({ post, formatDate, getCategoryName }: { 
  post: CommunityPost; 
  formatDate: (date: string) => string;
  getCategoryName: (categoryId?: string) => string | null;
}) {
  return (
    <Link to={`/community/post/${post.id}`}>
      <div className="bg-gradient-to-br from-orange-50 to-white rounded-lg border-2 border-orange-200 p-4 hover:border-orange-300 hover:shadow-md transition-all h-[200px] flex flex-col cursor-grab active:cursor-grabbing">
        {/* 하이라이트 배지 */}
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-orange-500 text-white text-xs">
            {post.type === 'notice' ? '공지' : '추천'}
          </Badge>
          {post.category && (
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
              {getCategoryName(post.category)}
            </Badge>
          )}
        </div>

        {/* 게시글 제목 */}
        <h3 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* 게시글 내용 미리보기 */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-3 flex-1">
          {post.content}
        </p>

        {/* 작성자 및 메타 정보 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <img 
              src={post.author.avatar} 
              alt={post.author.nickname}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span>{post.author.nickname}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {post.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {post.commentCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// 카테고리 카드 컴포넌트
function CategoryCard({ category }: { category: { id: string; name: string; icon: string } }) {
  // 카테고리별 아이콘 매핑
  const iconMap: Record<string, JSX.Element> = {
    qna: <HelpCircle className="w-5 h-5" />,
    tips: <Lightbulb className="w-5 h-5" />,
    free: <MessageCircle className="w-5 h-5" />,
    review: <Star className="w-5 h-5" />,
    recruitment: <Users className="w-5 h-5" />,
  };

  const icon = iconMap[category.id] || <MessageCircle className="w-5 h-5" />;

  return (
    <Link to={`/community/category/${category.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-200 hover:shadow-sm transition-all group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-900 group-hover:text-orange-500 transition-colors">
              {category.name}
            </h3>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

// 피드뷰 게시글 카드 컴포넌트
function FeedPostCard({ post, formatDate, getCategoryName }: { 
  post: CommunityPost; 
  formatDate: (date: string) => string;
  getCategoryName: (categoryId?: string) => string | null;
}) {
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // 임시 이미지 데이터 (실제로는 post.images 사용)
  const images = post.images || [];
  const displayImages = images.slice(0, 2);
  const remainingImagesCount = Math.max(0, images.length - 2);

  // 내용 글자수 제한 (PC: 200자, 모바일: 100자)
  const contentPreview = post.content.length > 200 
    ? post.content.slice(0, 200) + '...' 
    : post.content;

  // 더보기 메뉴 핸들러
  const handleEdit = () => {
    console.log('수정:', post.id);
    setShowMoreMenu(false);
    // TODO: 수정 모달 열기
  };

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      console.log('삭제:', post.id);
      setShowMoreMenu(false);
      // TODO: 삭제 API 호출
    }
  };

  const handleHide = () => {
    console.log('숨김:', post.id);
    setShowMoreMenu(false);
    // TODO: 숨김 처리
  };

  const handleToggleProfile = () => {
    console.log('프로필 전환:', post.id);
    setShowMoreMenu(false);
    // TODO: 프로필 모드 전환
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
      {/* 팔로잉한 사람의 댓글이 있을 경우 상단에 표시 */}
      {post.highlightedComment && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
            <div className="flex items-center">
              <img 
                src={post.author.avatar} 
                alt={post.author.nickname}
                className="w-4 h-4 rounded-full object-cover"
              />
              <ChevronRight className="w-4 h-4 text-gray-400 mx-0.5" />
              <img 
                src={post.highlightedComment.author.avatar} 
                alt={post.highlightedComment.author.nickname}
                className="w-4 h-4 rounded-full object-cover"
              />
            </div>
            <span className="font-medium">{post.highlightedComment.author.nickname}</span>
            <span>님이 댓글을 남김</span>
          </div>
        </div>
      )}

      {/* 상단: 프로필 정보 */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={post.author.avatar} 
              alt={post.author.nickname}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900">{post.author.nickname}</span>
                {/* 실명 인증 아이콘 */}
                {post.isRealName && (
                  <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
                {post.author.position && (
                  <span className="text-xs text-gray-500">· {post.author.position}</span>
                )}
              </div>
              <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 홍보글 태그 */}
            {post.isPromotion && (
              <Badge className="bg-purple-500 text-white border-0 text-xs px-2.5 py-0.5 flex items-center gap-1">
                <Megaphone className="w-3 h-3" />
                <span>홍보</span>
              </Badge>
            )}
            
            {/* 더보기 버튼 */}
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit();
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
                        handleDelete();
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
                        handleHide();
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
                        handleToggleProfile();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{post.author.isRealName ? '닉네임으로 전환' : '실명으로 전환'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={tag}
                className={`text-xs px-2 py-0.5 ${
                  index === 0 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : index === 1
                    ? 'bg-orange-100 text-orange-700 border-orange-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
                variant="outline"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 제목 */}
        <Link to={`/community/post/${post.id}`}>
          <h3 className="font-bold text-base text-gray-900 mb-2 hover:text-orange-500 transition-colors">
            {post.title}
          </h3>
        </Link>

        {/* 내용 */}
        <div className="text-sm text-gray-700 leading-relaxed mb-3">
          <span className="hidden md:inline">{contentPreview}</span>
          <span className="inline md:hidden">
            {post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content}
          </span>
          {(post.content.length > 200 || (post.content.length > 100)) && (
            <Link 
              to={`/community/post/${post.id}`}
              className="text-orange-500 hover:text-orange-600 font-medium ml-1"
            >
              더보기
            </Link>
          )}
        </div>

        {/* 이미지 (최대 2개 표시) */}
        {displayImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {displayImages.map((image, index) => (
              <div 
                key={index}
                className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => {
                  setCurrentImageIndex(index);
                  setShowImageViewer(true);
                }}
              >
                <img 
                  src={image} 
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {/* +N 오버레이 (마지막 이미지이고 남은 이미지가 있을 때) */}
                {index === 1 && remainingImagesCount > 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      +{remainingImagesCount}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단: 반응 아이콘 */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            {/* 좋아요 */}
            <button className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition-colors group">
              <Heart className={`w-5 h-5 ${post.isLikedByMe ? 'fill-orange-500 text-orange-500' : 'group-hover:fill-orange-100'}`} />
              <span className="text-sm font-medium">{post.likes}</span>
            </button>

            {/* 댓글 */}
            <button className="flex items-center gap-1.5 text-gray-600 hover:text-blue-500 transition-colors group">
              <MessageSquare className="w-5 h-5 group-hover:fill-blue-100" />
              <span className="text-sm font-medium">{post.commentCount}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* 공유 */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
            </button>

            {/* 저장 */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 팔로잉한 사람의 댓글 표시 */}
        {post.highlightedComment && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex gap-2">
              <img 
                src={post.highlightedComment.author.avatar} 
                alt={post.highlightedComment.author.nickname}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">
                    {post.highlightedComment.author.nickname}
                  </span>
                  <span className="text-xs text-gray-500">
                    · {formatDate(post.highlightedComment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {post.highlightedComment.content}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-500 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>좋아요 {post.highlightedComment.likes}</span>
                  </button>
                  <button className="text-xs text-gray-500 hover:text-blue-500 transition-colors">
                    답글 달기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 이미지 뷰어 모달 */}
      {showImageViewer && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImageViewer(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-lg"
            onClick={() => setShowImageViewer(false)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img 
              src={images[currentImageIndex]} 
              alt={`Image ${currentImageIndex + 1}`}
              className="w-full h-auto rounded-lg"
            />
            
            {/* 이미지 네비게이션 */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* 이미지 인디케이터 */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* 이미지 카운터 */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 게시판뷰 게시글 행 컴포넌트
function BoardPostRow({ post, formatDate, getCategoryName }: { 
  post: CommunityPost; 
  formatDate: (date: string) => string;
  getCategoryName: (categoryId?: string) => string | null;
}) {
  return (
    <Link to={`/community/post/${post.id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all">
        <div className="flex gap-4">
          {/* 중앙: 태그 + 제목 */}
          <div className="flex-1 min-w-0">
            {/* 태그 */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {post.category && (
                <Badge variant="outline" className="bg-pink-100 text-pink-700 border-pink-200 text-xs px-2 py-0.5">
                  {getCategoryName(post.category)}
                </Badge>
              )}
              {post.tags && post.tags.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={tag}
                  variant="outline"
                  className={`text-xs px-2 py-0.5 ${
                    index === 0 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* 제목 - 홍보 태그를 제목 앞에 표시 */}
            <div className="flex items-start gap-2">
              {post.isPromotion && (
                <Badge className="bg-purple-500 text-white border-0 text-xs px-2.5 py-0.5 flex items-center gap-1 flex-shrink-0">
                  <Megaphone className="w-3 h-3" />
                  <span>홍보</span>
                </Badge>
              )}
              <h3 className="font-semibold text-base text-gray-900 hover:text-orange-500 transition-colors line-clamp-2">
                {post.title}
              </h3>
            </div>
          </div>

          {/* 우측: 작성자 정보 + 메타 정보 */}
          <div className="hidden md:flex flex-col items-end justify-between flex-shrink-0 min-w-[200px]">
            {/* 작성자 정보 */}
            <div className="flex items-center gap-2">
              <img 
                src={post.author.avatar} 
                alt={post.author.nickname}
                className="w-6 h-6 rounded-full object-cover"
              />
              <div className="text-right flex items-center gap-1.5">
                <p className="font-medium text-sm text-gray-900">{post.author.nickname}</p>
                {/* 실명 인증 아이콘 */}
                {post.isRealName && (
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                )}
                {/* 직책 표시 */}
                {post.author.position && (
                  <span className="text-xs text-gray-500">· {post.author.position}</span>
                )}
              </div>
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* 메타 정보 */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="text-xs">{formatDate(post.createdAt)}</span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {post.commentCount}
              </span>
              <button className="hover:text-gray-700 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 모바일: 메타 정보 */}
          <div className="flex md:hidden flex-col items-end justify-between flex-shrink-0">
            <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {post.commentCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Search, TrendingUp, Edit, Bell, BookOpen, HelpCircle, Lightbulb, MessageSquare, Star, Users } from 'lucide-react';
import { 
  mockCommunityPosts, 
  mockNotices,
  communityCategories, 
  CommunityPost,
  getPopularPosts 
} from '@/data/mockCommunityPosts';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Eye, Heart, MessageSquare as MessageSquareIcon } from 'lucide-react';

export function CommunityCategoryBoardPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  const category = communityCategories.find(c => c.id === categoryId);

  // 해당 카테고리의 게시글만 필터링
  const categoryPosts = mockCommunityPosts.filter(post => 
    post.type === 'community' && post.category === categoryId
  );

  // 검색 필터링
  const filteredPosts = categoryPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 정렬
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.likes - a.likes;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 해당 카테고리 인기 게시글
  const popularCategoryPosts = categoryPosts
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

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

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">카테고리를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">존재하지 않는 카테고리입니다.</p>
          <Link to="/community">
            <Button>커뮤니티 홈으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {getCategoryIcon(categoryId || '')}
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          </div>
          <p className="text-gray-600">
            {getCategoryDescription(categoryId || '')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6">
          {/* 좌측 사이드바 - 카테고리 목록 */}
          <aside className="hidden lg:block">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">카테고리</h3>
              <nav className="space-y-1">
                <Link
                  to="/community/category/qna"
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    categoryId === 'qna'
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Q&A</span>
                </Link>
                <Link
                  to="/community/category/tips"
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    categoryId === 'tips'
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>팁 공유</span>
                </Link>
                <Link
                  to="/community/category/free"
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    categoryId === 'free'
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>자유게시판</span>
                </Link>
                <Link
                  to="/community/category/review"
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    categoryId === 'review'
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  <span>후기</span>
                </Link>
                <Link
                  to="/community/category/recruitment"
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    categoryId === 'recruitment'
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>팀원 모집</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="space-y-4">
            {/* 글쓰기 버튼 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <Link to={`/community/write?category=${categoryId}`}>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  새 글 작성하기
                </Button>
              </Link>
            </div>

            {/* 공지사항 (있는 경우) */}
            {mockNotices.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-orange-500" />
                  <h3 className="font-semibold text-sm text-gray-900">공지사항</h3>
                </div>
                <div className="space-y-2">
                  {mockNotices.slice(0, 2).map(notice => (
                    <Link
                      key={notice.id}
                      to={`/community/post/${notice.id}`}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <Badge className="bg-orange-500 text-white text-xs">공지</Badge>
                      <p className="text-sm text-gray-900 flex-1 line-clamp-1">{notice.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 검색 및 정렬 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="게시글 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={(value: 'latest' | 'popular') => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">최신순</SelectItem>
                    <SelectItem value="popular">인기순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 게시글 목록 */}
            <div className="space-y-3">
              {sortedPosts.map(post => (
                <CommunityPostCard key={post.id} post={post} formatDate={formatDate} />
              ))}

              {sortedPosts.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <span className="text-5xl mb-4 block">{category.icon}</span>
                  <p className="text-gray-500 mb-2">아직 게시글이 없습니다</p>
                  <p className="text-sm text-gray-400 mb-4">첫 번째 게시글을 작성해보세요!</p>
                  <Link to={`/community/write?category=${categoryId}`}>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      글 작성하기
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </main>

          {/* 우측 사이드바 */}
          <aside className="hidden lg:block space-y-4">
            {/* 인기 게시글 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <h3 className="font-semibold text-sm text-gray-900">인기 게시글</h3>
              </div>
              {popularCategoryPosts.length > 0 ? (
                <div className="space-y-3">
                  {popularCategoryPosts.map((post, index) => (
                    <Link
                      key={post.id}
                      to={`/community/post/${post.id}`}
                      className="block"
                    >
                      <div className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-xs font-semibold text-orange-500">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 line-clamp-2 hover:text-orange-500 transition-colors">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {post.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquareIcon className="w-3 h-3" />
                              {post.commentCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">아직 게시글이 없습니다.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// 카테고리 설명
function getCategoryDescription(categoryId: string): string {
  const descriptions: Record<string, string> = {
    qna: '궁금한 점을 질문하고 답변을 받아보세요',
    tips: '유용한 팁과 노하우를 공유하는 공간입니다',
    free: '자유롭게 이야기를 나누는 공간입니다',
    review: '스터디, 강의, 서비스 후기를 공유하세요',
    recruitment: '함께할 팀원을 찾아보세요',
  };
  return descriptions[categoryId] || '';
}

// 카테고리 아이콘
function getCategoryIcon(categoryId: string): JSX.Element {
  const icons: Record<string, JSX.Element> = {
    qna: <HelpCircle className="w-4 h-4" />,
    tips: <Lightbulb className="w-4 h-4" />,
    free: <BookOpen className="w-4 h-4" />,
    review: <Star className="w-4 h-4" />,
    recruitment: <Users className="w-4 h-4" />,
  };
  return icons[categoryId] || <HelpCircle className="w-4 h-4" />;
}

// 커뮤니티 게시글 카드
function CommunityPostCard({ post, formatDate }: { post: CommunityPost; formatDate: (date: string) => string }) {
  return (
    <Link to={`/community/post/${post.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-200 hover:shadow-sm transition-all">
        {/* 게시글 헤더 */}
        <div className="flex items-start gap-3 mb-3">
          <img 
            src={post.author.avatar} 
            alt={post.author.nickname}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900">{post.author.nickname}</span>
            </div>
            <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {/* 게시글 제목 */}
        <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-1">
          {post.title}
        </h3>

        {/* 게시글 내용 미리보기 */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {post.content}
        </p>

        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 메타 정보 */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {post.views}
          </span>
          <span className="flex items-center gap-1">
            <Heart className={`w-4 h-4 ${post.isLikedByMe ? 'fill-orange-500 text-orange-500' : ''}`} />
            {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquareIcon className="w-4 h-4" />
            {post.commentCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
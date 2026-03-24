import { useState } from 'react';
import { Link } from 'react-router';
import { Search, BookOpen, TrendingUp } from 'lucide-react';
import { mockCommunityPosts, CommunityPost, getPopularPosts } from '@/data/mockCommunityPosts';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Eye, Heart, MessageSquare } from 'lucide-react';

export function CommunityStudyBoardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  // 스터디 게시글만 필터링
  const studyPosts = mockCommunityPosts.filter(post => post.type === 'study');

  // 검색 필터링
  const filteredPosts = studyPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.studyTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 정렬
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.likes - a.likes;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 인기 스터디 게시글
  const popularStudyPosts = getPopularPosts('study', 5);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">스터디 게시판</h1>
          </div>
          <p className="text-gray-600">스터디 활동을 통해 작성된 게시글을 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* 메인 콘텐츠 */}
          <main className="space-y-4">
            {/* 검색 및 정렬 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="스터디 게시글 검색..."
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
                <StudyPostCard key={post.id} post={post} formatDate={formatDate} />
              ))}

              {sortedPosts.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">스터디 게시글이 없습니다</p>
                  <p className="text-sm text-gray-400">스터디에 참여하여 첫 게시글을 작성해보세요!</p>
                </div>
              )}
            </div>
          </main>

          {/* 사이드바 */}
          <aside className="hidden lg:block space-y-4">
            {/* 스터디 게시판 안내 */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-4 sticky top-20">
              <h3 className="font-semibold text-sm text-orange-900 mb-2">스터디 게시판</h3>
              <p className="text-sm text-orange-800 mb-3">
                스터디 활동을 통해 작성된 게시글이 자동으로 모이는 공간입니다.
              </p>
              <div className="space-y-1.5 text-xs text-orange-700">
                <p>• 스터디 과제 공유</p>
                <p>• 학습 내용 정리</p>
                <p>• 인사이트 공유</p>
                <p>• 스터디 회고록</p>
              </div>
            </div>

            {/* 인기 스터디 게시글 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <h3 className="font-semibold text-sm text-gray-900">인기 게시글</h3>
              </div>
              <div className="space-y-3">
                {popularStudyPosts.map((post, index) => (
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
          </aside>
        </div>
      </div>
    </div>
  );
}

// 스터디 게시글 카드
function StudyPostCard({ post, formatDate }: { post: CommunityPost; formatDate: (date: string) => string }) {
  return (
    <Link to={`/community/post/${post.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-200 hover:shadow-sm transition-all">
        {/* 스터디 제목 */}
        <div className="mb-3 px-3 py-1.5 bg-orange-50 rounded text-sm text-orange-700 inline-block">
          📚 {post.studyTitle}
        </div>

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
            <MessageSquare className="w-4 h-4" />
            {post.commentCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
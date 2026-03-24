import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { communityCategories } from '@/data/mockCommunityPosts';

export function CommunityWritePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('edit'); // 수정 모드인 경우
  
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: 실제로는 API 호출
    console.log('게시글 저장:', formData);
    
    // 성공 후 커뮤니티 홈으로 이동
    navigate('/community');
  };

  const handleCancel = () => {
    if (window.confirm('작성을 취소하시겠습니까? 작성 중인 내용이 사라집니다.')) {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {postId ? '게시글 수정' : '새 글 작성'}
          </h1>
        </div>

        {/* 작성 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리 *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {communityCategories.filter(cat => cat.id !== 'all').map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              type="text"
              placeholder="제목을 입력하세요"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <Textarea
              id="content"
              placeholder="내용을 입력하세요&#10;&#10;마크다운 문법을 지원합니다."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              required
            />
          </div>

          {/* 태그 */}
          <div className="space-y-2">
            <Label htmlFor="tags">태그</Label>
            <Input
              id="tags"
              type="text"
              placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 스타트업, MVP, 개발)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
            <p className="text-xs text-gray-500">태그는 최대 5개까지 입력 가능합니다.</p>
          </div>

          {/* 이미지 첨부 (향후 구현) */}
          <div className="space-y-2">
            <Label>이미지 첨부</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
              <Button type="button" variant="outline" size="sm" disabled>
                파일 선택
              </Button>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG 파일만 가능 (최대 5MB)</p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!formData.category || !formData.title || !formData.content}
            >
              {postId ? '수정하기' : '작성하기'}
            </Button>
          </div>
        </form>

        {/* 작성 가이드 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm text-blue-900 mb-2">📝 글 작성 가이드</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 다른 사용자를 존중하는 내용으로 작성해주세요.</li>
            <li>• 광고성 게시글은 삭제될 수 있습니다.</li>
            <li>• 저작권을 침해하는 내용은 게시할 수 없습니다.</li>
            <li>• 구체적이고 명확한 제목을 작성하면 더 많은 답변을 받을 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

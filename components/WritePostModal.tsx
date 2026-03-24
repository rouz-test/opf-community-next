'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { X, Image as ImageIcon, Bold, Italic, Link as LinkIcon, List, PenSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface WritePostModalProps {
  onSubmit: (post: {
    title: string;
    content: string;
    tags: string[];
    isPromotion: boolean;
    images: File[];
  }) => void;
  currentUser?: {
    name: string;
    nickname: string;
    avatar: string;
    position: string;
  };
}

const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 10;
const MAX_TITLE_LENGTH = 200;

const availableTags = ['창업', '스타트업', '개발', '마케팅', '투자', '네트워킹', '피드백', '협업'];

export function WritePostModal({
  onSubmit,
  currentUser
}: WritePostModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPromotion, setIsPromotion] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    images?: string;
  }>({});
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  const [profileMode, setProfileMode] = useState<'real' | 'nickname'>('real');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // 프로필 모드 토글
  const toggleProfileMode = () => {
    setProfileMode(prev => prev === 'real' ? 'nickname' : 'real');
  };

  // 제목 변경 핸들러
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value);
      setErrors(prev => ({ ...prev, title: undefined }));
    } else {
      setErrors(prev => ({ ...prev, title: '최대 200자까지 입력 가능합니다.' }));
    }
  };

  // 이미지 파일 선택 핸들러
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // 기존 이미지와 합쳐서 10장 초과 체크
    if (images.length + files.length > MAX_IMAGES) {
      setErrors(prev => ({ 
        ...prev, 
        images: '한 게시글 당 최대 10장까지 첨부 가능합니다.' 
      }));
      return;
    }

    // 각 파일 유효성 검사
    for (const file of files) {
      // 포맷 체크
      if (!ALLOWED_FORMATS.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          images: '이미지는 JPG, PNG, JPEG, WebP 형식이 지원됩니다.' 
        }));
        return;
      }

      // 파일 크기 체크
      if (file.size > MAX_FILE_SIZE) {
        setErrors(prev => ({ 
          ...prev, 
          images: '파일 당 최대 크기는 10MB 입니다.' 
        }));
        return;
      }
    }

    // 유효성 검사 통과 시 이미지 추가
    setErrors(prev => ({ ...prev, images: undefined }));
    setImages(prev => [...prev, ...files]);

    // 미리보기 생성
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 이미지 제거
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setErrors(prev => ({ ...prev, images: undefined }));
  };

  // 텍스트 포맷 적용
  const applyFormat = (format: 'bold' | 'italic' | 'link' | 'list') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || '텍스트'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || '텍스트'}*`;
        break;
      case 'link':
        formattedText = `[${selectedText || '링크 텍스트'}](URL)`;
        break;
      case 'list':
        formattedText = `\n• ${selectedText || '항목'}`;
        break;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + formattedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // 태그 토글
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 전체 선택/해제
  const toggleAllTags = () => {
    if (selectedTags.length === availableTags.length) {
      // 전체 선택 상태면 전체 해제
      setSelectedTags([]);
    } else {
      // 아니면 전체 선택
      setSelectedTags([...availableTags]);
    }
  };

  // 개별 태그 제거
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // 제출 핸들러
  const handleSubmit = () => {
    // 유효성 검사
    const newErrors: typeof errors = {};
    
    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }
    
    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 게시글 제출
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      isPromotion,
      images
    });

    // 폼 초기화
    handleClose();
  };

  // 모달 닫기
  const handleClose = () => {
    setIsOpen(false);
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setIsPromotion(false);
    setImages([]);
    setImagePreviews([]);
    setErrors({});
    setIsTagDropdownOpen(false);
    setShowSaveConfirmModal(false);
    setProfileMode('real');
  };

  // 모달 닫기 시도 (임시 저장 확인)
  const handleCloseAttempt = () => {
    // 작성 중인 내용이 있는지 확인
    if (title.trim() || content.trim() || selectedTags.length > 0 || images.length > 0) {
      setShowSaveConfirmModal(true);
    } else {
      handleClose();
    }
  };

  // 임시 저장하고 닫기
  const handleSaveAndClose = () => {
    // TODO: 실제로는 localStorage 또는 서버에 임시 저장
    console.log('임시 저장:', { title, content, selectedTags, isPromotion, images });
    alert('임시 저장되었습니다.');
    handleClose();
  };

  // 저장하지 않고 닫기
  const handleCloseWithoutSave = () => {
    handleClose();
  };

  return (
    <>
      {/* 글쓰기 버튼 */}
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 h-auto whitespace-nowrap"
      >
        <PenSquare className="w-4 h-4 mr-2" />
        글쓰기
      </Button>

      {/* 모달 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-4 p-0 bg-black/50"
          onClick={handleCloseAttempt}
        >
          <div 
            className="bg-white md:rounded-2xl shadow-2xl w-full md:max-w-6xl h-full md:max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">글쓰기</h2>
              <button
                onClick={handleCloseAttempt}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 컨텐츠 영역 - 2열 레이아웃 */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                {/* 좌측 열 (3/4) - 제목, 내용 */}
                <div className="col-span-1 md:col-span-3 space-y-6">
                  {/* 사용자 정보 */}
                  <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <img 
                        src={currentUser?.avatar || "https://via.placeholder.com/120"} 
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {profileMode === 'real' ? currentUser?.name || "사용자 이름" : currentUser?.nickname || "닉네임"}
                        </div>
                        <div className="text-sm text-gray-500">{currentUser?.position || "사용자 직위"}</div>
                      </div>
                    </div>
                    <button
                      onClick={toggleProfileMode}
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {profileMode === 'real' ? '닉네임으로 작성' : '실명으로 작성'}
                    </button>
                  </div>

                  {/* 제목 입력 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 px-1">
                      제목
                    </label>
                    <input
                      type="text"
                      placeholder="제목을 입력해 주세요."
                      value={title}
                      onChange={handleTitleChange}
                      className="w-full px-4 py-3 text-lg font-medium text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <div className="flex items-center justify-between px-1">
                      {errors.title && (
                        <p className="text-sm text-red-500">{errors.title}</p>
                      )}
                      <p className={`text-xs ml-auto ${title.length >= MAX_TITLE_LENGTH - 10 ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>
                        {title.length}/{MAX_TITLE_LENGTH}
                      </p>
                    </div>
                  </div>

                  {/* 내용 입력 - 텍스트 에디터 */}
                  <div className="space-y-2 flex-1">
                    <label className="block text-sm font-medium text-gray-700 px-1">
                      내용
                    </label>
                    {/* 에디터 툴바 */}
                    <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <button
                        onClick={() => applyFormat('bold')}
                        className="p-2 hover:bg-white rounded transition-colors"
                        title="굵게"
                      >
                        <Bold className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => applyFormat('italic')}
                        className="p-2 hover:bg-white rounded transition-colors"
                        title="기울임"
                      >
                        <Italic className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => applyFormat('link')}
                        className="p-2 hover:bg-white rounded transition-colors"
                        title="링크"
                      >
                        <LinkIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => applyFormat('list')}
                        className="p-2 hover:bg-white rounded transition-colors"
                        title="목록"
                      >
                        <List className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    <textarea
                      ref={contentRef}
                      placeholder="내용을 입력해 주세요."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full min-h-[400px] px-4 py-3 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                    {errors.content && (
                      <p className="text-sm text-red-500 px-1">{errors.content}</p>
                    )}
                  </div>
                </div>

                {/* 우측 열 (1/4) - 태그, 이미지 */}
                <div className="col-span-1 md:col-span-1 space-y-6">
                  {/* 태그 선택 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 px-1">
                      태그 선택
                    </label>
                    
                    {/* 선택된 태그 표시 영역 */}
                    {selectedTags.length > 0 && (
                      <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map(tag => (
                            <Badge 
                              key={tag}
                              className="bg-orange-500 text-white px-2.5 py-1 text-xs flex items-center gap-1 hover:bg-orange-600 cursor-pointer shadow-sm"
                              onClick={() => removeTag(tag)}
                            >
                              #{tag}
                              <X className="w-3 h-3" />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 태그 선택 드롭다운 */}
                    <div className="relative">
                      <button
                        onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                        className="w-full px-3 py-2.5 text-left text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between text-sm"
                      >
                        <span className="text-xs">
                          {selectedTags.length > 0 
                            ? `${selectedTags.length}개 선택됨` 
                            : '태그 선택'}
                        </span>
                        <svg className={`w-4 h-4 transition-transform ${isTagDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isTagDropdownOpen && (
                        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                          <div className="flex flex-wrap gap-1.5">
                            {/* 전체 선택 버튼 */}
                            <button
                              onClick={toggleAllTags}
                              className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                selectedTags.length === availableTags.length
                                  ? 'bg-orange-500 text-white border-orange-500'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {selectedTags.length === availableTags.length ? '✓ 전체' : '전체'}
                            </button>

                            {/* 개별 태그 버튼들 */}
                            {availableTags.map(tag => (
                              <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                                  selectedTags.includes(tag)
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {selectedTags.includes(tag) && '✓ '}#{tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 이미지 첨부 영역 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 px-1">
                      이미지 첨부
                    </label>
                    
                    {/* 이미지 업로드 버튼 */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 hover:border-orange-300 transition-all cursor-pointer group"
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 group-hover:bg-orange-50 transition-colors">
                          <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          이미지 업로드
                        </p>
                        <p className="text-xs text-gray-500">
                          클릭 또는 드래그
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>

                    {/* 이미지 첨부 가이드 */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                      <p className="text-xs text-blue-800 font-medium mb-1">📋 가이드</p>
                      <ul className="text-xs text-blue-700 space-y-0.5">
                        <li>• JPG, PNG, WebP</li>
                        <li>• 최대 10MB/파일</li>
                        <li>• 최대 10장</li>
                      </ul>
                    </div>

                    {/* 이미지 미리보기 */}
                    {imagePreviews.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700 px-1">
                          첨부 ({imagePreviews.length}/{MAX_IMAGES})
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-square group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                              >
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {errors.images && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                        <p className="text-xs text-red-600 flex items-center gap-1.5">
                          <span className="text-red-500">⚠️</span>
                          <span className="leading-tight">{errors.images}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 푸터 */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                {/* 홍보글 체크박스 */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPromotion}
                    onChange={(e) => setIsPromotion(e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600">홍보글입니다</span>
                </label>

                {/* 버튼 그룹 */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="px-5"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-black hover:bg-gray-800 text-white px-5"
                  >
                    게시하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 임시 저장 확인 모달 */}
      {showSaveConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* 내용 */}
            <div className="p-6">
              <p className="text-base text-gray-900 text-center font-medium">
                임시 저장 하시겠습니까?
              </p>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex items-center gap-3 p-6 pt-0">
              <Button
                onClick={handleCloseWithoutSave}
                variant="outline"
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleSaveAndClose}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
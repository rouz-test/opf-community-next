

'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { X, Image as ImageIcon, Bold, Italic, Link as LinkIcon, List } from 'lucide-react';

export type WritePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    nickname: string;
    avatar: string;
    position: string;
  };
};

const WRITE_ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const WRITE_MAX_FILE_SIZE = 10 * 1024 * 1024;
const WRITE_MAX_IMAGES = 10;
const WRITE_MAX_TITLE_LENGTH = 200;
const WRITE_AVAILABLE_TAGS = [
  '창업',
  '스타트업',
  '개발',
  '마케팅',
  '투자',
  '네트워킹',
  '피드백',
  '협업',
];

export function WritePostModal({ isOpen, onClose, currentUser }: WritePostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPromotion, setIsPromotion] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [profileMode, setProfileMode] = useState<'real' | 'nickname'>('nickname');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    images?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setIsPromotion(false);
    setImages([]);
    setImagePreviews([]);
    setProfileMode('nickname');
    setIsTagDropdownOpen(false);
    setShowCloseConfirm(false);
    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCloseAttempt = () => {
    if (title.trim() || content.trim() || selectedTags.length > 0 || images.length > 0) {
      setShowCloseConfirm(true);
      return;
    }

    handleClose();
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length <= WRITE_MAX_TITLE_LENGTH) {
      setTitle(value);
      setErrors((prev) => ({ ...prev, title: undefined }));
      return;
    }

    setErrors((prev) => ({ ...prev, title: '제목은 최대 200자까지 입력할 수 있습니다.' }));
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > WRITE_MAX_IMAGES) {
      setErrors((prev) => ({
        ...prev,
        images: '이미지는 한 게시글당 최대 10장까지 첨부할 수 있습니다.',
      }));
      return;
    }

    for (const file of files) {
      if (!WRITE_ALLOWED_FORMATS.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          images: 'JPG, PNG, WebP 형식의 이미지만 업로드할 수 있습니다.',
        }));
        return;
      }

      if (file.size > WRITE_MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          images: '이미지 파일은 개당 최대 10MB까지 업로드할 수 있습니다.',
        }));
        return;
      }
    }

    setErrors((prev) => ({ ...prev, images: undefined }));
    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

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
    setErrors((prev) => ({ ...prev, content: undefined }));

    requestAnimationFrame(() => {
      textarea.focus();
      const newPosition = start + formattedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const toggleAllTags = () => {
    if (selectedTags.length === WRITE_AVAILABLE_TAGS.length) {
      setSelectedTags([]);
      return;
    }

    setSelectedTags([...WRITE_AVAILABLE_TAGS]);
  };

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};

    if (!title.trim()) {
      nextErrors.title = '제목을 입력해 주세요.';
    }

    if (!content.trim()) {
      nextErrors.content = '내용을 입력해 주세요.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    window.alert('게시글이 등록된 것처럼 처리했습니다. 실제 저장은 아직 연결되지 않았습니다.');
    handleClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-0 md:px-4"
        onClick={handleCloseAttempt}
      >
        <div
          className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl md:h-auto md:max-h-[92vh] md:max-w-6xl md:rounded-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 md:px-6 md:py-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 md:text-xl">글쓰기</h2>
            </div>
            <button
              type="button"
              onClick={handleCloseAttempt}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="글쓰기 모달 닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-4 md:p-6">
              <div className="space-y-6 md:col-span-3">
                <section className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt="작성자 프로필 이미지"
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {profileMode === 'real' ? currentUser.name : currentUser.nickname}
                      </p>
                      <p className="text-sm text-gray-500">{currentUser.position}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setProfileMode((prev) => (prev === 'real' ? 'nickname' : 'real'))}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    {profileMode === 'real' ? '닉네임으로 작성' : '실명으로 작성'}
                  </button>
                </section>

                <section className="space-y-2">
                  <label className="block px-1 text-sm font-medium text-gray-700">제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="제목을 입력해 주세요."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 md:text-lg"
                  />
                  <div className="flex items-center justify-between px-1">
                    <div>
                      {errors.title ? <p className="text-sm text-red-500">{errors.title}</p> : null}
                    </div>
                    <p
                      className={`text-xs ${
                        title.length >= WRITE_MAX_TITLE_LENGTH - 10
                          ? 'font-medium text-orange-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {title.length}/{WRITE_MAX_TITLE_LENGTH}
                    </p>
                  </div>
                </section>

                <section className="space-y-2">
                  <label className="block px-1 text-sm font-medium text-gray-700">내용</label>

                  <div className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-2">
                    <button
                      type="button"
                      onClick={() => applyFormat('bold')}
                      className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-white"
                      title="굵게"
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('italic')}
                      className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-white"
                      title="기울임"
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('link')}
                      className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-white"
                      title="링크"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('list')}
                      className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-white"
                      title="목록"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  <textarea
                    ref={contentRef}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      setErrors((prev) => ({ ...prev, content: undefined }));
                    }}
                    placeholder="내용을 입력해 주세요."
                    className="min-h-[320px] w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 md:min-h-[420px] md:text-base"
                  />

                  {errors.content ? <p className="px-1 text-sm text-red-500">{errors.content}</p> : null}
                </section>
              </div>

              <div className="space-y-6 md:col-span-1">
                <section className="space-y-3">
                  <label className="block px-1 text-sm font-medium text-gray-700">태그 선택</label>

                  {selectedTags.length > 0 ? (
                    <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-medium text-white"
                          >
                            #{tag}
                            <X className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTagDropdownOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <span>
                        {selectedTags.length > 0 ? `${selectedTags.length}개 선택됨` : '태그 선택'}
                      </span>
                      <span
                        className={`text-sm text-gray-400 transition-transform ${
                          isTagDropdownOpen ? 'rotate-180' : ''
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                    {isTagDropdownOpen ? (
                      <div className="absolute top-full z-10 mt-2 w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={toggleAllTags}
                            className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                              selectedTags.length === WRITE_AVAILABLE_TAGS.length
                                ? 'border-orange-500 bg-orange-500 text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {selectedTags.length === WRITE_AVAILABLE_TAGS.length ? '✓ 전체' : '전체'}
                          </button>

                          {WRITE_AVAILABLE_TAGS.map((tag) => {
                            const isSelected = selectedTags.includes(tag);

                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                  isSelected
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected ? '✓ ' : ''}#{tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="space-y-3">
                  <label className="block px-1 text-sm font-medium text-gray-700">이미지 첨부</label>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-all hover:border-orange-300 hover:bg-orange-50/40"
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors group-hover:bg-orange-100">
                        <ImageIcon className="h-5 w-5 text-gray-400 transition-colors group-hover:text-orange-500" />
                      </div>
                      <p className="text-xs font-medium text-gray-700">이미지 업로드</p>
                      <p className="mt-1 text-xs text-gray-500">클릭해서 파일 선택</p>
                    </div>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-blue-800">업로드 가이드</p>
                    <ul className="space-y-1 text-xs text-blue-700">
                      <li>• JPG, PNG, WebP 지원</li>
                      <li>• 파일당 최대 10MB</li>
                      <li>• 최대 10장까지 첨부 가능</li>
                    </ul>
                  </div>

                  {imagePreviews.length > 0 ? (
                    <div className="space-y-2">
                      <p className="px-1 text-xs font-medium text-gray-700">
                        첨부 ({imagePreviews.length}/{WRITE_MAX_IMAGES})
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={`${preview}-${index}`} className="group relative aspect-square">
                            <img
                              src={preview}
                              alt={`업로드 미리보기 ${index + 1}`}
                              className="h-full w-full rounded-xl border border-gray-200 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-md transition-opacity hover:bg-red-600 group-hover:opacity-100"
                              aria-label="이미지 제거"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {errors.images ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <p className="text-xs text-red-600">{errors.images}</p>
                    </div>
                  ) : null}
                </section>

                <section className="space-y-3">
                  <label className="block px-1 text-sm font-medium text-gray-700">게시글 유형</label>

                  <div className="rounded-2xl border border-gray-200 bg-white p-3">
                    <div className="inline-flex w-full rounded-xl bg-gray-100 p-1">
                      <button
                        type="button"
                        onClick={() => setIsPromotion(false)}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          !isPromotion
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        일반글
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPromotion(true)}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          isPromotion
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        홍보글
                      </button>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-gray-500">
                      {isPromotion
                        ? '홍보성 게시물로 표시되는 UI 상태입니다.'
                        : '일반적인 커뮤니티 게시글로 표시되는 UI 상태입니다.'}
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-5 py-4 md:px-6 md:py-5">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseAttempt}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                게시하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCloseConfirm ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-center text-base font-medium text-gray-900">
              작성 중인 내용이 있습니다. 닫으시겠어요?
            </p>
            <p className="mt-2 text-center text-sm text-gray-500">
              저장 기능은 아직 연결되지 않아, 닫으면 입력 내용이 사라집니다.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                계속 작성
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
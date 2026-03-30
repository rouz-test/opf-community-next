'use client';

import {
  Search,
  Filter,
  LayoutGrid,
  List,
  SquarePen,
  Tag,
  UserCheck,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export type CommunityToolbarProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  showFollowingOnly: boolean;
  onToggleFollowingOnly: () => void;
  sortBy: 'recommended' | 'latest';
  onSortByChange: (value: 'recommended' | 'latest') => void;
  viewMode: 'feed' | 'board';
  onViewModeChange: (value: 'feed' | 'board') => void;
  isFilterOpen: boolean;
  onToggleFilterOpen: () => void;
  onCloseFilterOpen: () => void;
  isTagFilterOpen: boolean;
  onToggleTagFilterOpen: () => void;
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  onWriteClick?: () => void;
  showWriteButton?: boolean;
  searchPlaceholder?: string;
  showFollowingFilter?: boolean;
};

export function CommunityToolbar({
  searchQuery,
  onSearchQueryChange,
  showFollowingOnly,
  onToggleFollowingOnly,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  isFilterOpen,
  onToggleFilterOpen,
  onCloseFilterOpen,
  isTagFilterOpen,
  onToggleTagFilterOpen,
  allTags,
  selectedTags,
  onToggleTag,
  onClearTags,
  onWriteClick,
  showWriteButton = true,
  searchPlaceholder = '게시글 검색...',
  showFollowingFilter = true,
}: CommunityToolbarProps) {
  return (
    <section className="relative">
      <div className="space-y-3 lg:space-y-0">
        <div className="hidden items-center gap-3 lg:flex">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="button"
            onClick={onToggleFilterOpen}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              isFilterOpen
                ? 'border-orange-200 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>필터</span>
          </button>

          {showWriteButton && onWriteClick ? (
            <button
              type="button"
              onClick={onWriteClick}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              <SquarePen className="h-4 w-4" />
              글쓰기
            </button>
          ) : null}
        </div>

        <div className="space-y-3 lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className={`grid gap-3 ${showWriteButton ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <button
              type="button"
              onClick={onToggleTagFilterOpen}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                isTagFilterOpen
                  ? 'border-orange-200 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>태그</span>
            </button>

            <button
              type="button"
              onClick={onToggleFilterOpen}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                isFilterOpen
                  ? 'border-orange-200 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>필터</span>
            </button>

            {showWriteButton && onWriteClick ? (
              <button
                type="button"
                onClick={onWriteClick}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                <SquarePen className="h-4 w-4" />
                <span>글쓰기</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="absolute right-0 top-full z-20 mt-3 hidden w-full max-w-[360px] rounded-2xl border border-gray-200 bg-white p-5 shadow-xl lg:block">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">필터 설정</h3>
            <button
              type="button"
              onClick={onCloseFilterOpen}
              className="text-xl leading-none text-gray-400 transition-colors hover:text-gray-600"
              aria-label="필터 닫기"
            >
              ×
            </button>
          </div>

          <div className="space-y-5">
            {showFollowingFilter ? (
              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">표시 옵션</p>
                <button
                  type="button"
                  onClick={onToggleFollowingOnly}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    showFollowingOnly
                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    팔로잉 글만 보기
                  </span>
                  {showFollowingOnly && <span className="text-base">✓</span>}
                </button>
              </div>
            ) : null}

            <div className={`${showFollowingFilter ? 'border-t border-gray-100 pt-5' : ''}`}>
              <p className={`mb-3 text-sm font-medium text-gray-700 ${showFollowingFilter ? '' : 'pt-0'}`}>
                정렬 순서
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onSortByChange('recommended')}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    sortBy === 'recommended'
                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    추천순
                  </span>
                  {sortBy === 'recommended' && <span className="text-base">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => onSortByChange('latest')}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    sortBy === 'latest'
                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    최신순
                  </span>
                  {sortBy === 'latest' && <span className="text-base">✓</span>}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="mb-3 text-sm font-medium text-gray-700">보기 방식</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onViewModeChange('feed')}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    viewMode === 'feed'
                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    피드뷰
                  </span>
                  {viewMode === 'feed' && <span className="text-base">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('board')}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    viewMode === 'board'
                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <List className="h-4 w-4" />
                    게시판뷰
                  </span>
                  {viewMode === 'board' && <span className="text-base">✓</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
            {isTagFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 lg:hidden">
          <button
            type="button"
            aria-label="태그 필터 닫기"
            className="absolute inset-0"
            onClick={onToggleTagFilterOpen}
          />
          <div className="relative z-10 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">태그 필터</h3>
              <button
                type="button"
                onClick={onToggleTagFilterOpen}
                className="text-xl leading-none text-gray-400 transition-colors hover:text-gray-600"
                aria-label="태그 필터 닫기"
              >
                ×
              </button>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">태그 선택</p>
                {selectedTags.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearTags}
                    className="text-xs font-medium text-orange-600 hover:text-orange-700"
                  >
                    전체 해제
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onToggleTag(tag)}
                      className={`rounded-full px-2.5 py-1 text-[13px] font-medium transition-colors ${
                        isSelected
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
            {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 lg:hidden">
          <button
            type="button"
            aria-label="필터 닫기"
            className="absolute inset-0"
            onClick={onCloseFilterOpen}
          />
          <div className="relative z-10 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">필터 설정</h3>
              <button
                type="button"
                onClick={onCloseFilterOpen}
                className="text-xl leading-none text-gray-400 transition-colors hover:text-gray-600"
                aria-label="필터 닫기"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              {showFollowingFilter ? (
                <div>
                  <p className="mb-3 text-sm font-medium text-gray-700">표시 옵션</p>
                  <button
                    type="button"
                    onClick={onToggleFollowingOnly}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      showFollowingOnly
                        ? 'border-orange-200 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      팔로잉 글만 보기
                    </span>
                    {showFollowingOnly && <span className="text-base">✓</span>}
                  </button>
                </div>
              ) : null}

              <div className={`${showFollowingFilter ? 'border-t border-gray-100 pt-5' : ''}`}>
                <p className={`mb-3 text-sm font-medium text-gray-700 ${showFollowingFilter ? '' : 'pt-0'}`}>
                  정렬 순서
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onSortByChange('recommended')}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      sortBy === 'recommended'
                        ? 'border-orange-200 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      추천순
                    </span>
                    {sortBy === 'recommended' && <span className="text-base">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSortByChange('latest')}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      sortBy === 'latest'
                        ? 'border-orange-200 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      최신순
                    </span>
                    {sortBy === 'latest' && <span className="text-base">✓</span>}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <p className="mb-3 text-sm font-medium text-gray-700">보기 방식</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onViewModeChange('feed')}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      viewMode === 'feed'
                        ? 'border-orange-200 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      피드뷰
                    </span>
                    {viewMode === 'feed' && <span className="text-base">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewModeChange('board')}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      viewMode === 'board'
                        ? 'border-orange-200 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <List className="h-4 w-4" />
                      게시판뷰
                    </span>
                    {viewMode === 'board' && <span className="text-base">✓</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
'use client';

import { useState } from 'react';

export type CommunityTagFilterProps = {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
};

export function CommunityTagFilter({
  allTags,
  selectedTags,
  onToggleTag,
  onClearTags,
}: CommunityTagFilterProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
          aria-expanded={isMobileOpen}
          aria-label="태그 필터 열기"
        >
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">태그 필터</h3>
            <p className="mt-1 text-xs text-gray-500">
              {selectedTags.length > 0
                ? `${selectedTags.length}개 선택됨`
                : '태그를 선택해 게시글을 좁혀보세요'}
            </p>
          </div>
          <span
            className={`ml-3 shrink-0 text-sm text-gray-400 transition-transform ${
              isMobileOpen ? 'rotate-180' : ''
            }`}
          >
            ▾
          </span>
        </button>

        {isMobileOpen && (
          <div className="border-t border-gray-100 px-4 py-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-gray-600">태그 선택</p>
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={onClearTags}
                  className="text-xs font-medium text-orange-500 hover:text-orange-600"
                >
                  초기화
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleTag(tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="hidden p-4 sm:block">
        <h3 className="mb-3 text-xs font-semibold text-gray-900">태그 필터</h3>
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
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
            type="button"
            onClick={onClearTags}
            className="mt-3 text-xs font-medium text-orange-500 hover:text-orange-600"
          >
            필터 초기화
          </button>
        )}
      </div>
    </section>
  );
}
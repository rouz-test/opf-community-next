'use client';

import { SquarePen } from 'lucide-react';

export type CommunityWriteActionProps = {
  onClick: () => void;
  variant?: 'floating' | 'sidebar';
};

export function CommunityWriteAction({
  onClick,
  variant = 'floating',
}: CommunityWriteActionProps) {
  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
      >
        <SquarePen className="h-4 w-4" />
        <span>글쓰기</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition-all duration-200 hover:scale-105 hover:shadow-[0_16px_36px_rgba(0,0,0,0.3)] active:scale-95 active:translate-y-[1px] lg:hidden"
      aria-label="글쓰기"
      title="글쓰기"
    >
      <SquarePen className="h-5 w-5" />
    </button>
  );
}
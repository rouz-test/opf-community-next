'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useMobileNav } from '@/app/user/components/providers/MobileNavProvider';

export default function MobileNavDrawer() {
  const { isOpen, closeNav } = useMobileNav();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      <button
        type="button"
        aria-label="메뉴 닫기"
        onClick={closeNav}
        className="absolute inset-0 bg-black/30"
      />

      <div className="absolute left-0 top-0 flex h-full w-[320px] max-w-[85vw] flex-col border-r border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-gray-400">Orange Park</p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900">메뉴</h2>
          </div>

          <button
            type="button"
            onClick={closeNav}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-5">
          <ul className="space-y-2">
            <li>
              <Link
                href="/user/community"
                onClick={closeNav}
                className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600"
              >
                커뮤니티
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={closeNav}
                className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600"
              >
                캠퍼스
              </button>
            </li>
            <li>
              <Link
                href="/user/article"
                onClick={closeNav}
                className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600"
              >
                아티클
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
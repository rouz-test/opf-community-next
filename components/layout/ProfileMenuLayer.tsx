'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useProfileMenu } from '@/components/providers/ProfileMenuProvider';

export default function ProfileMenuLayer() {
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();
  const { isOpen, anchor, closeProfileMenu, showCommunitySwitch, onToggleProfileMode } = useProfileMenu();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeProfileMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeProfileMenu]);

  const menuWidth = 180;
  const defaultTop = 64;
  const defaultLeft = typeof window !== 'undefined' ? window.innerWidth - 24 : 0;
  const computedTop = anchor?.top ?? defaultTop;
  const computedLeft = anchor ? Math.max(16, anchor.left - menuWidth) : Math.max(16, defaultLeft - menuWidth);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110]">
      <button
        type="button"
        aria-label="프로필 메뉴 닫기"
        onClick={closeProfileMenu}
        className="absolute inset-0 bg-black/20"
      />

      <div
        className="absolute w-[180px] overflow-hidden rounded-2xl border border-gray-200 bg-white py-2 shadow-lg"
        style={{ top: computedTop, left: computedLeft }}
      >
        {showCommunitySwitch ? (
          <>
            <button
              type="button"
              onClick={() => {
                closeProfileMenu();
                onToggleProfileMode?.();
              }}
              className="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600"
            >
              계정 전환
            </button>
            <div className="my-2 h-px bg-gray-100" />
          </>
        ) : null}

        <button
          type="button"
          onClick={() => {
            closeProfileMenu();
            router.push('/mypage');
          }}
          className="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600"
        >
          커뮤니티
        </button>
        <button
          type="button"
          onClick={() => {
            closeProfileMenu();
            router.push('/mypage');
          }}
          className="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600"
        >
          캠퍼스
        </button>
        <button
          type="button"
          onClick={() => {
            closeProfileMenu();
            router.push('/mypage');
          }}
          className="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600"
        >
          설정
        </button>
        <div className="my-2 h-px bg-gray-100" />
        <button
          type="button"
          onClick={() => {
            closeProfileMenu();
            setIsLoggedIn(false);
          }}
          className="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
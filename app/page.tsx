

'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F7FB]">
      <div className="flex flex-col gap-4">
        <Link
          href="/user"
          className="w-[240px] rounded-lg border border-[#E5E7EB] bg-white px-6 py-4 text-center text-[14px] font-medium text-[#111827] shadow-sm transition hover:bg-[#F9FAFB]"
        >
          유저 페이지로 이동
        </Link>

        <Link
          href="/admin"
          className="w-[240px] rounded-lg border border-[#E5E7EB] bg-white px-6 py-4 text-center text-[14px] font-medium text-[#111827] shadow-sm transition hover:bg-[#F9FAFB]"
        >
          관리자 페이지로 이동
        </Link>
      </div>
    </div>
  );
}
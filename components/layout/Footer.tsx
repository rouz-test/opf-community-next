

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="bg-[#ff5a1f]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-white/70">
              <span className="text-sm">⌄</span>
            </div>
            <p className="text-base font-semibold sm:text-[17px]">오렌지플래닛 뉴스레터 구독하기</p>
          </div>

          <button
            type="button"
            className="inline-flex h-12 items-center gap-4 rounded-full bg-white px-5 text-sm font-semibold text-[#ff5a1f] shadow-sm transition-transform hover:scale-[1.02]"
          >
            <span className="hidden sm:inline">바로가기</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5a1f] text-lg text-white">
              →
            </span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[620px]">
            <h3 className="mb-5 text-2xl font-bold text-[#ff5a1f] sm:text-[36px] sm:leading-none md:text-[40px]">
              재단법인 오렌지플래닛
            </h3>

            <div className="space-y-1.5 text-sm leading-6 text-[#ff5a1f] sm:text-base">
              <p>서울 강남구 테헤란로 217 오렌지플래닛 2~6F</p>
              <p>사업자번호 : 151-82-00395 센터번호 : 02-2192-5297</p>
            </div>

            <p className="mt-6 text-sm leading-6 text-[#ff5a1f] sm:text-base">
              Copyright 2024© ORANGE PLANET FOUNDATION. All rights reserved.
            </p>
          </div>

          <div className="w-full max-w-[340px]">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold text-[#ff5a1f] sm:text-base">
              <Link href="#" className="hover:opacity-80">
                서비스 이용약관
              </Link>
              <Link href="#" className="text-gray-900 hover:opacity-80">
                개인정보 처리방침
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-[#ff5a1f] sm:text-[17px]">
              <Link href="#" className="hover:opacity-80">
                Instagram
              </Link>
              <Link href="#" className="hover:opacity-80">
                LinkedIn
              </Link>
            </div>

            <div className="mt-8">
              <div className="relative">
                <select
                  className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-400 outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Family Site
                  </option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  ˅
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


'use client';

import { useState } from 'react';

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-orange-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function MyPageSettingsNotificationsPage() {
  const [isServiceEmailEnabled, setIsServiceEmailEnabled] = useState(false);
  const [isNewsletterEnabled, setIsNewsletterEnabled] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[960px]">
      <header className="space-y-1">
      <h1 className="text-2xl font-semibold text-gray-900">설정</h1>
       
        
      </header>

      <div className="mt-6 space-y-16">
        <section>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">알림</h2>
          <div className="rounded-[20px] bg-white px-6 py-5 shadow-sm ring-1 ring-gray-200">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">서비스 알림 이메일 정보 수신</h2>
                  <p className="mt-2 text-xs text-gray-400">
                    *모집 알림, 멘션 알림 등 중요한 알림이 전송됩니다.
                  </p>
                </div>
                <ToggleSwitch
                  checked={isServiceEmailEnabled}
                  onChange={() => setIsServiceEmailEnabled((prev) => !prev)}
                />
              </div>

              <div className="flex items-start justify-between gap-4 border-t border-gray-100 pt-5">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">뉴스레터 정보 수신</h2>
                </div>
                <ToggleSwitch
                  checked={isNewsletterEnabled}
                  onChange={() => setIsNewsletterEnabled((prev) => !prev)}
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold text-gray-900">회원 탈퇴</h2>
          <div className="rounded-[20px] bg-white px-6 py-5 shadow-sm ring-1 ring-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-900">회원 탈퇴하기</p>
              <button
                type="button"
                className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
              >
                회원탈퇴
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { communityAuthors } from '@/data/mockCommunityPosts';

type ProfileMode = 'real' | 'nickname';

export default function MyPageSettingsProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileMode>('real');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');

    if (tab === 'real' || tab === 'nickname') {
      setActiveTab(tab);
    }
  }, []);
  const realProfile = communityAuthors.startupDreamerReal;
  const nicknameProfile = communityAuthors.startupDreamer;

  const currentProfile = useMemo(
    () => (activeTab === 'real' ? realProfile : nicknameProfile),
    [activeTab, realProfile, nicknameProfile],
  );

  return (
    <div className="mx-auto w-full max-w-[960px]">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">프로필</h1>
      </header>

      <section className="mt-6 rounded-[28px] bg-white px-7 py-8 shadow-sm ring-1 ring-gray-200 sm:px-8 sm:py-9">
        <div className="border-b border-gray-200">
          <div className="grid grid-cols-2">
            {[
              { key: 'real' as const, label: '실명' },
              { key: 'nickname' as const, label: '닉네임' },
            ].map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-3 pb-3 pt-1 text-center text-sm font-semibold transition-colors ${
                    isActive ? 'text-orange-500' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                  {isActive ? (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-orange-500" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-gray-900">프로필 사진</h2>
            <div className="mt-5 flex flex-col items-start gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full ring-1 ring-gray-200">
                <img
                  src={currentProfile.avatar}
                  alt={activeTab === 'real' ? currentProfile.name : currentProfile.nickname}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
              >
                사진 업로드
              </button>
              <p className="text-xs text-gray-400">
                *10MB 이하 PNG / JPG / SVG 파일만 업로드해 주세요.
              </p>
            </div>
          </section>

          {activeTab === 'real' ? (
            <section>
              <h2 className="text-sm font-semibold text-gray-900">본인 인증 정보</h2>
              <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">본인인증이 필요합니다</p>
                  <p className="mt-1 text-xs text-gray-400">
                    원활한 서비스 이용을 위해 본인인증을 완료해 주세요.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <ShieldCheck className="h-4 w-4" />
                  휴대폰 본인인증
                </button>
              </div>
            </section>
          ) : null}

          <section className="space-y-6">
            {activeTab === 'real' ? (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">연결된 이메일</label>
                <input
                  type="text"
                  value="user@example.com"
                  readOnly
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-400 outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">닉네임</label>
                <input
                  type="text"
                  value={nicknameProfile.nickname}
                  placeholder="닉네임을 입력해 주세요."
                  readOnly
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none"
                />
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              {activeTab === 'real' ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">소속</label>
                  <input
                    type="text"
                    placeholder="소속명을 입력해 주세요."
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-300"
                  />
                </div>
              ) : null}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">직책</label>
                <input
                  type="text"
                  defaultValue={currentProfile.position ?? ''}
                  placeholder="직책을 입력해 주세요."
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-300"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              className="min-w-[92px] rounded-xl border border-orange-300 bg-orange-50 px-5 py-2.5 text-sm font-semibold text-orange-500 transition-colors hover:bg-orange-100"
            >
              저장
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState } from 'react';
import AnalyticsContentRankingTab from './AnalyticsContentRankingTab';
import AnalyticsProfileRankingTab from './AnalyticsProfileRankingTab';
import AnalyticsOverviewTab from './AnalyticsOverviewTab';

const analyticsTabs = [
  { key: 'default', label: '기본' },
  { key: 'profile', label: '프로필 순위' },
  { key: 'content', label: '게시글 순위' },
] as const;

type AnalyticsTabKey = (typeof analyticsTabs)[number]['key'];

type DateRangeKey = 'today' | '7days' | '30days' | '90days' | 'all';

const dateRangeOptions: Array<{ key: DateRangeKey; label: string }> = [
  { key: 'today', label: '오늘' },
  { key: '7days', label: '최근 7일' },
  { key: '30days', label: '최근 30일' },
  { key: '90days', label: '최근 90일' },
  { key: 'all', label: '전체' },
];

export default function CommunityAnalyticsPage() {
    const [activeTab, setActiveTab] = useState<AnalyticsTabKey>('default');
    const [dateRange, setDateRange] = useState<DateRangeKey>('today');

  return (
    <div className="space-y-6">
      <section className="space-y-3">
      <div>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            {analyticsTabs.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    'relative pb-2 text-[12px] font-medium transition',
                    isActive ? 'text-[#F97316]' : 'text-[#6B7280] hover:text-[#111827]',
                  ].join(' ')}
                >
                  {tab.label}
                  {isActive ? (
                    <span className="absolute left-0 right-0 bottom-0 h-[2px] rounded-full bg-[#F97316]" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pb-1">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangeKey)}
                className="appearance-none inline-flex h-9 min-w-[72px] items-center rounded-lg border border-[#F97316] bg-white px-3 pr-8 text-[13px] font-medium text-[#F97316]"
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#F97316]">
                ▾
              </span>
            </div>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-lg border border-[#F97316] bg-white px-5 text-[13px] font-medium text-[#F97316] hover:bg-[#FFF7ED]"
            >
              다운로드
            </button>
          </div>
        </div>
      </section>

      {activeTab === 'default' ? (
        <AnalyticsOverviewTab dateRange={dateRange} />
      ) : activeTab === 'profile' ? (
        <AnalyticsProfileRankingTab />
      ) : (
        <AnalyticsContentRankingTab />
      )}
    </div>
  );
}

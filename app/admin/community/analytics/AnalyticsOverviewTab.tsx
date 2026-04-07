

'use client';

type DateRangeKey = 'today' | '7days' | '30days' | '90days' | 'all';

type SummaryCardItem = {
  title: string;
  total: string;
  realName: string;
  nickname: string;
  children?: SummaryCardItem[];
};

type TagChartItem = {
  label: string;
  count: number;
};

const summaryCardsByRange: Record<
  DateRangeKey,
  {
    title: string;
    description: string;
    cards: SummaryCardItem[];
  }
> = {
  today: {
    title: '오늘 기준 현황',
    description: '오늘 기준으로 집계된 데이터입니다.',
    cards: [
      {
        title: '게시글',
        total: '186',
        realName: '104',
        nickname: '82',
        children: [
          {
            title: '조회 수',
            total: '12,480',
            realName: '11,920',
            nickname: '560',
          },
          {
            title: '보관 게시글',
            total: '43',
            realName: '9',
            nickname: '34',
          },
        ],
      },
      {
        title: '댓글 · 대댓글',
        total: '418',
        realName: '289',
        nickname: '129',
        children: [
          {
            title: '일반 댓글',
            total: '336',
            realName: '214',
            nickname: '122',
          },
          {
            title: '대댓글',
            total: '82',
            realName: '75',
            nickname: '7',
          },
        ],
      },
      {
        title: '전체 반응 수',
        total: '1,246',
        realName: '812',
        nickname: '434',
        children: [
          {
            title: '좋아요 수',
            total: '812',
            realName: '521',
            nickname: '291',
          },
          {
            title: '저장 수',
            total: '434',
            realName: '291',
            nickname: '143',
          },
        ],
      },
      {
        title: '활동 정지',
        total: '3',
        realName: '2',
        nickname: '1',
      },
    ],
  },
  '7days': {
    title: '최근 7일 기준 현황',
    description: '최근 7일 기준으로 집계된 데이터입니다.',
    cards: [
      {
        title: '게시글',
        total: '264',
        realName: '151',
        nickname: '113',
        children: [
          {
            title: '조회 수',
            total: '18,240',
            realName: '17,120',
            nickname: '1,120',
          },
          {
            title: '보관 게시글',
            total: '58',
            realName: '14',
            nickname: '44',
          },
        ],
      },
      {
        title: '댓글 · 대댓글',
        total: '582',
        realName: '398',
        nickname: '184',
        children: [
          {
            title: '일반 댓글',
            total: '461',
            realName: '296',
            nickname: '165',
          },
          {
            title: '대댓글',
            total: '121',
            realName: '102',
            nickname: '19',
          },
        ],
      },
      {
        title: '전체 반응 수',
        total: '1,864',
        realName: '1,204',
        nickname: '660',
        children: [
          {
            title: '좋아요 수',
            total: '1,204',
            realName: '771',
            nickname: '433',
          },
          {
            title: '저장 수',
            total: '660',
            realName: '433',
            nickname: '227',
          },
        ],
      },
      {
        title: '활동 정지',
        total: '4',
        realName: '3',
        nickname: '1',
      },
    ],
  },
  '30days': {
    title: '최근 30일 기준 현황',
    description: '최근 30일 기준으로 집계된 데이터입니다.',
    cards: [
      {
        title: '게시글',
        total: '512',
        realName: '298',
        nickname: '214',
        children: [
          {
            title: '조회 수',
            total: '34,920',
            realName: '32,440',
            nickname: '2,480',
          },
          {
            title: '보관 게시글',
            total: '104',
            realName: '22',
            nickname: '82',
          },
        ],
      },
      {
        title: '댓글 · 대댓글',
        total: '1,042',
        realName: '726',
        nickname: '316',
        children: [
          {
            title: '일반 댓글',
            total: '828',
            realName: '551',
            nickname: '277',
          },
          {
            title: '대댓글',
            total: '214',
            realName: '175',
            nickname: '39',
          },
        ],
      },
      {
        title: '전체 반응 수',
        total: '3,782',
        realName: '2,412',
        nickname: '1,370',
        children: [
          {
            title: '좋아요 수',
            total: '2,412',
            realName: '1,528',
            nickname: '884',
          },
          {
            title: '저장 수',
            total: '1,370',
            realName: '884',
            nickname: '486',
          },
        ],
      },
      {
        title: '활동 정지',
        total: '6',
        realName: '4',
        nickname: '2',
      },
    ],
  },
  '90days': {
    title: '최근 90일 기준 현황',
    description: '최근 90일 기준으로 집계된 데이터입니다.',
    cards: [
      {
        title: '게시글',
        total: '824',
        realName: '512',
        nickname: '312',
        children: [
          {
            title: '조회 수',
            total: '61,280',
            realName: '57,940',
            nickname: '3,340',
          },
          {
            title: '보관 게시글',
            total: '167',
            realName: '41',
            nickname: '126',
          },
        ],
      },
      {
        title: '댓글 · 대댓글',
        total: '2,046',
        realName: '1,468',
        nickname: '578',
        children: [
          {
            title: '일반 댓글',
            total: '1,622',
            realName: '1,112',
            nickname: '510',
          },
          {
            title: '대댓글',
            total: '424',
            realName: '356',
            nickname: '68',
          },
        ],
      },
      {
        title: '전체 반응 수',
        total: '6,112',
        realName: '4,028',
        nickname: '2,084',
        children: [
          {
            title: '좋아요 수',
            total: '4,028',
            realName: '2,621',
            nickname: '1,407',
          },
          {
            title: '저장 수',
            total: '2,084',
            realName: '1,407',
            nickname: '677',
          },
        ],
      },
      {
        title: '활동 정지',
        total: '11',
        realName: '7',
        nickname: '4',
      },
    ],
  },
  all: {
    title: '전체 기준 현황',
    description: '서비스 전체 기준으로 누적된 데이터입니다.',
    cards: [
      {
        title: '게시글',
        total: '1,284',
        realName: '842',
        nickname: '442',
        children: [
          {
            title: '조회 수',
            total: '12,480',
            realName: '11,920',
            nickname: '560',
          },
          {
            title: '보관 게시글',
            total: '232',
            realName: '61',
            nickname: '171',
          },
        ],
      },
      {
        title: '댓글 · 대댓글',
        total: '3,482',
        realName: '2,744',
        nickname: '738',
        children: [
          {
            title: '일반 댓글',
            total: '2,761',
            realName: '2,103',
            nickname: '658',
          },
          {
            title: '대댓글',
            total: '721',
            realName: '641',
            nickname: '80',
          },
        ],
      },
      {
        title: '전체 반응 수',
        total: '8,964',
        realName: '6,182',
        nickname: '2,782',
        children: [
          {
            title: '좋아요 수',
            total: '6,182',
            realName: '4,208',
            nickname: '1,974',
          },
          {
            title: '저장 수',
            total: '2,782',
            realName: '1,974',
            nickname: '808',
          },
        ],
      },
      {
        title: '활동 정지',
        total: '17',
        realName: '11',
        nickname: '6',
      },
    ],
  },
};

const cumulativeTagChartItems: TagChartItem[] = [
  { label: 'MVP', count: 184 },
  { label: '스타트업', count: 162 },
  { label: '개발', count: 149 },
  { label: 'BM', count: 133 },
  { label: '지원사업', count: 118 },
  { label: '마케팅', count: 102 },
  { label: 'IR', count: 94 },
  { label: 'UX', count: 83 },
  { label: '세무', count: 71 },
  { label: '기타', count: 156 },
];

const periodTagChartItems: TagChartItem[] = [
  { label: 'MVP', count: 26 },
  { label: '스타트업', count: 22 },
  { label: '개발', count: 20 },
  { label: 'BM', count: 18 },
  { label: '지원사업', count: 15 },
  { label: '마케팅', count: 13 },
  { label: 'IR', count: 11 },
  { label: 'UX', count: 9 },
  { label: '세무', count: 7 },
  { label: '기타', count: 19 },
];

function SummaryCard({ card }: { card: SummaryCardItem }) {
  const real = parseInt(card.realName.replace(/[^0-9]/g, '')) || 0;
  const nick = parseInt(card.nickname.replace(/[^0-9]/g, '')) || 0;
  const parsedTotal = parseInt(card.total.replace(/[^0-9]/g, '')) || 0;
  const total = parsedTotal || real + nick || 1;
  const realRatio = Math.max(0, Math.min(100, (real / total) * 100));
  const nickRatio = Math.max(0, Math.min(100, (nick / total) * 100));

  const leftIndicator = '실명';
  const rightIndicator = '닉네임';

  const normalizeIndicatorValue = (value: string) =>
    value
      .replace(/^실명\s*/u, '')
      .replace(/^닉네임\s*/u, '')
      .trim();

  const leftValue = normalizeIndicatorValue(card.realName);
  const rightValue = normalizeIndicatorValue(card.nickname);

  if (card.children?.length) {
    return (
      <article className="min-w-0 flex-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-3">
        <div className="text-[12px] font-medium text-[#6B7280]">{card.title}</div>

        <div className="mt-2 text-[22px] font-semibold leading-none text-[#111827]">
          {card.total}
        </div>

        <div className="mt-3 flex items-center justify-between gap-4 text-[11px] text-[#6B7280]">
          <span className="truncate">
            {leftIndicator} {leftValue}
          </span>
          <span className="truncate text-right">
            {rightIndicator} {rightValue}
          </span>
        </div>

        <div className="mt-2">
          <div
            className="h-2.5 rounded-full border border-[#E5E7EB]"
            style={{
              background: `linear-gradient(to right, #FDBA74 0%, #FDBA74 ${realRatio}%, #D1D5DB ${realRatio}%, #D1D5DB 100%)`,
            }}
          />
          <div className="mt-1 flex items-center justify-between text-[10px] text-[#9CA3AF]">
            <span>{Math.round(realRatio)}%</span>
            <span>{Math.round(nickRatio)}%</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#F3F4F6] pt-4">
          {card.children.map((child) => (
            <SummaryCard key={child.title} card={child} />
          ))}
        </div>
      </article>
    );
  }

  return (
    <article 
    style ={{ width: 256}}
    className="min-w-0 flex-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-3">
      <div className="text-[12px] font-medium text-[#6B7280]">{card.title}</div>

      <div className="mt-2 text-[22px] font-semibold leading-none text-[#111827]">
        {card.total}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-[11px] text-[#6B7280]">
        <span className="truncate">
          {leftIndicator} {leftValue}
        </span>
        <span className="truncate text-right">
          {rightIndicator} {rightValue}
        </span>
      </div>

      <div className="mt-2">
        <div
          className="h-2.5 rounded-full border border-[#E5E7EB]"
          style={{
            background: `linear-gradient(to right, #FDBA74 0%, #FDBA74 ${realRatio}%, #D1D5DB ${realRatio}%, #D1D5DB 100%)`,
          }}
        />
        <div className="mt-1 flex items-center justify-between text-[10px] text-[#9CA3AF]">
          <span>{Math.round(realRatio)}%</span>
          <span>{Math.round(nickRatio)}%</span>
        </div>
      </div>
    </article>
  );
}
type AnalyticsOverviewTabProps = {
    dateRange: DateRangeKey;
  };
  
  export default function AnalyticsOverviewTab({ dateRange }: AnalyticsOverviewTabProps) {
    const selectedSummaryPanel = summaryCardsByRange[dateRange];

  return (
    <section className="space-y-4">
      <section className="rounded-lg border border-[#E5E7EB] bg-white p-4">
               <div className="flex items-start justify-between gap-4 border-b border-[#F3F4F6] pb-3">
          <div>
            <h2 className="text-[13px] font-semibold text-[#111827]">{selectedSummaryPanel.title}</h2>
            <p className="mt-1 text-[12px] text-[#6B7280]">{selectedSummaryPanel.description}</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            {selectedSummaryPanel.cards.map((card) => (
              <SummaryCard key={`${selectedSummaryPanel.title}-${card.title}`} card={card} />
            ))}
          </div>

          <article className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div>
              <h3 className="text-[12px] font-semibold text-[#111827]">태그 현황</h3>
              <p className="mt-1 text-[11px] text-[#6B7280]">
                {dateRange === 'all' ? '전체 기준 상위 태그 분포입니다.' : '선택한 기간 기준 상위 태그 분포입니다.'}
              </p>
            </div>

            <div className="mt-4 h-[220px] rounded-md border border-[#E5E7EB] bg-[#FCFCFD] px-4 pb-4 pt-6">
              {(() => {
                const items = dateRange === 'all' ? cumulativeTagChartItems : periodTagChartItems;
                const maxCount = Math.max(...items.map((item) => item.count), 1);
                const totalCount = items.reduce((sum, item) => sum + item.count, 0);

                return (
                  <div className="flex h-full items-end justify-between gap-3 pt-1">
                    {items.map((item) => {
                      const percent = Math.round((item.count / totalCount) * 100);
                      const height = Math.max((item.count / maxCount) * 100, 8);

                      return (
                        <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2 pt-4">
                          <div className="mt-2 text-[10px] font-medium text-[#6B7280]">{percent}%</div>
                          <div
                            className="relative overflow-hidden"
                            style={{ width: '20px', height: '140px' }}
                          >
                            <div
                              className="absolute left-0 bottom-0 w-full rounded-t-[6px]"
                              style={{
                                height: `${height}%`,
                                minHeight: '12px',
                                backgroundColor: '#FDBA74',
                              }}
                            />
                          </div>
                          <div className="w-full truncate text-center text-[10px] font-medium text-[#4B5563]">
                            {item.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="mt-3 space-y-1 text-[11px] text-[#6B7280]">
              <div>표시 기준: 상위 9개 태그 + 기타</div>
              <div>
                총 집계: {(dateRange === 'all' ? cumulativeTagChartItems : periodTagChartItems)
                  .reduce((sum, item) => sum + item.count, 0)
                  .toLocaleString()}건
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>
  );
}
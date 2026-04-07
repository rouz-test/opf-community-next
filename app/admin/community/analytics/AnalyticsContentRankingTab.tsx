'use client';

type RankingItem = {
  rank: number;
  label: string;
  value: string;
  badge?: string;
};

type RankingCardItem = {
  title: string;
  items: RankingItem[];
};

type RankingSection = {
  title: string;
  description: string;
  cards: RankingCardItem[];
};

const rankingSections: RankingSection[] = [
  {
    title: '최다 조회 게시글',
    description: '조회 수 기준 상위 게시글입니다.',
    cards: [
      {
        title: '전체',
        items: [
          { rank: 1, label: '반짝이던 밤하늘처럼 반짝인 브랜드 스토리', value: '349회', badge: '실명' },
          { rank: 2, label: '창업자인의 디자인', value: '287회', badge: '닉네임' },
          { rank: 3, label: '효율적인 포트폴리오', value: '215회', badge: '실명' },
          { rank: 4, label: '협업과 소통', value: '198회', badge: '실명' },
          { rank: 5, label: '팀의 사고', value: '192회', badge: '닉네임' },
          { rank: 6, label: '문제 해결 능력', value: '188회', badge: '실명' },
          { rank: 7, label: '창의적 사고', value: '182회', badge: '닉네임' },
          { rank: 8, label: '팀워크', value: '176회', badge: '실명' },
          { rank: 9, label: '팀워크2', value: '170회', badge: '실명' },
          { rank: 10, label: '팀워크3', value: '168회', badge: '닉네임' },
        ],
      },
      {
        title: '실명',
        items: [
          { rank: 1, label: '반짝이던 밤하늘처럼 반짝인 브랜드 스토리', value: '349회' },
          { rank: 2, label: '효율적인 포트폴리오', value: '215회' },
          { rank: 3, label: '협업과 소통', value: '198회' },
          { rank: 4, label: '문제 해결 능력', value: '188회' },
          { rank: 5, label: '팀워크', value: '176회' },
          { rank: 6, label: '새로운 실험', value: '171회' },
          { rank: 7, label: '기획자의 태도', value: '166회' },
          { rank: 8, label: '브랜드의 결', value: '159회' },
          { rank: 9, label: '작은 성과의 반복', value: '152회' },
          { rank: 10, label: '지속 가능한 팀', value: '149회' },
        ],
      },
      {
        title: '닉네임',
        items: [
          { rank: 1, label: '창업자인의 디자인', value: '287회' },
          { rank: 2, label: '팀의 사고', value: '192회' },
          { rank: 3, label: '창의적 사고', value: '182회' },
          { rank: 4, label: '팀워크3', value: '168회' },
          { rank: 5, label: '빠른 실행', value: '160회' },
          { rank: 6, label: '회고하는 습관', value: '151회' },
          { rank: 7, label: '기록의 힘', value: '147회' },
          { rank: 8, label: '작은 실험들', value: '141회' },
          { rank: 9, label: '변화의 신호', value: '136회' },
          { rank: 10, label: '다음 시도', value: '129회' },
        ],
      },
    ],
  },
  {
    title: '최다 댓글 · 대댓글 등록 게시글',
    description: '댓글 및 대댓글 수 기준 상위 게시글입니다.',
    cards: [
      {
        title: '전체',
        items: [
          { rank: 1, label: '성장을 위한 제품 실험의 기록', value: '184개', badge: '실명' },
          { rank: 2, label: '팀의 사고', value: '171개', badge: '닉네임' },
          { rank: 3, label: '문제를 해결하는 작은 루틴', value: '159개', badge: '실명' },
          { rank: 4, label: '협업과 소통', value: '144개', badge: '실명' },
          { rank: 5, label: '창업자인의 디자인', value: '138개', badge: '닉네임' },
          { rank: 6, label: '문제 해결 능력', value: '130개', badge: '실명' },
          { rank: 7, label: '창의적 사고', value: '124개', badge: '닉네임' },
          { rank: 8, label: '팀워크', value: '119개', badge: '실명' },
          { rank: 9, label: '실패를 다루는 방식', value: '115개', badge: '실명' },
          { rank: 10, label: '작은 실험들', value: '108개', badge: '닉네임' },
        ],
      },
      {
        title: '실명',
        items: [
          { rank: 1, label: '성장을 위한 제품 실험의 기록', value: '184개' },
          { rank: 2, label: '문제를 해결하는 작은 루틴', value: '159개' },
          { rank: 3, label: '협업과 소통', value: '144개' },
          { rank: 4, label: '문제 해결 능력', value: '130개' },
          { rank: 5, label: '팀워크', value: '119개' },
          { rank: 6, label: '실패를 다루는 방식', value: '115개' },
          { rank: 7, label: '기획자의 태도', value: '109개' },
          { rank: 8, label: '브랜드의 결', value: '101개' },
          { rank: 9, label: '작은 성과의 반복', value: '96개' },
          { rank: 10, label: '지속 가능한 팀', value: '91개' },
        ],
      },
      {
        title: '닉네임',
        items: [
          { rank: 1, label: '팀의 사고', value: '171개' },
          { rank: 2, label: '창업자인의 디자인', value: '138개' },
          { rank: 3, label: '창의적 사고', value: '124개' },
          { rank: 4, label: '작은 실험들', value: '108개' },
          { rank: 5, label: '빠른 실행', value: '99개' },
          { rank: 6, label: '회고하는 습관', value: '95개' },
          { rank: 7, label: '기록의 힘', value: '90개' },
          { rank: 8, label: '변화의 신호', value: '84개' },
          { rank: 9, label: '다음 시도', value: '79개' },
          { rank: 10, label: '작은 아이디어의 확장', value: '75개' },
        ],
      },
    ],
  },
  {
    title: '최다 좋아요 게시글',
    description: '좋아요 수 기준 상위 게시글입니다.',
    cards: [
      {
        title: '전체',
        items: [
          { rank: 1, label: '반짝이던 밤하늘처럼 반짝인 브랜드 스토리', value: '349개', badge: '실명' },
          { rank: 2, label: '창업자인의 디자인', value: '287개', badge: '닉네임' },
          { rank: 3, label: '효율적인 포트폴리오', value: '215개', badge: '실명' },
          { rank: 4, label: '협업과 소통', value: '198개', badge: '실명' },
          { rank: 5, label: '팀의 사고', value: '192개', badge: '닉네임' },
          { rank: 6, label: '문제 해결 능력', value: '188개', badge: '실명' },
          { rank: 7, label: '창의적 사고', value: '182개', badge: '닉네임' },
          { rank: 8, label: '팀워크', value: '176개', badge: '실명' },
          { rank: 9, label: '팀워크2', value: '170개', badge: '실명' },
          { rank: 10, label: '팀워크3', value: '168개', badge: '닉네임' },
        ],
      },
      {
        title: '실명',
        items: [
          { rank: 1, label: '반짝이던 밤하늘처럼 반짝인 브랜드 스토리', value: '349개' },
          { rank: 2, label: '효율적인 포트폴리오', value: '215개' },
          { rank: 3, label: '협업과 소통', value: '198개' },
          { rank: 4, label: '문제 해결 능력', value: '188개' },
          { rank: 5, label: '팀워크', value: '176개' },
          { rank: 6, label: '새로운 실험', value: '171개' },
          { rank: 7, label: '기획자의 태도', value: '166개' },
          { rank: 8, label: '브랜드의 결', value: '159개' },
          { rank: 9, label: '작은 성과의 반복', value: '152개' },
          { rank: 10, label: '지속 가능한 팀', value: '149개' },
        ],
      },
      {
        title: '닉네임',
        items: [
          { rank: 1, label: '창업자인의 디자인', value: '287개' },
          { rank: 2, label: '팀의 사고', value: '192개' },
          { rank: 3, label: '창의적 사고', value: '182개' },
          { rank: 4, label: '팀워크3', value: '168개' },
          { rank: 5, label: '빠른 실행', value: '160개' },
          { rank: 6, label: '회고하는 습관', value: '151개' },
          { rank: 7, label: '기록의 힘', value: '147개' },
          { rank: 8, label: '작은 실험들', value: '141개' },
          { rank: 9, label: '변화의 신호', value: '136개' },
          { rank: 10, label: '다음 시도', value: '129개' },
        ],
      },
    ],
  },
  {
    title: '최다 저장 게시글',
    description: '저장 수 기준 상위 게시글입니다.',
    cards: [
      {
        title: '전체',
        items: [
          { rank: 1, label: '자료를 구조화하는 가장 쉬운 방법', value: '142개', badge: '실명' },
          { rank: 2, label: '창업자인의 디자인', value: '131개', badge: '닉네임' },
          { rank: 3, label: '효율적인 포트폴리오', value: '124개', badge: '실명' },
          { rank: 4, label: '기획자의 태도', value: '118개', badge: '실명' },
          { rank: 5, label: '회고하는 습관', value: '113개', badge: '닉네임' },
          { rank: 6, label: '브랜드의 결', value: '109개', badge: '실명' },
          { rank: 7, label: '기록의 힘', value: '104개', badge: '닉네임' },
          { rank: 8, label: '작은 성과의 반복', value: '98개', badge: '실명' },
          { rank: 9, label: '다음 시도', value: '94개', badge: '닉네임' },
          { rank: 10, label: '지속 가능한 팀', value: '91개', badge: '실명' },
        ],
      },
      {
        title: '실명',
        items: [
          { rank: 1, label: '자료를 구조화하는 가장 쉬운 방법', value: '142개' },
          { rank: 2, label: '효율적인 포트폴리오', value: '124개' },
          { rank: 3, label: '기획자의 태도', value: '118개' },
          { rank: 4, label: '브랜드의 결', value: '109개' },
          { rank: 5, label: '작은 성과의 반복', value: '98개' },
          { rank: 6, label: '지속 가능한 팀', value: '91개' },
          { rank: 7, label: '실패를 다루는 방식', value: '88개' },
          { rank: 8, label: '협업과 소통', value: '84개' },
          { rank: 9, label: '문제 해결 능력', value: '80개' },
          { rank: 10, label: '팀워크', value: '76개' },
        ],
      },
      {
        title: '닉네임',
        items: [
          { rank: 1, label: '창업자인의 디자인', value: '131개' },
          { rank: 2, label: '회고하는 습관', value: '113개' },
          { rank: 3, label: '기록의 힘', value: '104개' },
          { rank: 4, label: '다음 시도', value: '94개' },
          { rank: 5, label: '작은 실험들', value: '89개' },
          { rank: 6, label: '팀의 사고', value: '85개' },
          { rank: 7, label: '창의적 사고', value: '81개' },
          { rank: 8, label: '변화의 신호', value: '78개' },
          { rank: 9, label: '빠른 실행', value: '73개' },
          { rank: 10, label: '작은 아이디어의 확장', value: '69개' },
        ],
      },
    ],
  },
];

function RankingCard({ card }: { card: RankingCardItem }) {
  return (
    <article className="rounded-lg border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] px-4 py-3">
        <div className="text-[12px] font-semibold text-[#374151]">{card.title}</div>
      </div>
      <div className="divide-y divide-[#F3F4F6] px-4 py-1">
        {card.items.map((item, index) => {
          const isTop = index === 0;

          return (
            <div
              key={`${card.title}-${item.rank}-${item.label}`}
              className={[
                'flex items-center gap-3 py-2 text-[12px]',
                isTop ? 'bg-[#FFFBEB]' : '',
              ].join(' ')}
            >
              <div
                className={[
                  'w-[40px] shrink-0',
                  isTop ? 'font-semibold text-[#B45309]' : 'font-medium text-[#111827]',
                ].join(' ')}
              >
                {item.rank}위
              </div>
              <div
                className={[
                  'min-w-0 flex-1 truncate',
                  isTop ? 'font-semibold text-[#111827]' : 'text-[#4B5563]',
                ].join(' ')}
              >
                {item.label}
              </div>
              {item.badge ? (
                <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#FFF7ED] px-2 text-[10px] font-medium leading-none text-[#F97316] whitespace-nowrap">
                  {item.badge}
                </span>
              ) : null}
              <div
                className={[
                  'w-[64px] shrink-0 text-right tabular-nums text-[#111827]',
                  isTop ? 'font-semibold' : 'font-medium',
                ].join(' ')}
              >
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function RankingSectionBlock({ section }: { section: RankingSection }) {
  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="border-b border-[#F3F4F6] pb-3">
        <h2 className="text-[13px] font-semibold text-[#111827]">{section.title}</h2>
        <p className="mt-1 text-[12px] text-[#6B7280]">{section.description}</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {section.cards.map((card) => (
          <RankingCard key={`${section.title}-${card.title}`} card={card} />
        ))}
      </div>
    </section>
  );
}

export default function AnalyticsContentRankingTab() {
  return (
    <div className="space-y-4">
      {rankingSections.map((section) => (
        <RankingSectionBlock key={section.title} section={section} />
      ))}
    </div>
  );
}
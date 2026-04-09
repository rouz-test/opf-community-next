'use client';

import { Box, Flex, Grid, Text } from '@chakra-ui/react';
import AdminCard from '@/app/admin/components/ui/card';
import AdminBadge from '@/app/admin/components/ui/badge';

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
    <AdminCard as="article" borderRadius="8px" p="0">
      <Box borderBottom="1px solid" borderColor="#E5E7EB" px="16px" py="12px">
        <Text fontSize="12px" fontWeight="600" color="#374151">
          {card.title}
        </Text>
      </Box>
      <Box px="16px" py="4px">
        {card.items.map((item, index) => {
          const isTop = index === 0;

          return (
            <Flex
              key={`${card.title}-${item.rank}-${item.label}`}
              align="center"
              gap="12px"
              py="8px"
              fontSize="12px"
              bg="transparent"
              borderTop={index === 0 ? 'none' : '1px solid'}
              borderColor="#F3F4F6"
            >
              <Text
                w="40px"
                flexShrink={0}
                fontWeight={isTop ? '600' : '500'}
                color={isTop ? '#B45309' : '#111827'}
              >
                {item.rank}위
              </Text>

              <Text
                minW="0"
                flex="1"
                truncate
                fontWeight={isTop ? '600' : '400'}
                color={isTop ? '#111827' : '#4B5563'}
              >
                {item.label}
              </Text>

              {item.badge ? (
                <AdminBadge tone="orange" h="20px" px="8px" fontSize="10px" fontWeight="500">
                  {item.badge}
                </AdminBadge>
              ) : null}

              <Text
                w="64px"
                flexShrink={0}
                textAlign="right"
                color="#111827"
                fontWeight={isTop ? '600' : '500'}
                fontVariantNumeric="tabular-nums"
              >
                {item.value}
              </Text>
            </Flex>
          );
        })}
      </Box>
    </AdminCard>
  );
}

function RankingSectionBlock({ section }: { section: RankingSection }) {
  return (
    <AdminCard as="section" borderRadius="8px" p="16px">
      <Box borderBottom="1px solid" borderColor="#F3F4F6" pb="12px">
        <Text fontSize="13px" fontWeight="600" color="#111827">
          {section.title}
        </Text>
        <Text mt="4px" fontSize="12px" color="#6B7280">
          {section.description}
        </Text>
      </Box>

      <Grid mt="16px" templateColumns="repeat(3, minmax(0, 1fr))" gap="12px">
        {section.cards.map((card) => (
          <RankingCard key={`${section.title}-${card.title}`} card={card} />
        ))}
      </Grid>
    </AdminCard>
  );
}

export default function AnalyticsContentRankingTab() {
  return (
    <Flex direction="column" gap="16px">
      {rankingSections.map((section) => (
        <RankingSectionBlock key={section.title} section={section} />
      ))}
    </Flex>
  );
}
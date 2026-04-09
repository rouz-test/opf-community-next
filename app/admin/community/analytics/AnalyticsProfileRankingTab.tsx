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
    title: '최다 글 작성 프로필',
    description: '게시글 작성 수 기준 상위 프로필입니다.',
    cards: [
      {
        title: '전체',
        items: [
          { rank: 1, label: '김준경', value: '349개', badge: '실명' },
          { rank: 2, label: 'Amanda Lee', value: '287개', badge: '닉네임' },
          { rank: 3, label: '이민수', value: '230개', badge: '실명' },
          { rank: 4, label: '박지훈', value: '150개', badge: '실명' },
          { rank: 5, label: 'Carl Lewis', value: '130개', badge: '닉네임' },
          { rank: 6, label: '최현우', value: '120개', badge: '실명' },
          { rank: 7, label: '정우성', value: '110개', badge: '실명' },
          { rank: 8, label: 'Emily Davis', value: '105개', badge: '닉네임' },
          { rank: 9, label: '한지민', value: '98개', badge: '실명' },
          { rank: 10, label: '김수진', value: '96개', badge: '실명' },
        ],
      },
      {
        title: '실명',
        items: [
          { rank: 1, label: '김준경', value: '349개' },
          { rank: 2, label: '이민수', value: '230개' },
          { rank: 3, label: '박지훈', value: '150개' },
          { rank: 4, label: '최현우', value: '120개' },
          { rank: 5, label: '정우성', value: '110개' },
          { rank: 6, label: '한지민', value: '98개' },
          { rank: 7, label: '김수진', value: '96개' },
          { rank: 8, label: '김준경2', value: '90개' },
          { rank: 9, label: '이민수2', value: '86개' },
          { rank: 10, label: '박지훈2', value: '80개' },
        ],
      },
      {
        title: '닉네임',
        items: [
          { rank: 1, label: 'Amanda Lee', value: '287개' },
          { rank: 2, label: 'Carl Lewis', value: '130개' },
          { rank: 3, label: 'Emily Davis', value: '105개' },
          { rank: 4, label: 'Nickname Alpha', value: '93개' },
          { rank: 5, label: 'Nickname Beta', value: '89개' },
          { rank: 6, label: 'Nickname Gamma', value: '84개' },
          { rank: 7, label: 'Nickname Delta', value: '80개' },
          { rank: 8, label: 'Nickname Epsilon', value: '76개' },
          { rank: 9, label: 'Nickname Zeta', value: '73개' },
          { rank: 10, label: 'Nickname Eta', value: '70개' },
        ],
      },
    ],
  },
  {
    title: '최다 댓글 · 대댓글 작성 프로필',
    description: '댓글 및 대댓글 작성 수 기준 상위 프로필입니다.',
    cards: [
      {
        title: '전체',
        items: [
          { rank: 1, label: '김준경', value: '349개', badge: '실명' },
          { rank: 2, label: 'Amanda Lee', value: '287개', badge: '닉네임' },
          { rank: 3, label: '이민수', value: '230개', badge: '실명' },
          { rank: 4, label: '박지훈', value: '150개', badge: '실명' },
          { rank: 5, label: 'Carl Lewis', value: '130개', badge: '닉네임' },
          { rank: 6, label: '최현우', value: '120개', badge: '실명' },
          { rank: 7, label: '정우성', value: '110개', badge: '실명' },
          { rank: 8, label: 'Emily Davis', value: '105개', badge: '닉네임' },
          { rank: 9, label: '한지민', value: '98개', badge: '실명' },
          { rank: 10, label: '김수진', value: '96개', badge: '실명' },
        ],
      },
      {
        title: '실명',
        items: [
          { rank: 1, label: '김준경', value: '349개' },
          { rank: 2, label: '이민수', value: '230개' },
          { rank: 3, label: '박지훈', value: '150개' },
          { rank: 4, label: '최현우', value: '120개' },
          { rank: 5, label: '정우성', value: '110개' },
          { rank: 6, label: '한지민', value: '98개' },
          { rank: 7, label: '김수진', value: '96개' },
          { rank: 8, label: '김준경2', value: '90개' },
          { rank: 9, label: '이민수2', value: '86개' },
          { rank: 10, label: '박지훈2', value: '80개' },
        ],
      },
      {
        title: '닉네임',
        items: [
          { rank: 1, label: 'Amanda Lee', value: '287개' },
          { rank: 2, label: 'Carl Lewis', value: '130개' },
          { rank: 3, label: 'Emily Davis', value: '105개' },
          { rank: 4, label: 'Nickname Alpha', value: '93개' },
          { rank: 5, label: 'Nickname Beta', value: '89개' },
          { rank: 6, label: 'Nickname Gamma', value: '84개' },
          { rank: 7, label: 'Nickname Delta', value: '80개' },
          { rank: 8, label: 'Nickname Epsilon', value: '76개' },
          { rank: 9, label: 'Nickname Zeta', value: '73개' },
          { rank: 10, label: 'Nickname Eta', value: '70개' },
        ],
      },
    ],
  },
  {
    title: '최다 팔로워 보유 프로필',
    description: '팔로워 수 기준 상위 프로필입니다.',
    cards: [
      {
        title: '전체',
        items: [
          { rank: 1, label: '김준경', value: '1,280명', badge: '실명' },
          { rank: 2, label: 'Amanda Lee', value: '1,120명', badge: '닉네임' },
          { rank: 3, label: '이민수', value: '980명', badge: '실명' },
          { rank: 4, label: '박지훈', value: '910명', badge: '실명' },
          { rank: 5, label: 'Carl Lewis', value: '870명', badge: '닉네임' },
          { rank: 6, label: '최현우', value: '810명', badge: '실명' },
          { rank: 7, label: '정우성', value: '770명', badge: '실명' },
          { rank: 8, label: 'Emily Davis', value: '735명', badge: '닉네임' },
          { rank: 9, label: '한지민', value: '701명', badge: '실명' },
          { rank: 10, label: '김수진', value: '680명', badge: '실명' },
        ],
      },
      {
        title: '실명',
        items: [
          { rank: 1, label: '김준경', value: '1,280명' },
          { rank: 2, label: '이민수', value: '980명' },
          { rank: 3, label: '박지훈', value: '910명' },
          { rank: 4, label: '최현우', value: '810명' },
          { rank: 5, label: '정우성', value: '770명' },
          { rank: 6, label: '한지민', value: '701명' },
          { rank: 7, label: '김수진', value: '680명' },
          { rank: 8, label: '김준경2', value: '652명' },
          { rank: 9, label: '이민수2', value: '631명' },
          { rank: 10, label: '박지훈2', value: '602명' },
        ],
      },
      {
        title: '닉네임',
        items: [
          { rank: 1, label: 'Amanda Lee', value: '1,120명' },
          { rank: 2, label: 'Carl Lewis', value: '870명' },
          { rank: 3, label: 'Emily Davis', value: '735명' },
          { rank: 4, label: 'Nickname Alpha', value: '688명' },
          { rank: 5, label: 'Nickname Beta', value: '659명' },
          { rank: 6, label: 'Nickname Gamma', value: '633명' },
          { rank: 7, label: 'Nickname Delta', value: '609명' },
          { rank: 8, label: 'Nickname Epsilon', value: '587명' },
          { rank: 9, label: 'Nickname Zeta', value: '562명' },
          { rank: 10, label: 'Nickname Eta', value: '544명' },
        ],
      },
    ],
  },
  {
    title: '최다 팔로잉 프로필',
    description: '팔로잉 수 기준 상위 프로필입니다.',
    cards: [
      {
        title: '전체',
        items: [
          { rank: 1, label: 'Amanda Lee', value: '642명', badge: '닉네임' },
          { rank: 2, label: '김준경', value: '618명', badge: '실명' },
          { rank: 3, label: 'Emily Davis', value: '571명', badge: '닉네임' },
          { rank: 4, label: '이민수', value: '552명', badge: '실명' },
          { rank: 5, label: 'Carl Lewis', value: '533명', badge: '닉네임' },
          { rank: 6, label: '박지훈', value: '501명', badge: '실명' },
          { rank: 7, label: 'Nickname Alpha', value: '488명', badge: '닉네임' },
          { rank: 8, label: '한지민', value: '472명', badge: '실명' },
          { rank: 9, label: 'Nickname Beta', value: '459명', badge: '닉네임' },
          { rank: 10, label: '김수진', value: '441명', badge: '실명' },
        ],
      },
      {
        title: '실명',
        items: [
          { rank: 1, label: '김준경', value: '618명' },
          { rank: 2, label: '이민수', value: '552명' },
          { rank: 3, label: '박지훈', value: '501명' },
          { rank: 4, label: '한지민', value: '472명' },
          { rank: 5, label: '김수진', value: '441명' },
          { rank: 6, label: '최현우', value: '433명' },
          { rank: 7, label: '정우성', value: '421명' },
          { rank: 8, label: '김준경2', value: '404명' },
          { rank: 9, label: '이민수2', value: '391명' },
          { rank: 10, label: '박지훈2', value: '378명' },
        ],
      },
      {
        title: '닉네임',
        items: [
          { rank: 1, label: 'Amanda Lee', value: '642명' },
          { rank: 2, label: 'Emily Davis', value: '571명' },
          { rank: 3, label: 'Carl Lewis', value: '533명' },
          { rank: 4, label: 'Nickname Alpha', value: '488명' },
          { rank: 5, label: 'Nickname Beta', value: '459명' },
          { rank: 6, label: 'Nickname Gamma', value: '438명' },
          { rank: 7, label: 'Nickname Delta', value: '420명' },
          { rank: 8, label: 'Nickname Epsilon', value: '403명' },
          { rank: 9, label: 'Nickname Zeta', value: '388명' },
          { rank: 10, label: 'Nickname Eta', value: '372명' },
        ],
      },
    ],
  },
  {
    title: '최다 멘션 피지명 프로필',
    description: '다른 사용자에게 가장 많이 멘션된 프로필입니다.',
    cards: [
      {
        title: '전체',
        items: [
          { rank: 1, label: '김준경', value: '214회', badge: '실명' },
          { rank: 2, label: 'Amanda Lee', value: '198회', badge: '닉네임' },
          { rank: 3, label: '이민수', value: '176회', badge: '실명' },
          { rank: 4, label: 'Emily Davis', value: '162회', badge: '닉네임' },
          { rank: 5, label: '박지훈', value: '151회', badge: '실명' },
          { rank: 6, label: 'Carl Lewis', value: '147회', badge: '닉네임' },
          { rank: 7, label: '한지민', value: '139회', badge: '실명' },
          { rank: 8, label: 'Nickname Alpha', value: '132회', badge: '닉네임' },
          { rank: 9, label: '김수진', value: '127회', badge: '실명' },
          { rank: 10, label: 'Nickname Beta', value: '121회', badge: '닉네임' },
        ],
      },
      {
        title: '실명',
        items: [
          { rank: 1, label: '김준경', value: '214회' },
          { rank: 2, label: '이민수', value: '176회' },
          { rank: 3, label: '박지훈', value: '151회' },
          { rank: 4, label: '한지민', value: '139회' },
          { rank: 5, label: '김수진', value: '127회' },
          { rank: 6, label: '최현우', value: '119회' },
          { rank: 7, label: '정우성', value: '113회' },
          { rank: 8, label: '김준경2', value: '108회' },
          { rank: 9, label: '이민수2', value: '102회' },
          { rank: 10, label: '박지훈2', value: '98회' },
        ],
      },
      {
        title: '닉네임',
        items: [
          { rank: 1, label: 'Amanda Lee', value: '198회' },
          { rank: 2, label: 'Emily Davis', value: '162회' },
          { rank: 3, label: 'Carl Lewis', value: '147회' },
          { rank: 4, label: 'Nickname Alpha', value: '132회' },
          { rank: 5, label: 'Nickname Beta', value: '121회' },
          { rank: 6, label: 'Nickname Gamma', value: '116회' },
          { rank: 7, label: 'Nickname Delta', value: '109회' },
          { rank: 8, label: 'Nickname Epsilon', value: '103회' },
          { rank: 9, label: 'Nickname Zeta', value: '97회' },
          { rank: 10, label: 'Nickname Eta', value: '91회' },
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
          const profileInitial = item.label.trim().charAt(0).toUpperCase();

          return (
            <Flex
              key={`${card.title}-${item.rank}-${item.label}`}
              align="center"
              gap="8px"
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

              <Flex
                h="32px"
                w="32px"
                flexShrink={0}
                align="center"
                justify="center"
                borderRadius="full"
                border="1px solid"
                borderColor="#E5E7EB"
                bg="#F9FAFB"
                fontSize="11px"
                fontWeight="600"
                color="#6B7280"
              >
                {profileInitial}
              </Flex>

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

export default function AnalyticsProfileRankingTab() {
  return (
    <Flex direction="column" gap="16px">
      {rankingSections.map((section) => (
        <RankingSectionBlock key={section.title} section={section} />
      ))}
    </Flex>
  );
}
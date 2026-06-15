'use client';

import { Box, Flex, Grid, Text } from '@chakra-ui/react';
import AdminCard from '@/app/admin/components/ui/card';
import {
  buildProfileRankingSections,
  type AnalyticsDateRangeKey,
  type AnalyticsRankingItem,
  type AnalyticsRankingSection,
} from './analytics-data';

function RankingList({
  items,
}: {
  items: AnalyticsRankingItem[];
}) {
  if (items.length === 0) {
    return (
      <Flex minH="168px" align="center" justify="center">
        <Text fontSize="12px" color="#9CA3AF">
          집계된 프로필이 없습니다.
        </Text>
      </Flex>
    );
  }

  return (
    <Box>
      {items.map((item, index) => {
        const isTop = index === 0;
        const profileInitial = item.label.trim().charAt(0).toUpperCase();

        return (
          <Flex
            key={`${item.rank}-${item.label}`}
            align="center"
            gap="10px"
            py="10px"
            fontSize="12px"
            borderTop={index === 0 ? 'none' : '1px solid'}
            borderColor="#F3F4F6"
          >
            <Text
              w="42px"
              flexShrink={0}
              fontWeight={isTop ? '700' : '500'}
              color={isTop ? '#B45309' : '#111827'}
            >
              {item.rank}위
            </Text>

            <Flex
              h="34px"
              w="34px"
              flexShrink={0}
              align="center"
              justify="center"
              borderRadius="full"
              border="1px solid"
              borderColor={isTop ? '#FED7AA' : '#E5E7EB'}
              bg={isTop ? '#FFF7ED' : '#F9FAFB'}
              fontSize="12px"
              fontWeight="700"
              color={isTop ? '#F97316' : '#6B7280'}
            >
              {profileInitial}
            </Flex>

            <Text
              minW="0"
              flex="1"
              truncate
              fontWeight={isTop ? '700' : '500'}
              color={isTop ? '#111827' : '#4B5563'}
            >
              {item.label}
            </Text>

            <Text
              w="72px"
              flexShrink={0}
              textAlign="right"
              color="#111827"
              fontWeight={isTop ? '700' : '600'}
              fontVariantNumeric="tabular-nums"
            >
              {item.value}
            </Text>
          </Flex>
        );
      })}
    </Box>
  );
}

function RankingSectionCard({ section }: { section: AnalyticsRankingSection }) {
  const items = section.cards[0]?.items ?? [];

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

      <Box mt="8px">
        <RankingList items={items} />
      </Box>
    </AdminCard>
  );
}

export default function AnalyticsProfileRankingTab({
  dateRange,
}: {
  dateRange: AnalyticsDateRangeKey;
}) {
  const rankingSections = buildProfileRankingSections(dateRange);

  return (
    <Grid templateColumns={{ base: '1fr', xl: 'repeat(2, minmax(0, 1fr))' }} gap="16px">
      {rankingSections.map((section) => (
        <RankingSectionCard key={section.title} section={section} />
      ))}
    </Grid>
  );
}

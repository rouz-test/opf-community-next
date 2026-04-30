'use client';

import { useMemo } from 'react';
import { Box, Flex, Grid, Text } from '@chakra-ui/react';
import AdminCard from '@/app/admin/components/ui/card';
import AdminBadge from '@/app/admin/components/ui/badge';
import {
  buildContentRankingSections,
  type AnalyticsDateRangeKey,
  type AnalyticsRankingCardItem,
  type AnalyticsRankingSection,
} from './analytics-data';

function RankingCard({ card }: { card: AnalyticsRankingCardItem }) {
  return (
    <AdminCard as="article" borderRadius="8px" p="0">
      <Box borderBottom="1px solid" borderColor="#E5E7EB" px="16px" py="12px">
        <Text fontSize="12px" fontWeight="600" color="#374151">
          {card.title}
        </Text>
      </Box>
      {card.items.length === 0 ? (
        <Flex minH="220px" align="center" justify="center" px="16px" py="20px">
          <Text fontSize="12px" fontWeight="500" color="#9CA3AF">
            표시할 자료가 없습니다.
          </Text>
        </Flex>
      ) : (
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
      )}
    </AdminCard>
  );
}

function RankingSectionBlock({ section }: { section: AnalyticsRankingSection }) {
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

type AnalyticsContentRankingTabProps = {
  dateRange: AnalyticsDateRangeKey;
};

export default function AnalyticsContentRankingTab({
  dateRange,
}: AnalyticsContentRankingTabProps) {
  const rankingSections = useMemo(
    () => buildContentRankingSections(dateRange),
    [dateRange],
  );

  return (
    <Flex direction="column" gap="16px">
      {rankingSections.map((section) => (
        <RankingSectionBlock key={section.title} section={section} />
      ))}
    </Flex>
  );
}

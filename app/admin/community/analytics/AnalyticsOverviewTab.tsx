


'use client';

import { useMemo } from 'react';
import { Box, Flex, Grid, Text } from '@chakra-ui/react';
import AdminCard from '@/app/admin/components/ui/card';
import {
  buildAnalyticsOverviewPanel,
  type AnalyticsDateRangeKey,
  type AnalyticsSummaryCardItem,
} from './analytics-data';

function SummaryCard({ card }: { card: AnalyticsSummaryCardItem }) {
  const showIndicators = card.showIndicators ?? true;
  const real = parseInt(card.realName.replace(/[^0-9]/g, '')) || 0;
  const nick = parseInt(card.nickname.replace(/[^0-9]/g, '')) || 0;
  const parsedTotal = parseInt(card.total.replace(/[^0-9]/g, '')) || 0;
  const total = parsedTotal || real + nick || 1;
  const realRatio = Math.max(0, Math.min(100, (real / total) * 100));
  const nickRatio = Math.max(0, Math.min(100, (nick / total) * 100));

  const leftIndicator = card.leftIndicatorLabel ?? '실명';
  const rightIndicator = card.rightIndicatorLabel ?? '익명';

  const normalizeIndicatorValue = (value: string) =>
    value
      .replace(/^실명\s*/u, '')
      .replace(/^닉네임\s*/u, '')
      .replace(/^익명\s*/u, '')
      .trim();

  const leftValue = normalizeIndicatorValue(card.realName);
  const rightValue = normalizeIndicatorValue(card.nickname);
  const childColumnTemplate =
    (card.children?.length ?? 0) >= 3
      ? 'repeat(3, minmax(0, 1fr))'
      : 'repeat(2, minmax(0, 1fr))';

  if (card.children?.length) {
    return (
      <AdminCard as="article" minW="0" w="full" borderRadius="8px" p="12px 16px">
        <Text fontSize="12px" fontWeight="500" color="#6B7280">
          {card.title}
        </Text>

        <Text mt="8px" fontSize="22px" fontWeight="600" lineHeight="1" color="#111827">
          {card.total}
        </Text>

        {showIndicators ? (
          <>
            <Flex mt="12px" align="center" justify="space-between" gap="16px" fontSize="11px" color="#6B7280">
              <Text truncate>
                {leftIndicator} {leftValue}
              </Text>
              <Text truncate textAlign="right">
                {rightIndicator} {rightValue}
              </Text>
            </Flex>

            <Box mt="8px">
              <Box
                h="10px"
                borderRadius="9999px"
                border="1px solid"
                borderColor="#E5E7EB"
                style={{
                  background: `linear-gradient(to right, #FDBA74 0%, #FDBA74 ${realRatio}%, #D1D5DB ${realRatio}%, #D1D5DB 100%)`,
                }}
              />
              <Flex mt="4px" align="center" justify="space-between" fontSize="10px" color="#9CA3AF">
                <Text>{Math.round(realRatio)}%</Text>
                <Text>{Math.round(nickRatio)}%</Text>
              </Flex>
            </Box>
          </>
        ) : null}

        <Grid
          mt="16px"
          templateColumns={childColumnTemplate}
          gap="12px"
          borderTop="1px solid"
          borderColor="#F3F4F6"
          pt="16px"
        >
          {card.children.map((child) => (
            <SummaryCard key={child.title} card={child} />
          ))}
        </Grid>
      </AdminCard>
    );
  }

  return (
    <AdminCard
      as="article"
      w="full"
      minW="0"
      borderRadius="8px"
      p="12px 16px"
    >
      <Text fontSize="12px" fontWeight="500" color="#6B7280">
        {card.title}
      </Text>

      <Text mt="8px" fontSize="22px" fontWeight="600" lineHeight="1" color="#111827">
        {card.total}
      </Text>

      {showIndicators ? (
        <>
          <Flex mt="12px" align="center" justify="space-between" gap="16px" fontSize="11px" color="#6B7280">
            <Text truncate>
              {leftIndicator} {leftValue}
            </Text>
            <Text truncate textAlign="right">
              {rightIndicator} {rightValue}
            </Text>
          </Flex>

          <Box mt="8px">
            <Box
              h="10px"
              borderRadius="9999px"
              border="1px solid"
              borderColor="#E5E7EB"
              style={{
                background: `linear-gradient(to right, #FDBA74 0%, #FDBA74 ${realRatio}%, #D1D5DB ${realRatio}%, #D1D5DB 100%)`,
              }}
            />
            <Flex mt="4px" align="center" justify="space-between" fontSize="10px" color="#9CA3AF">
              <Text>{Math.round(realRatio)}%</Text>
              <Text>{Math.round(nickRatio)}%</Text>
            </Flex>
          </Box>
        </>
      ) : null}
    </AdminCard>
  );
}

type AnalyticsOverviewTabProps = {
  dateRange: AnalyticsDateRangeKey;
};

export default function AnalyticsOverviewTab({ dateRange }: AnalyticsOverviewTabProps) {
  const selectedSummaryPanel = useMemo(
    () => buildAnalyticsOverviewPanel(dateRange),
    [dateRange],
  );
  const postsCard = selectedSummaryPanel.cards.find((card) => card.title === '게시글');
  const commentsCard = selectedSummaryPanel.cards.find((card) =>
    card.title.startsWith('댓글 · 대댓글'),
  );
  const archivedPostCard = selectedSummaryPanel.cards.find((card) =>
    card.title.startsWith('보관 게시글'),
  );
  const activityPauseCard = selectedSummaryPanel.cards.find((card) =>
    card.title.startsWith('활동 정지'),
  );

  const operationCards = [
    archivedPostCard ?? null,
    activityPauseCard ?? null,
  ].filter(Boolean) as AnalyticsSummaryCardItem[];

  return (
    <Flex as="section" direction="column" gap="16px">
      <AdminCard as="section" borderRadius="8px" p="16px">
        <Flex align="flex-start" justify="space-between" gap="16px" borderBottom="1px solid" borderColor="#F3F4F6" pb="12px">
          <Box>
            <Text fontSize="13px" fontWeight="600" color="#111827">
              {selectedSummaryPanel.title}
            </Text>
            <Text mt="4px" fontSize="12px" color="#6B7280">
              {selectedSummaryPanel.description}
            </Text>
          </Box>
        </Flex>

        <Flex direction="column" gap="16px" mt="16px">
          <Grid templateColumns="3fr 2fr" gap="12px">
            {postsCard ? <SummaryCard key={`${selectedSummaryPanel.title}-${postsCard.title}`} card={postsCard} /> : null}
            {commentsCard ? <SummaryCard key={`${selectedSummaryPanel.title}-${commentsCard.title}`} card={commentsCard} /> : null}
          </Grid>

          <AdminCard as="article" borderRadius="8px" p="16px">
            <Box borderBottom="1px solid" borderColor="#F3F4F6" pb="12px">
              <Text fontSize="13px" fontWeight="600" color="#111827">
                운영 지표
              </Text>
              <Text mt="4px" fontSize="12px" color="#6B7280">
                관리자가 제어하는 상태값 기준 현황입니다.
              </Text>
            </Box>

            <Grid mt="16px" templateColumns="repeat(2, minmax(0, 1fr))" gap="12px">
              {operationCards.map((card) => (
                <SummaryCard key={`${selectedSummaryPanel.title}-${card.title}`} card={card} />
              ))}
            </Grid>
          </AdminCard>

          <AdminCard as="article" borderRadius="8px" p="16px">
            <Box>
              <Text fontSize="12px" fontWeight="600" color="#111827">
                태그 현황
              </Text>
              <Text mt="4px" fontSize="11px" color="#6B7280">
                {dateRange === 'all' ? '전체 기준 상위 태그 분포입니다.' : '선택한 기간 기준 상위 태그 분포입니다.'}
              </Text>
            </Box>

            <Box
              mt="16px"
              h="220px"
              borderRadius="6px"
              border="1px solid"
              borderColor="#E5E7EB"
              bg="#FCFCFD"
              px="16px"
              pb="16px"
              pt="24px"
            >
              {(() => {
                const items = selectedSummaryPanel.tagItems;

                if (items.length === 0) {
                  return (
                    <Flex h="full" align="center" justify="center">
                      <Text fontSize="12px" fontWeight="500" color="#9CA3AF">
                        표시할 자료가 없습니다.
                      </Text>
                    </Flex>
                  );
                }

                const maxCount = Math.max(...items.map((item) => item.count), 1);
                const totalCount = items.reduce((sum, item) => sum + item.count, 0);

                return (
                  <Flex h="full" align="flex-end" justify="space-between" gap="12px" pt="4px">
                    {items.map((item) => {
                      const percent = Math.round((item.count / totalCount) * 100);
                      const height = Math.max((item.count / maxCount) * 100, 8);

                      return (
                        <Flex key={item.label} minW="0" flex="1" direction="column" align="center" gap="8px" pt="16px">
                          <Text mt="8px" fontSize="10px" fontWeight="500" color="#6B7280">
                            {percent}%
                          </Text>
                          <Box position="relative" overflow="hidden" style={{ width: '20px', height: '140px' }}>
                            <Box
                              position="absolute"
                              left="0"
                              bottom="0"
                              width="100%"
                              borderTopRadius="6px"
                              style={{
                                height: `${height}%`,
                                minHeight: '12px',
                                backgroundColor: '#FDBA74',
                              }}
                            />
                          </Box>
                          <Text w="100%" truncate textAlign="center" fontSize="10px" fontWeight="500" color="#4B5563">
                            {item.label}
                          </Text>
                        </Flex>
                      );
                    })}
                  </Flex>
                );
              })()}
            </Box>

            <Box mt="12px">
              <Flex direction="column" gap="4px" fontSize="11px" color="#6B7280">
                <Text>표시 기준: 상위 9개 태그 + 기타</Text>
                <Text>
                  총 집계: {selectedSummaryPanel.tagItems
                    .reduce((sum, item) => sum + item.count, 0)
                    .toLocaleString()}건
                </Text>
              </Flex>
            </Box>
          </AdminCard>
        </Flex>
      </AdminCard>
    </Flex>
  );
}

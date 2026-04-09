'use client';

import { useState } from 'react';
import { Box, Button, Flex, Menu, Portal } from '@chakra-ui/react';
import AdminButton from '@/app/admin/components/ui/button';
import AnalyticsContentRankingTab from './AnalyticsContentRankingTab';
import AnalyticsProfileRankingTab from './AnalyticsProfileRankingTab';
import AnalyticsOverviewTab from './AnalyticsOverviewTab';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import AdminSelectTrigger from '@/app/admin/components/ui/select-trigger';

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
    <PageContainer>
      <PageHeader
        left={
          <Flex align="center" gap="16px">
            {analyticsTabs.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <Button
                  key={tab.key}
                  type="button"
                  unstyled
                  onClick={() => setActiveTab(tab.key)}
                  position="relative"
                  pb="8px"
                  fontSize="12px"
                  fontWeight="500"
                  color={isActive ? '#F97316' : '#6B7280'}
                  transition="color 0.2s ease"
                  _hover={{ color: isActive ? '#F97316' : '#111827' }}
                >
                  {tab.label}
                  {isActive ? (
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      h="2px"
                      borderRadius="9999px"
                      bg="#F97316"
                    />
                  ) : null}
                </Button>
              );
            })}
          </Flex>
        }
        right={
          <Flex align="center" gap="8px" pb="4px">
            <Menu.Root positioning={{ placement: 'bottom-end' }}>
              <Menu.Trigger asChild>
                <Box>
                  <AdminSelectTrigger
                    label={dateRangeOptions.find((o) => o.key === dateRange)?.label ?? '선택'}
                    minW="96px"
                  />
                </Box>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content minW="120px" borderRadius="12px" borderColor="#E5E7EB" boxShadow="lg" p="4px">
                    {dateRangeOptions.map((option) => {
                      const isSelected = option.key === dateRange;
                      return (
                        <Menu.Item
                          key={option.key}
                          value={option.key}
                          onClick={() => setDateRange(option.key)}
                          borderRadius="8px"
                          fontSize="13px"
                          fontWeight="500"
                          color={isSelected ? '#F59E42' : '#374151'}
                          bg={isSelected ? '#FFF8F1' : 'transparent'}
                          _highlighted={{ bg: '#FFF8F1', color: '#111827' }}
                        >
                          {option.label}
                        </Menu.Item>
                      );
                    })}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
            <AdminButton variantStyle="outline" size="sm">
              다운로드
            </AdminButton>
          </Flex>
        }
      />

      {activeTab === 'default' ? (
        <AnalyticsOverviewTab dateRange={dateRange} />
      ) : activeTab === 'profile' ? (
        <AnalyticsProfileRankingTab />
      ) : (
        <AnalyticsContentRankingTab />
      )}
    </PageContainer>
  );
}

'use client';

import { Box, Button, Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import UserSwitch from '@/app/user/components/ui/switch';

function NotificationRow({
  title,
  description,
  checked,
  onCheckedChange,
  showDivider = false,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  showDivider?: boolean;
}) {
  return (
    <Flex
      align="flex-start"
      justify="space-between"
      gap="16px"
      pt={showDivider ? '20px' : '0'}
      borderTop={showDivider ? '1px solid' : 'none'}
      borderColor="#F3F4F6"
    >
      <Box>
        <Text fontSize="14px" fontWeight="700" color="#111827">
          {title}
        </Text>
        {description ? (
          <Text mt="8px" fontSize="12px" color="#9CA3AF" lineHeight="1.6">
            {description}
          </Text>
        ) : null}
      </Box>

      <UserSwitch checked={checked} onCheckedChange={onCheckedChange} />
    </Flex>
  );
}

function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="#E5E7EB"
      borderRadius="20px"
      bg="#FFFFFF"
      px={{ base: '20px', sm: '24px' }}
      py={{ base: '20px', sm: '24px' }}
      boxShadow="0 8px 24px rgba(15, 23, 42, 0.04)"
    >
      {children}
    </Box>
  );
}

export default function MyPageSettingsNotificationsPage() {
  const [isServiceEmailEnabled, setIsServiceEmailEnabled] = useState(false);
  const [isNewsletterEnabled, setIsNewsletterEnabled] = useState(false);

  return (
    <Box mx="auto" w="100%" maxW="960px">
      <Box>
        <Text fontSize="20px" fontWeight="700" color="#111827">
          알림
        </Text>
        <Text mt="4px" fontSize="14px" color="#6B7280">
          이메일로 받는 주요 커뮤니티 알림과 뉴스레터 수신 여부를 관리합니다.
        </Text>
      </Box>

      <Flex direction="column" gap="48px" mt="24px">
        <Box>
          <Text mb="16px" fontSize="14px" fontWeight="700" color="#111827">
            알림 설정
          </Text>
          <SettingsCard>
            <Flex direction="column" gap="20px">
              <NotificationRow
                title="서비스 알림 이메일 정보 수신"
                description="*모집 알림, 멘션 알림 등 중요한 알림이 전송됩니다."
                checked={isServiceEmailEnabled}
                onCheckedChange={setIsServiceEmailEnabled}
              />
              <NotificationRow
                title="뉴스레터 정보 수신"
                checked={isNewsletterEnabled}
                onCheckedChange={setIsNewsletterEnabled}
                showDivider
              />
            </Flex>
          </SettingsCard>
        </Box>

        <Box>
          <Text mb="16px" fontSize="14px" fontWeight="700" color="#111827">
            회원 탈퇴
          </Text>
          <SettingsCard>
            <Text fontSize="14px" fontWeight="700" color="#111827">
              회원 탈퇴하기
            </Text>
            <Button
              type="button"
              mt="16px"
              h="40px"
              px="16px"
              borderRadius="10px"
              borderWidth="1px"
              borderColor="#E5E7EB"
              bg="#FFFFFF"
              color="#6B7280"
              fontSize="14px"
              fontWeight="600"
              _hover={{ bg: '#F9FAFB', color: '#374151' }}
            >
              회원탈퇴
            </Button>
          </SettingsCard>
        </Box>
      </Flex>
    </Box>
  );
}

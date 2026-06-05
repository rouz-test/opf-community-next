'use client';

import { Box, Button, Flex, Grid, Image, Input, Text } from '@chakra-ui/react';
import { ShieldCheck } from 'lucide-react';
import { COMMUNITY_CURRENT_USER } from '@/app/user/lib/community-content-data';

function Field({
  label,
  placeholder,
  defaultValue,
  value,
  readOnly = false,
}: {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  readOnly?: boolean;
}) {
  return (
    <Box>
      <Text mb="8px" fontSize="14px" fontWeight="700" color="#111827">
        {label}
      </Text>
      <Input
        h="48px"
        borderRadius="14px"
        borderColor="#E5E7EB"
        bg={readOnly ? '#F9FAFB' : '#FFFFFF'}
        px="16px"
        fontSize="14px"
        color={readOnly ? '#9CA3AF' : '#111827'}
        value={value}
        defaultValue={defaultValue}
        readOnly={readOnly}
        placeholder={placeholder}
        _placeholder={{ color: '#9CA3AF' }}
        _focus={{
          borderColor: '#FDBA74',
          boxShadow: '0 0 0 2px rgba(251, 146, 60, 0.14)',
        }}
      />
    </Box>
  );
}

export default function MyPageSettingsProfilePage() {
  const realProfile = COMMUNITY_CURRENT_USER;

  return (
    <Box mx="auto" w="100%" maxW="960px">
      <Box>
        <Text fontSize="20px" fontWeight="700" color="#111827">
          프로필
        </Text>
        <Text mt="4px" fontSize="14px" color="#6B7280">
          커뮤니티에 노출될 실명 프로필 정보를 관리합니다.
        </Text>
      </Box>

      <Box
        mt="24px"
        borderWidth="1px"
        borderColor="#E5E7EB"
        borderRadius="28px"
        bg="#FFFFFF"
        px={{ base: '20px', sm: '32px' }}
        py={{ base: '24px', sm: '36px' }}
        boxShadow="0 8px 24px rgba(15, 23, 42, 0.04)"
      >
        <Box pb="16px" borderBottom="1px solid" borderColor="#E5E7EB">
          <Text fontSize="14px" fontWeight="700" color="#111827">
            실명 프로필
          </Text>
          <Text mt="4px" fontSize="12px" color="#6B7280">
            커뮤니티의 팔로우와 프로필 정보는 실명 프로필 기준으로 관리됩니다.
          </Text>
        </Box>

        <Flex direction="column" gap="32px" mt="32px">
          <Box as="section">
            <Text fontSize="14px" fontWeight="700" color="#111827">
              프로필 사진
            </Text>
            <Flex direction="column" align="flex-start" gap="16px" mt="20px">
              <Box
                h="64px"
                w="64px"
                overflow="hidden"
                borderRadius="9999px"
                borderWidth="1px"
                borderColor="#E5E7EB"
              >
                <Image
                  src={realProfile.avatar || '/images/profiles/real-large.png'}
                  alt={realProfile.name}
                  h="100%"
                  w="100%"
                  objectFit="cover"
                />
              </Box>
              <Button
                type="button"
                h="36px"
                px="16px"
                borderRadius="10px"
                bg="#F97316"
                color="#FFFFFF"
                fontSize="12px"
                fontWeight="700"
                _hover={{ bg: '#EA580C' }}
              >
                사진 업로드
              </Button>
              <Text fontSize="12px" color="#9CA3AF">
                *10MB 이하 PNG / JPG / SVG 파일만 업로드해 주세요.
              </Text>
            </Flex>
          </Box>

          <Box as="section">
            <Text fontSize="14px" fontWeight="700" color="#111827">
              본인 인증 정보
            </Text>
            <Flex
              direction={{ base: 'column', sm: 'row' }}
              align={{ base: 'stretch', sm: 'center' }}
              justify="space-between"
              gap="16px"
              mt="16px"
              borderWidth="1px"
              borderColor="#E5E7EB"
              borderRadius="16px"
              bg="#F9FAFB"
              px="20px"
              py="16px"
            >
              <Box>
                <Text fontSize="14px" fontWeight="700" color="#111827">
                  본인인증이 필요합니다
                </Text>
                <Text mt="4px" fontSize="12px" color="#9CA3AF">
                  원활한 서비스 이용을 위해 본인인증을 완료해 주세요.
                </Text>
              </Box>
              <Button
                type="button"
                h="40px"
                px="16px"
                borderRadius="12px"
                borderWidth="1px"
                borderColor="#E5E7EB"
                bg="#FFFFFF"
                color="#374151"
                fontSize="12px"
                fontWeight="700"
                _hover={{ bg: '#F3F4F6' }}
              >
                <ShieldCheck size={16} />
                휴대폰 본인인증
              </Button>
            </Flex>
          </Box>

          <Box as="section">
            <Field label="연결된 이메일" value="user@example.com" readOnly />

            <Grid gap="24px" mt="24px" templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }}>
              <Field
                label="이름"
                defaultValue={realProfile.name}
                placeholder="이름을 입력해 주세요."
              />
              <Field label="소속" placeholder="소속명을 입력해 주세요." />
              <Field
                label="직책"
                defaultValue={realProfile.position ?? ''}
                placeholder="직책을 입력해 주세요."
              />
            </Grid>
          </Box>

          <Flex justify="flex-end">
            <Button
              type="button"
              minW="92px"
              h="42px"
              px="20px"
              borderRadius="12px"
              borderWidth="1px"
              borderColor="#FDBA74"
              bg="#FFF7ED"
              color="#F97316"
              fontSize="14px"
              fontWeight="700"
              _hover={{ bg: '#FFEDD5' }}
            >
              저장
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}

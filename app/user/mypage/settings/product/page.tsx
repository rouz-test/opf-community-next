'use client';

import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';

const productKinds = [
  '헬스케어',
  '비오·제약',
  '콘텐츠',
  '제조·건설·부동산',
  '기업 IT',
  '홍보·마케팅',
  '법률',
  '보안',
  '농업',
  '교육',
  '게임·e스포츠',
  '반려생활',
  '리테일',
  '뷰티·패션',
  '여행·레저',
  '식품',
  '금융',
  '문화·예술',
  '모빌리티',
  '소셜 임팩트',
  '환경·에너지',
];

const productCategories = [
  '자유주행 솔루션',
  '소셜·커뮤니티',
  '웹툰·애니메이션',
  '메타버스·가상콘텐츠',
  '게임(모바일)',
  '게임(PC/콘솔)',
  '게임(모바일/PC/콘솔)',
  '쿠키·아동 체육·콘텐츠',
  '2차전지',
  '글로벌·비상관형 솔루션',
  '업무 효율화 솔루션',
  '생계분석 솔루션',
  '미디어 모니터링 솔루션',
  '전문가 서비스',
  '친환경 소비재',
  '스마트·웨어러블 디바이스',
  '스타트업 로컬 솔루션',
  '데이터 분석 서비스',
  '로보틱·하드웨어',
  '디지털 기부·서비스',
  '홈쇼·이상가솔루션',
  '전자·검사 솔루션',
  '건강관리 솔루션',
  '약물·치료제',
  '일상 의료정보 서비스',
  '비용·지출관리 솔루션',
  '공유 서비스',
  '송금·결제 서비스',
  '이동 서비스',
  '콘텐츠 관리 솔루션',
  '콘텐츠 제작 플랫폼',
  '콘텐츠 유통 플랫폼',
  'O2O 플랫폼',
  '인력매칭 플랫폼',
  '학습 솔루션',
  '커머스 플랫폼',
  '항공·스포츠/생활 플랫폼',
  '배송·운송 서비스',
];

function Field({
  label,
  placeholder,
  helper = '0/100',
  optional = false,
}: {
  label: string;
  placeholder: string;
  helper?: string;
  optional?: boolean;
}) {
  return (
    <Box>
      <Text mb="8px" fontSize="14px" fontWeight="700" color="#111827">
        {label} {optional ? <Text as="span" color="#9CA3AF" fontWeight="500">(선택)</Text> : null}
      </Text>
      <Input
        h="48px"
        borderRadius="14px"
        borderColor="#E5E7EB"
        bg="#FFFFFF"
        px="16px"
        fontSize="14px"
        color="#111827"
        placeholder={placeholder}
        _placeholder={{ color: '#9CA3AF' }}
        _focus={{
          borderColor: '#FDBA74',
          boxShadow: '0 0 0 2px rgba(251, 146, 60, 0.14)',
        }}
      />
      <Text mt="8px" textAlign="right" fontSize="12px" color="#9CA3AF">
        {helper}
      </Text>
    </Box>
  );
}

function ChipGroup({
  title,
  items,
  activeLabel,
}: {
  title: string;
  items: string[];
  activeLabel: string;
}) {
  return (
    <Box>
      <Text mb="12px" fontSize="14px" fontWeight="700" color="#111827">
        {title}
      </Text>
      <Flex wrap="wrap" gap="8px">
        {items.map((item, index) => {
          const isActive = item === activeLabel;

          return (
            <Button
              key={`${item}-${index}`}
              type="button"
              h="36px"
              px="14px"
              borderRadius="9999px"
              borderWidth="1px"
              borderColor={isActive ? '#F97316' : '#D1D5DB'}
              bg={isActive ? '#F97316' : '#FFFFFF'}
              color={isActive ? '#FFFFFF' : '#374151'}
              fontSize="12px"
              fontWeight="600"
              _hover={{
                bg: isActive ? '#EA580C' : '#F9FAFB',
                borderColor: isActive ? '#EA580C' : '#9CA3AF',
              }}
            >
              {item}
            </Button>
          );
        })}
      </Flex>
    </Box>
  );
}

export default function MyPageSettingsProductPage() {
  return (
    <Box mx="auto" w="100%" maxW="960px">
      <Box>
        <Text fontSize="20px" fontWeight="700" color="#111827">
          프로덕트
        </Text>
        <Text mt="4px" fontSize="14px" color="#6B7280">
          커뮤니티와 프로필에 노출될 프로덕트 정보를 관리합니다.
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
        <Flex direction="column" gap="32px">
          <Field label="프로덕트 명" placeholder="프로덕트 명을 입력해 주세요." />

          <Field
            label="프로덕트 한 줄 소개"
            placeholder="프로덕트 한 줄 소개를 입력해 주세요."
            helper="0/200"
          />

          <ChipGroup
            title="프로덕트 산업"
            items={productKinds}
            activeLabel="비오·제약"
          />

          <ChipGroup
            title="프로덕트 카테고리"
            items={productCategories}
            activeLabel="글로벌·비상관형 솔루션"
          />

          <Field
            label="프로덕트 링크"
            placeholder="프로덕트 링크를 입력해 주세요."
            helper="0/200"
            optional
          />

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

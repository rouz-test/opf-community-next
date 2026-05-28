'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Image,
  Link as ChakraLink,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { Copy, ExternalLink, Pencil } from 'lucide-react';

import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import type { UserProduct, UserProfileBundle } from '@/types/user';

const tabs = ['프로필', '캠퍼스', '커뮤니티'] as const;
type DetailTab = (typeof tabs)[number];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}. ${month}. ${day}`;
}

function getInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || '회';
}

function DetailSection({
  title,
  children,
  minH,
}: {
  title: string;
  children: React.ReactNode;
  minH?: string;
}) {
  return (
    <Box
      overflow="hidden"
      border="1px solid"
      borderColor="#E5E7EB"
      borderRadius="6px"
      bg="#FFFFFF"
      minH={minH}
    >
      <Flex h="44px" align="center" justify="space-between" borderBottom="1px solid" borderColor="#E5E7EB" px="20px">
        <Text fontSize="16px" fontWeight="700" color="#7A7A7A">
          {title}
        </Text>
        <Button
          type="button"
          unstyled
          display="inline-flex"
          h="28px"
          w="28px"
          alignItems="center"
          justifyContent="center"
          borderRadius="6px"
          color="#4B5563"
          _hover={{ bg: '#F9FAFB' }}
          aria-label={`${title} 수정`}
        >
          <Pencil size={16} />
        </Button>
      </Flex>
      {children}
    </Box>
  );
}

function InfoItem({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value?: string | null;
  copyable?: boolean;
}) {
  const displayValue = value || '-';

  const handleCopy = async () => {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
  };

  return (
    <Box minW="0">
      <Text mb="8px" fontSize="14px" fontWeight="700" color="#4B4B4B">
        {label}
      </Text>
      <Flex align="center" gap="8px" minW="0">
        <Text minW="0" truncate fontSize="14px" fontWeight="500" color="#4B4B4B">
          {displayValue}
        </Text>
        {copyable && value ? (
          <Button
            type="button"
            unstyled
            display="inline-flex"
            h="24px"
            w="24px"
            flexShrink={0}
            alignItems="center"
            justifyContent="center"
            borderRadius="4px"
            color="#111827"
            _hover={{ bg: '#F9FAFB' }}
            aria-label={`${label} 복사`}
            onClick={handleCopy}
          >
            <Copy size={15} />
          </Button>
        ) : null}
      </Flex>
    </Box>
  );
}

function ProductInfo({ product }: { product: UserProduct | null }) {
  const productItems = [
    { label: '프로덕트 명', value: product?.name },
    { label: '프로덕트 한 줄 소개', value: product?.summary },
    { label: '프로덕트 산업', value: product?.industry },
    { label: '프로덕트 카테고리', value: product?.category },
  ];

  return (
    <Flex direction="column" gap="34px" px="20px" py="24px">
      {productItems.map((item) => (
        <Box key={item.label}>
          <Text mb="8px" fontSize="14px" fontWeight="700" color="#4B4B4B">
            {item.label}
          </Text>
          <Text fontSize="13px" lineHeight="1.45" color="#4B4B4B">
            {item.value || '-'}
          </Text>
        </Box>
      ))}

      <Box>
        <Text mb="8px" fontSize="14px" fontWeight="700" color="#4B4B4B">
          프로덕트 링크
        </Text>
        <Flex align="center" gap="8px" minW="0">
          {product?.link ? (
            <ChakraLink
              href={product.link}
              target="_blank"
              rel="noreferrer"
              minW="0"
              truncate
              fontSize="13px"
              color="#4B4B4B"
              _hover={{ color: '#F97316', textDecoration: 'underline' }}
            >
              {product.link}
            </ChakraLink>
          ) : (
            <Text fontSize="13px" color="#4B4B4B">
              -
            </Text>
          )}
          {product?.link ? (
            <Icon as={ExternalLink} boxSize="16px" color="#4B5563" flexShrink={0} />
          ) : null}
        </Flex>
      </Box>
    </Flex>
  );
}

function ProfileContent({ user }: { user: UserProfileBundle }) {
  const account = user.account;
  const memo = user.adminNotes?.[0]?.body || '등록된 메모가 없습니다.';

  return (
    <Grid templateColumns={{ base: '1fr', xl: '574px 1fr' }} gap="26px" alignItems="start">
      <Flex direction="column" gap="26px">
        <DetailSection title="기본" minH="316px">
          <Grid
            templateColumns={{ base: '1fr', md: '132px 1fr' }}
            gap="38px"
            px="26px"
            py="30px"
          >
            <Flex align="flex-start" justify={{ base: 'flex-start', md: 'center' }}>
              {account.profile.avatar ? (
                <Image
                  src={account.profile.avatar}
                  alt={account.verification.realName}
                  boxSize="118px"
                  borderRadius="full"
                  objectFit="cover"
                />
              ) : (
                <Flex
                  boxSize="118px"
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="#FFF7ED"
                  color="#F97316"
                  fontSize="34px"
                  fontWeight="700"
                >
                  {getInitial(account.verification.realName)}
                </Flex>
              )}
            </Flex>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} columnGap="54px" rowGap="24px" minW="0">
              <InfoItem label="이름" value={account.verification.realName} />
              <InfoItem label="휴대폰 번호" value={account.verification.phoneNumber} />
              <InfoItem label="소속" value={account.profile.company} />
              <InfoItem label="직책" value={account.profile.position} />
              <Box gridColumn={{ base: 'auto', md: '1 / -1' }}>
                <InfoItem label="이메일" value={account.auth.socialEmail} copyable />
              </Box>
              <InfoItem label="가입 일자" value={formatDate(account.createdAt)} />
            </Grid>
          </Grid>
        </DetailSection>

        <DetailSection title="프로덕트">
          <ProductInfo product={user.primaryProduct} />
        </DetailSection>
      </Flex>

      <DetailSection title="메모" minH="840px">
        <Box position="relative" h="calc(840px - 44px)" px="20px" py="20px" overflowY="auto">
          <Text whiteSpace="pre-wrap" fontSize="13px" lineHeight="1.7" color="#4B4B4B">
            {memo}
          </Text>
        </Box>
      </DetailSection>
    </Grid>
  );
}

function PlaceholderContent({ tab }: { tab: Exclude<DetailTab, '프로필'> }) {
  return (
    <Box border="1px solid" borderColor="#E5E7EB" borderRadius="6px" bg="#FFFFFF" p="32px">
      <Text fontSize="14px" color="#6B7280">
        {tab} 정보는 다음 단계에서 회원 DB와 연결할 예정입니다.
      </Text>
    </Box>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams<{ accountId: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>('프로필');
  const [user, setUser] = useState<UserProfileBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const accountId = useMemo(() => {
    const rawAccountId = params?.accountId;
    return Array.isArray(rawAccountId) ? rawAccountId[0] : rawAccountId;
  }, [params?.accountId]);

  useEffect(() => {
    if (!accountId) return;

    let isCancelled = false;

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch(
          `/api/mock/users?accountId=${encodeURIComponent(accountId)}&viewerRole=admin&includeAdminNotes=true`,
          { cache: 'no-store' },
        );
        const data = (await response.json().catch(() => null)) as UserProfileBundle | { message?: string } | null;

        if (!response.ok || !data || !('account' in data)) {
          throw new Error((data as { message?: string } | null)?.message || '회원 정보를 불러오지 못했습니다.');
        }

        if (!isCancelled) {
          setUser(data);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : '회원 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchUser();

    return () => {
      isCancelled = true;
    };
  }, [accountId]);

  return (
    <PageContainer>
      <PageHeader
        left={
          <Flex align="center" gap="16px">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;

              return (
                <Button
                  key={tab}
                  type="button"
                  unstyled
                  position="relative"
                  pb="8px"
                  fontSize="12px"
                  fontWeight="500"
                  color={isActive ? '#F97316' : '#6B7280'}
                  transition="color 0.2s ease"
                  _hover={{ color: isActive ? '#F97316' : '#111827' }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
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
        right={null}
      />

      <Box mt="24px">
        {isLoading ? (
          <Flex align="center" justify="center" minH="360px" color="#6B7280">
            <Spinner size="sm" color="#F97316" />
            <Text ml="8px" fontSize="14px">
              회원 정보를 불러오는 중입니다.
            </Text>
          </Flex>
        ) : null}

        {!isLoading && errorMessage ? (
          <Flex align="center" justify="center" minH="360px">
            <Text fontSize="14px" color="#DC2626">
              {errorMessage}
            </Text>
          </Flex>
        ) : null}

        {!isLoading && !errorMessage && user && activeTab === '프로필' ? (
          <ProfileContent user={user} />
        ) : null}

        {!isLoading && !errorMessage && user && activeTab === '캠퍼스' ? (
          <PlaceholderContent tab="캠퍼스" />
        ) : null}

        {!isLoading && !errorMessage && user && activeTab === '커뮤니티' ? (
          <PlaceholderContent tab="커뮤니티" />
        ) : null}
      </Box>
    </PageContainer>
  );
}

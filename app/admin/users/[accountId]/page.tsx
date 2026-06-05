'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Check, ChevronDown, Copy, ExternalLink, LayoutGrid, List, Pencil } from 'lucide-react';

import {
  AdminCommunityBoardPostRow,
  AdminCommunityFeedPostCard,
  type AdminCommunityPostCardData,
} from '@/app/admin/components/community/admin-community-post-cards';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import AdminCard from '@/app/admin/components/ui/card';
import AdminSwitch from '@/app/admin/components/ui/switch';
import { toaster } from '@/app/admin/components/ui/toaster';
import communityCommentsData from '@/data/mock/community-comments.json';
import type { CommunityContent, CommunityContentListResponse } from '@/types/community-content';
import type { CommunityCommentEntity } from '@/types/community-comment';
import type { UserProduct, UserProfileBundle } from '@/types/user';

const tabs = ['프로필', '캠퍼스', '커뮤니티'] as const;
type DetailTab = (typeof tabs)[number];
const communityActivityTabs = [
  { key: 'posts', label: '게시글' },
  { key: 'comments', label: '댓글' },
  { key: 'liked', label: '좋아요' },
  { key: 'saved', label: '저장' },
] as const;
type CommunityActivityTab = (typeof communityActivityTabs)[number]['key'];
const communityComments = communityCommentsData as CommunityCommentEntity[];

type CommunityDashboardMetric = {
  title: string;
  total: number;
  real: number;
  anonymous: number;
};

function formatDate(dateString?: string) {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}. ${month}. ${day}`;
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
              <Image
                src={account.profile.avatar || '/images/profiles/real-xlarge.png'}
                alt={account.verification.realName}
                boxSize="118px"
                borderRadius="full"
                objectFit="cover"
              />
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

function CommunityDashboardCard({ metric }: { metric: CommunityDashboardMetric }) {
  const total = metric.total || metric.real + metric.anonymous || 1;
  const realRatio = Math.max(0, Math.min(100, (metric.real / total) * 100));
  const anonymousRatio = Math.max(0, Math.min(100, (metric.anonymous / total) * 100));

  return (
    <AdminCard
      as="article"
      minW="0"
      w="full"
      borderRadius="8px"
      p="12px 16px"
    >
      <Text fontSize="12px" fontWeight="500" color="#6B7280">
        {metric.title}
      </Text>

      <Text mt="8px" fontSize="22px" fontWeight="600" lineHeight="1" color="#111827">
        {metric.total.toLocaleString()}
      </Text>

      <Flex mt="12px" align="center" justify="space-between" gap="16px" fontSize="11px" color="#6B7280">
        <Text truncate>실명 {metric.real.toLocaleString()}</Text>
        <Text truncate textAlign="right">익명 {metric.anonymous.toLocaleString()}</Text>
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
          <Text>{Math.round(anonymousRatio)}%</Text>
        </Flex>
      </Box>
    </AdminCard>
  );
}

function buildCommunityDashboardMetrics({
  accountId,
  visibleContents,
}: {
  accountId: string;
  visibleContents: CommunityContent[];
}): CommunityDashboardMetric[] {
  const authoredContents = visibleContents.filter((content) => content.author.id === accountId);
  const visibleContentIds = new Set(visibleContents.map((content) => content.id));
  const authoredComments = communityComments.filter(
    (comment) =>
      comment.author.id === accountId &&
      comment.status === 'published' &&
      visibleContentIds.has(comment.contentId),
  );

  const countByVisibility = <T extends { author: { visibility: string } }>(items: T[]) => {
    const anonymous = items.filter((item) => item.author.visibility === 'anonymous').length;
    const real = items.length - anonymous;

    return {
      total: items.length,
      real,
      anonymous,
    };
  };

  const postCounts = countByVisibility(authoredContents);
  const commentCounts = countByVisibility(authoredComments);

  return [
    {
      title: '게시글 수',
      ...postCounts,
    },
    {
      title: '댓글 수',
      ...commentCounts,
    },
    {
      title: '멘션 받은 수',
      total: 0,
      real: 0,
      anonymous: 0,
    },
  ];
}

function CommunityFollowCard({ user }: { user: UserProfileBundle }) {
  const followerCount = user.communityProfile?.stats.followerCount ?? 0;
  const followingCount = user.communityProfile?.stats.followingCount ?? 0;

  return (
    <AdminCard as="article" display="flex" flexDirection="column" minW="0" w="full" h="full" borderRadius="8px" p="12px 16px">
      <Text fontSize="12px" fontWeight="500" color="#6B7280">
        팔로워/팔로잉
      </Text>

      <Flex flex="1" minH="70px" align="center" gap="12px">
        <Box minW="0" flex="1" textAlign="center">
          <Text fontSize="22px" fontWeight="600" lineHeight="1" color="#111827">
            {followerCount.toLocaleString()}
          </Text>
          <Text mt="8px" fontSize="10px" fontWeight="500" letterSpacing="0.04em" color="#9CA3AF">
            팔로워
          </Text>
        </Box>

        <Box h="42px" w="1px" bg="#E5E7EB" flexShrink={0} />

        <Box minW="0" flex="1" textAlign="center">
          <Text fontSize="22px" fontWeight="600" lineHeight="1" color="#111827">
            {followingCount.toLocaleString()}
          </Text>
          <Text mt="8px" fontSize="10px" fontWeight="500" letterSpacing="0.04em" color="#9CA3AF">
            팔로잉
          </Text>
        </Box>
      </Flex>
    </AdminCard>
  );
}

function CommunitySuspensionCard({ user }: { user: UserProfileBundle }) {
  const [isCommunitySuspended, setIsCommunitySuspended] = useState(Boolean(user.communityProfile?.moderation?.isSuspended));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsCommunitySuspended(Boolean(user.communityProfile?.moderation?.isSuspended));
  }, [user.communityProfile?.moderation?.isSuspended]);

  const handleChangeSuspension = async (nextSuspended: boolean) => {
    const previousValue = isCommunitySuspended;
    setIsCommunitySuspended(nextSuspended);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/mock/users/${user.account.accountId}/community-suspension`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isSuspended: nextSuspended,
          suspendedByAdminId: 'admin-1',
        }),
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message || '커뮤니티 활동 정지 상태를 저장하지 못했습니다.');
      }

      toaster.create({
        description: nextSuspended ? '커뮤니티 활동을 정지했습니다.' : '커뮤니티 활동 정지를 해제했습니다.',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      setIsCommunitySuspended(previousValue);
      toaster.create({
        description: error instanceof Error ? error.message : '커뮤니티 활동 정지 상태를 저장하지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminCard as="article" display="flex" flexDirection="column" minW="0" w="full" h="full" borderRadius="8px" p="12px 16px">
      <Text fontSize="12px" fontWeight="500" color="#6B7280">
        활동 정지
      </Text>

      <Flex flex="1" minH="70px" align="center" justify="space-between" gap="12px">
        <Box minW="0">
          <Text fontSize="14px" fontWeight="600" color={isCommunitySuspended ? '#DC2626' : '#111827'}>
            {isCommunitySuspended ? '정지' : '정상'}
          </Text>
          <Text mt="8px" fontSize="10px" color="#9CA3AF">
            계정 단위
          </Text>
        </Box>

        <AdminSwitch
          checked={isCommunitySuspended}
          disabled={isSaving}
          onCheckedChange={(checked) => {
            void handleChangeSuspension(checked);
          }}
        />
      </Flex>
    </AdminCard>
  );
}

function CommunityContent({ user }: { user: UserProfileBundle }) {
  const accountId = user.account.accountId;
  const [activeTab, setActiveTab] = useState<CommunityActivityTab>('posts');
  const [viewMode, setViewMode] = useState<'feed' | 'board'>('feed');
  const [profileFilter, setProfileFilter] = useState<'all' | 'real' | 'anonymous'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [contents, setContents] = useState<CommunityContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  useEffect(() => {
    let isCancelled = false;

    const fetchContents = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch(
          `/api/mock/community-contents?status=published&page=1&pageSize=200&accountId=${encodeURIComponent(accountId)}&sortKey=date&sortDirection=desc`,
          { cache: 'no-store' },
        );
        const data = (await response.json().catch(() => null)) as CommunityContentListResponse | { message?: string } | null;

        if (!response.ok || !data || !('items' in data)) {
          throw new Error((data as { message?: string } | null)?.message || '커뮤니티 활동을 불러오지 못했습니다.');
        }

        if (!isCancelled) {
          setContents(data.items);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : '커뮤니티 활동을 불러오지 못했습니다.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchContents();

    return () => {
      isCancelled = true;
    };
  }, [accountId]);

  const visibleContents = useMemo(
    () => contents.filter((content) => !content.flags.isHiddenByAuthor),
    [contents],
  );

  const dashboardMetrics = useMemo(
    () => buildCommunityDashboardMetrics({ accountId, visibleContents }),
    [accountId, visibleContents],
  );

  const filteredVisibleContents = useMemo(
    () =>
      visibleContents.filter((content) => {
        if (profileFilter === 'all') return true;
        return profileFilter === 'real'
          ? content.author.visibility !== 'anonymous'
          : content.author.visibility === 'anonymous';
      }),
    [profileFilter, visibleContents],
  );

  const activityItems = useMemo(() => {
    if (activeTab === 'posts') {
      return filteredVisibleContents
        .filter((content) => content.author.id === accountId)
        .map((content) => ({ content }));
    }

    if (activeTab === 'liked') {
      return filteredVisibleContents
        .filter((content) => content.viewerState?.isLikedByMe)
        .map((content) => ({ content }));
    }

    if (activeTab === 'saved') {
      return filteredVisibleContents
        .filter((content) => content.viewerState?.isSavedByMe)
        .map((content) => ({ content }));
    }

    const latestCommentByContentId = new Map<string, CommunityCommentEntity>();

    communityComments
      .filter((comment) => comment.author.id === accountId && comment.status === 'published')
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .forEach((comment) => {
        if (!latestCommentByContentId.has(comment.contentId)) {
          latestCommentByContentId.set(comment.contentId, comment);
        }
      });

    return Array.from(latestCommentByContentId.values()).reduce<AdminCommunityPostCardData[]>((acc, comment) => {
      const content = filteredVisibleContents.find((item) => item.id === comment.contentId);
      if (!content) return acc;

      acc.push({
        content,
        commentPreview: {
          content: comment.content,
          createdAt: comment.createdAt,
        },
      });

      return acc;
    }, []);
  }, [accountId, activeTab, filteredVisibleContents]);

  const emptyMessage =
    activeTab === 'posts'
      ? '작성한 게시글이 없습니다.'
      : activeTab === 'comments'
        ? '작성한 댓글이 없습니다.'
        : activeTab === 'liked'
          ? '좋아요를 누른 게시글이 없습니다.'
          : '저장한 게시글이 없습니다.';

  return (
    <Box>
      <Box mb="24px">
        <Text mb="12px" fontSize="14px" fontWeight="700" color="#111827">
          대시보드
        </Text>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' }} gap="12px">
          <CommunityFollowCard user={user} />
          {dashboardMetrics.map((metric) => (
            <CommunityDashboardCard key={metric.title} metric={metric} />
          ))}
          <CommunitySuspensionCard user={user} />
        </Grid>
      </Box>

      <Box borderBottom="1px solid" borderColor="#E5E7EB">
        <Flex align="center" gap="4px" wrap="wrap">
          {communityActivityTabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <Button
                key={tab.key}
                type="button"
                variant="ghost"
                h="48px"
                px="16px"
                borderRadius="0"
                position="relative"
                color={isActive ? '#111827' : '#6B7280'}
                fontSize="14px"
                fontWeight="600"
                _hover={{ bg: 'transparent', color: '#111827' }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {isActive ? (
                  <Box position="absolute" bottom="0" insetX="0" h="2px" bg="#F97316" />
                ) : null}
              </Button>
            );
          })}
        </Flex>
      </Box>

      <Flex mt="16px" wrap="wrap" align="center" justify="space-between" gap="12px">
        <Box ref={filterRef} position="relative">
          <Button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            h="40px"
            px="16px"
            borderRadius="14px"
            borderWidth="1px"
            borderColor="#E5E7EB"
            bg="#FFFFFF"
            color="#4B5563"
            fontSize="14px"
            fontWeight="600"
            _hover={{ borderColor: '#D1D5DB', bg: '#F9FAFB' }}
          >
            <Flex align="center" gap="8px">
              <Text as="span">
                {profileFilter === 'all'
                  ? '전체 보기'
                  : profileFilter === 'real'
                    ? '실명만'
                    : '익명만'}
              </Text>
              <ChevronDown size={16} />
            </Flex>
          </Button>

          {isFilterOpen ? (
            <Box
              position="absolute"
              left="0"
              mt="8px"
              zIndex="20"
              w="180px"
              overflow="hidden"
              borderWidth="1px"
              borderColor="#E5E7EB"
              borderRadius="14px"
              bg="#FFFFFF"
              py="6px"
              boxShadow="0 16px 32px rgba(15, 23, 42, 0.12)"
            >
              {[
                { label: '전체 보기', value: 'all' },
                { label: '실명만 보기', value: 'real' },
                { label: '익명만 보기', value: 'anonymous' },
              ].map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  unstyled
                  display="flex"
                  w="100%"
                  alignItems="center"
                  justifyContent="space-between"
                  px="12px"
                  py="10px"
                  fontSize="14px"
                  color="#374151"
                  _hover={{ bg: '#F9FAFB' }}
                  onClick={() => {
                    setProfileFilter(option.value as 'all' | 'real' | 'anonymous');
                    setIsFilterOpen(false);
                  }}
                >
                  <Text as="span">{option.label}</Text>
                  {profileFilter === option.value ? (
                    <Check size={16} color="#F97316" />
                  ) : null}
                </Button>
              ))}
            </Box>
          ) : null}
        </Box>

        <Flex overflow="hidden" borderWidth="1px" borderColor="#E5E7EB" borderRadius="14px" bg="#FFFFFF">
          <Button
            type="button"
            onClick={() => setViewMode('feed')}
            h="40px"
            px="16px"
            borderRadius="0"
            borderRight="1px solid"
            borderColor="#E5E7EB"
            bg={viewMode === 'feed' ? '#FFF7ED' : '#FFFFFF'}
            color={viewMode === 'feed' ? '#C2410C' : '#4B5563'}
            fontSize="14px"
            fontWeight="600"
            _hover={{ bg: viewMode === 'feed' ? '#FFF7ED' : '#F9FAFB' }}
          >
            <Flex align="center" gap="8px">
              <LayoutGrid size={16} />
              <Text as="span">피드뷰</Text>
            </Flex>
          </Button>
          <Button
            type="button"
            onClick={() => setViewMode('board')}
            h="40px"
            px="16px"
            borderRadius="0"
            bg={viewMode === 'board' ? '#FFF7ED' : '#FFFFFF'}
            color={viewMode === 'board' ? '#C2410C' : '#4B5563'}
            fontSize="14px"
            fontWeight="600"
            _hover={{ bg: viewMode === 'board' ? '#FFF7ED' : '#F9FAFB' }}
          >
            <Flex align="center" gap="8px">
              <List size={16} />
              <Text as="span">게시판뷰</Text>
            </Flex>
          </Button>
        </Flex>
      </Flex>

      <Box mt="16px">
        {isLoading ? (
          <Flex align="center" justify="center" minH="240px" color="#6B7280">
            <Spinner size="sm" color="#F97316" />
            <Text ml="8px" fontSize="14px">
              커뮤니티 활동을 불러오는 중입니다.
            </Text>
          </Flex>
        ) : null}

        {!isLoading && errorMessage ? (
          <Flex align="center" justify="center" minH="240px">
            <Text fontSize="14px" color="#DC2626">
              {errorMessage}
            </Text>
          </Flex>
        ) : null}

        {!isLoading && !errorMessage && activityItems.length === 0 ? (
          <Box border="1px dashed" borderColor="#D1D5DB" borderRadius="16px" bg="#FFFFFF" px="24px" py="48px" textAlign="center">
            <Text fontSize="14px" color="#6B7280">
              {emptyMessage}
            </Text>
          </Box>
        ) : null}

        {!isLoading && !errorMessage && activityItems.length > 0 ? (
          <Flex direction="column" gap="12px">
            {activityItems.map((item) => (
              viewMode === 'feed' ? (
                <AdminCommunityFeedPostCard
                  key={`${activeTab}-${item.content.id}`}
                  item={item}
                  formatDate={formatDate}
                />
              ) : (
                <AdminCommunityBoardPostRow
                  key={`${activeTab}-${item.content.id}`}
                  item={item}
                  formatDate={formatDate}
                />
              )
            ))}
          </Flex>
        ) : null}
      </Box>
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
          <CommunityContent user={user} />
        ) : null}
      </Box>
    </PageContainer>
  );
}

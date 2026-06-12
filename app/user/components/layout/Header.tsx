'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fragment, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Box, Button, Flex, HStack, Icon, Image as ChakraImage, Link as ChakraLink, Portal, Text } from '@chakra-ui/react';
import { CommunityProfileCard } from '@/app/user/components/community/CommunityProfileCard';
import BellActiveIcon from '@/app/user/components/icons/BellActiveIcon';
import BellIcon from '@/app/user/components/icons/BellIcon';
import CheckIcon from '@/app/user/components/icons/CheckIcon';
import CommentIcon from '@/app/user/components/icons/CommentIcon';
import FollowingIcon from '@/app/user/components/icons/FollowingIcon';
import MoreIcon from '@/app/user/components/icons/MoreIcon';
import NewsIcon from '@/app/user/components/icons/NewsIcon';
import { TEST_LOGIN_USERS, useAuth } from '@/app/user/components/providers/AuthProvider';
import { useMobileNav } from '@/app/user/components/providers/MobileNavProvider';
import { useProfileMenu } from '@/app/user/components/providers/ProfileMenuProvider';
import { getCommunityIdentityLabel } from '@/app/user/lib/community-identity';

type NotificationType = 'comment' | 'reply' | 'mention' | 'follow' | 'notice';

type NotificationItem = {
  id: string;
  type: NotificationType;
  actor: {
    name: string;
    profileType: 'real' | 'anonymous' | 'system';
    avatar: string;
  };
  title: string;
  summary: string;
  target: {
    href?: string;
  } | null;
  createdAt: string;
  readAt: string | null;
};

type NotificationResponse = {
  items: NotificationItem[];
  unreadCount: number;
};

export default function Header() {
  const [profileModeToast, setProfileModeToast] = useState<string | null>(null);
  const [isTestLoginModalOpen, setIsTestLoginModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationLayerPosition, setNotificationLayerPosition] = useState({ top: 64, right: 16 });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const {
    isLoggedIn,
    currentUser,
    setCurrentUserByAccountId,
    defaultCommunityIdentity,
    setDefaultCommunityIdentity,
  } = useAuth();
  const { openNav } = useMobileNav();
  const { openProfileMenu } = useProfileMenu();

  const mobileCommunityProfileTriggerRef = useRef<HTMLDivElement | null>(null);
  const desktopProfileTriggerRef = useRef<HTMLButtonElement | null>(null);
  const notificationTriggerRef = useRef<HTMLButtonElement | null>(null);
  const notificationLayerRef = useRef<HTMLDivElement | null>(null);

  const isCommunityRoute = pathname.startsWith('/user/community');
  const hasUnreadNotifications = unreadNotificationCount > 0;

  const switchCommunityProfileMode = () => {
    const nextIdentity = defaultCommunityIdentity === 'real' ? 'anonymous' : 'real';
    setDefaultCommunityIdentity(nextIdentity);

    if (isCommunityRoute) {
      setProfileModeToast(`${getCommunityIdentityLabel(nextIdentity)} 기본값으로 전환되었습니다.`);
    }
  };

  const headerProfileAvatar = currentUser.avatar;

  const getProfileMenuAnchor = (element: HTMLElement | null) => {
    if (!element) return undefined;

    const rect = element.getBoundingClientRect();

    return {
      top: rect.bottom + 8,
      left: rect.right,
    };
  };

  const updateNotificationLayerPosition = () => {
    const rect = notificationTriggerRef.current?.getBoundingClientRect();

    if (!rect) {
      setNotificationLayerPosition({
        top: 64,
        right: 16,
      });
      return;
    }

    setNotificationLayerPosition({
      top: rect.bottom + 12,
      right: Math.max(16, window.innerWidth - rect.right),
    });
  };

  const getRelativeTimeLabel = (value: string) => {
    const timestamp = new Date(value).getTime();
    const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  };

  const getNotificationIcon = (type: NotificationType) => {
    if (type === 'follow') return FollowingIcon;
    if (type === 'notice') return NewsIcon;
    return CommentIcon;
  };

  const applyNotificationResponse = (data: NotificationResponse) => {
    setNotifications(data.items);
    setUnreadNotificationCount(data.unreadCount);
  };

  const markNotificationsAsRead = async ({
    notificationId,
    markAllAsRead = false,
  }: {
    notificationId?: string;
    markAllAsRead?: boolean;
  }) => {
    try {
      const response = await fetch('/api/mock/community-notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          markAllAsRead,
        }),
      });
      const data = (await response.json().catch(() => null)) as NotificationResponse | null;

      if (response.ok && data && 'items' in data) {
        applyNotificationResponse(data);
      }
    } catch {
      // 알림 읽음 처리는 보조 기능이라 실패해도 화면 흐름을 막지 않습니다.
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    void markNotificationsAsRead({ notificationId: notification.id });
    setIsNotificationOpen(false);

    if (notification.target?.href) {
      router.push(notification.target.href);
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    void markNotificationsAsRead({ markAllAsRead: true });
  };

  useEffect(() => {
    if (!profileModeToast) return;

    const toastTimer = window.setTimeout(() => {
      setProfileModeToast(null);
    }, 1800);

    return () => {
      window.clearTimeout(toastTimer);
    };
  }, [profileModeToast]);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      if (!isLoggedIn) {
        setNotifications([]);
        setUnreadNotificationCount(0);
        return;
      }

      try {
        setIsNotificationLoading(true);
        const response = await fetch('/api/mock/community-notifications', {
          cache: 'no-store',
        });
        const data = (await response.json().catch(() => null)) as NotificationResponse | { message?: string } | null;

        if (!response.ok || !data || !('items' in data)) {
          throw new Error((data as { message?: string } | null)?.message || '알림을 불러오지 못했습니다.');
        }

        if (isMounted) {
          applyNotificationResponse(data);
        }
      } catch {
        if (isMounted) {
          setNotifications([]);
          setUnreadNotificationCount(0);
        }
      } finally {
        if (isMounted) {
          setIsNotificationLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [currentUser.accountId, isLoggedIn]);

  useEffect(() => {
    if (!isNotificationOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (!target) return;
      if (notificationTriggerRef.current?.contains(target)) return;
      if (notificationLayerRef.current?.contains(target)) return;

      setIsNotificationOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updateNotificationLayerPosition);
    window.addEventListener('scroll', updateNotificationLayerPosition, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateNotificationLayerPosition);
      window.removeEventListener('scroll', updateNotificationLayerPosition, true);
    };
  }, [isNotificationOpen]);

  return (
    <Fragment>
      {profileModeToast ? (
        <Flex position="fixed" right="4" bottom="6" zIndex="140" maxW="calc(100vw - 2rem)" justify="flex-end" pointerEvents="none">
          <Box rounded="2xl" bg="rgba(17,24,39,0.92)" px="4" py="3" fontSize="sm" fontWeight="500" color="white" boxShadow="2xl" backdropFilter="blur(8px)">
            {profileModeToast}
          </Box>
        </Flex>
      ) : null}

      <Box as="header" position="sticky" top="0" zIndex="40" w="full" overflow="hidden" borderBottomWidth="1px" borderColor="gray.200" bg="rgba(255,255,255,0.9)" backdropFilter="blur(8px)">
        <Flex position="relative" mx="auto" h="14" maxW="1200px" align="center" justify="space-between" px="4">
          <HStack gap="2">
            <Button
              type="button"
              onClick={openNav}
              display={{ base: 'inline-flex', lg: 'none' }}
              minW="9"
              h="9"
              rounded="full"
              bg="transparent"
              p="0"
              color="gray.600"
              _hover={{ color: 'gray.900', bg: 'transparent' }}
              aria-label="메뉴 열기"
            >
              <Icon as={Menu} boxSize="5" />
            </Button>

            <ChakraLink
              asChild
              display={{ base: 'none', sm: 'inline-flex' }}
              alignItems="center"
              outline="none"
              boxShadow="none"
              _hover={{ textDecoration: 'none' }}
              _focus={{ outline: 'none', boxShadow: 'none' }}
              _focusVisible={{ outline: 'none', boxShadow: 'none' }}
            >
              <Link href="/user">
                <Image
                  src="/logo.webp"
                  alt="Orange Park"
                  width={140}
                  height={40}
                  style={{ height: '36px', width: 'auto' }}
                  priority
                />
              </Link>
            </ChakraLink>
          </HStack>

          <Flex as="nav" display={{ base: 'none', md: 'flex' }} align="center" gap="6" fontSize="sm" color="gray.700">
            <ChakraLink
              asChild
              fontWeight="600"
              color="#111827"
              outline="none"
              boxShadow="none"
              _hover={{ color: '#EA580C', textDecoration: 'none' }}
              _focus={{ outline: 'none', boxShadow: 'none' }}
              _focusVisible={{ outline: 'none', boxShadow: 'none' }}
            >
              <Link href="/user/community">커뮤니티</Link>
            </ChakraLink>
            <Button
              type="button"
              minW="auto"
              h="auto"
              bg="transparent"
              p="0"
              fontSize="sm"
              fontWeight="400"
              color="inherit"
              outline="none"
              boxShadow="none"
              _hover={{ bg: 'transparent', color: '#EA580C' }}
              _focus={{ outline: 'none', boxShadow: 'none' }}
              _focusVisible={{ outline: 'none', boxShadow: 'none' }}
            >
              캠퍼스
              <Text as="span" ml="1" fontSize="xs">
                ▾
              </Text>
            </Button>
            <ChakraLink
              asChild
              outline="none"
              boxShadow="none"
              _hover={{ color: '#EA580C', textDecoration: 'none' }}
              _focus={{ outline: 'none', boxShadow: 'none' }}
              _focusVisible={{ outline: 'none', boxShadow: 'none' }}
            >
              <Link href="/user/article">아티클</Link>
            </ChakraLink>
          </Flex>

          <Box position="absolute" left="50%" transform="translateX(-50%)" display={{ base: 'block', sm: 'none' }}>
            <ChakraLink
              asChild
              outline="none"
              boxShadow="none"
              _hover={{ textDecoration: 'none' }}
              _focus={{ outline: 'none', boxShadow: 'none' }}
              _focusVisible={{ outline: 'none', boxShadow: 'none' }}
            >
              <Link href="/user">
                <Image
                  src="/logo-mobile.webp"
                  alt="Orange Park"
                  width={40}
                  height={40}
                  style={{ height: '36px', width: 'auto' }}
                  priority
                />
              </Link>
            </ChakraLink>
          </Box>

          <Box position="relative">
            {isLoggedIn ? (
              <HStack gap="2">
                <Button
                  ref={notificationTriggerRef}
                  type="button"
                  position="relative"
                  minW="9"
                  h="9"
                  rounded="full"
                  bg="transparent"
                  p="0"
                  color="gray.600"
                  _hover={{ bg: 'gray.100', color: 'gray.800' }}
                  aria-label="알림 열기"
                  aria-expanded={isNotificationOpen}
                  onClick={() => {
                    updateNotificationLayerPosition();
                    setIsNotificationOpen((prev) => !prev);
                  }}
                >
                  {hasUnreadNotifications ? (
                    <BellActiveIcon size={20} bellColor="#535455" dotColor="#FF6900" />
                  ) : (
                    <BellIcon size={20} color="#535455" />
                  )}
                  {hasUnreadNotifications ? (
                    <Flex
                      position="absolute"
                      top="-3px"
                      right="-3px"
                      minW="16px"
                      h="16px"
                      align="center"
                      justify="center"
                      rounded="full"
                      bg="#FF6900"
                      px="4px"
                      fontSize="10px"
                      fontWeight="800"
                      lineHeight="1"
                      color="#FFFFFF"
                    >
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </Flex>
                  ) : null}
                </Button>

                {isCommunityRoute ? (
                  <Box ref={mobileCommunityProfileTriggerRef} display={{ base: 'block', lg: 'none' }}>
                    <CommunityProfileCard
                      variant="header"
                      profileMode={defaultCommunityIdentity}
                      onToggleProfileMode={switchCommunityProfileMode}
                      onProfileClick={() =>
                        openProfileMenu({
                          showCommunitySwitch: true,
                          onToggleProfileMode: switchCommunityProfileMode,
                          anchor: getProfileMenuAnchor(mobileCommunityProfileTriggerRef.current),
                        })
                      }
                      currentUser={currentUser}
                    />
                  </Box>
                ) : null}

                {!isCommunityRoute ? (
                  <Button
                    ref={desktopProfileTriggerRef}
                    type="button"
                    onClick={() =>
                      openProfileMenu({
                        anchor: getProfileMenuAnchor(desktopProfileTriggerRef.current),
                      })
                    }
                    minW="auto"
                    h="auto"
                    bg="transparent"
                    p="0"
                    transition="transform 0.2s"
                    _hover={{ transform: 'scale(1.05)', bg: 'transparent' }}
                    aria-label="마이페이지로 이동"
                    title="마이페이지 진입 예정"
                  >
                    <ChakraImage
                      src={headerProfileAvatar}
                      alt="사용자 프로필"
                      h="9"
                      w="9"
                      rounded="full"
                      objectFit="cover"
                      borderWidth="1px"
                      borderColor="gray.200"
                    />
                  </Button>
                ) : (
                  <Button
                    ref={desktopProfileTriggerRef}
                    type="button"
                    display={{ base: 'none', lg: 'inline-flex' }}
                    onClick={() =>
                      openProfileMenu({
                        anchor: getProfileMenuAnchor(desktopProfileTriggerRef.current),
                      })
                    }
                    minW="auto"
                    h="auto"
                    bg="transparent"
                    p="0"
                    transition="transform 0.2s"
                    _hover={{ transform: 'scale(1.05)', bg: 'transparent' }}
                    aria-label="마이페이지로 이동"
                    title="마이페이지 진입 예정"
                  >
                    <ChakraImage
                      src={headerProfileAvatar}
                      alt="사용자 프로필"
                      h="9"
                      w="9"
                      rounded="full"
                      objectFit="cover"
                      borderWidth="1px"
                      borderColor="gray.200"
                    />
                  </Button>
                )}
              </HStack>
            ) : (
              <HStack gap="2">
                <Button
                  type="button"
                  onClick={() => setIsTestLoginModalOpen(true)}
                  minW="auto"
                  h="auto"
                  bg="transparent"
                  p="0"
                  fontSize="sm"
                  fontWeight="600"
                  color="orange.600"
                  _hover={{ bg: 'transparent', textDecoration: 'underline' }}
                >
                  로그인
                </Button>
              </HStack>
            )}
          </Box>
        </Flex>
      </Box>

      {isLoggedIn && isNotificationOpen ? (
        <Portal>
          <Box
            ref={notificationLayerRef}
            position="fixed"
            top={`${notificationLayerPosition.top}px`}
            right={`${notificationLayerPosition.right}px`}
            zIndex="1500"
            w={{ base: 'calc(100vw - 32px)', sm: '360px' }}
            maxW="360px"
            overflow="hidden"
            borderRadius="22px"
            bg="#FFFFFF"
            boxShadow="0 22px 56px rgba(15, 23, 42, 0.18)"
            borderWidth="1px"
            borderColor="#F3F4F6"
          >
            <Flex align="center" justify="space-between" px="20px" py="18px" borderBottomWidth="1px" borderColor="#F3F4F6">
              <Text fontSize="18px" fontWeight="800" color="#111827">
                알림
              </Text>
              {unreadNotificationCount > 0 ? (
                <Button
                  type="button"
                  h="auto"
                  minW="auto"
                  bg="transparent"
                  p="0"
                  fontSize="12px"
                  fontWeight="800"
                  color="#FF6900"
                  _hover={{ bg: 'transparent', textDecoration: 'underline' }}
                  onClick={handleMarkAllNotificationsAsRead}
                >
                  모두 읽음
                </Button>
              ) : (
                <Text fontSize="12px" fontWeight="700" color="#9CA3AF">
                  새 알림 없음
                </Text>
              )}
            </Flex>

            <Flex direction="column" maxH="360px" overflowY="auto">
              {isNotificationLoading ? (
                <Flex align="center" justify="center" minH="160px" px="20px" py="32px">
                  <Text fontSize="14px" fontWeight="600" color="#9CA3AF">
                    알림을 불러오는 중입니다.
                  </Text>
                </Flex>
              ) : notifications.length === 0 ? (
                <Flex align="center" justify="center" minH="160px" px="20px" py="32px">
                  <Text fontSize="14px" fontWeight="600" color="#9CA3AF">
                    아직 도착한 알림이 없습니다.
                  </Text>
                </Flex>
              ) : (
                notifications.map((notification) => {
                  const NotificationIcon = getNotificationIcon(notification.type);
                  const isUnread = !notification.readAt;

                  return (
                    <Button
                      key={notification.id}
                      type="button"
                      w="full"
                      h="auto"
                      justifyContent="flex-start"
                      gap="12px"
                      rounded="0"
                      bg={isUnread ? '#FFF7ED' : '#FFFFFF'}
                      px="20px"
                      py="14px"
                      textAlign="left"
                      _hover={{ bg: '#FFF4E8' }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <Flex
                        h="34px"
                        w="34px"
                        flexShrink={0}
                        align="center"
                        justify="center"
                        rounded="full"
                        bg={isUnread ? '#FF6900' : '#F3F4F6'}
                        color={isUnread ? '#FFFFFF' : '#9CA3AF'}
                      >
                        <NotificationIcon size={16} />
                      </Flex>
                      <Box minW="0" flex="1">
                        <Flex align="center" justify="space-between" gap="10px">
                          <Text fontSize="14px" fontWeight="800" color="#111827" lineClamp={1}>
                            {notification.title}
                          </Text>
                          <Text flexShrink={0} fontSize="12px" fontWeight="600" color="#9CA3AF">
                            {getRelativeTimeLabel(notification.createdAt)}
                          </Text>
                        </Flex>
                        <Text mt="5px" fontSize="13px" fontWeight="500" color="#6B7280" lineClamp={1}>
                          {notification.summary}
                        </Text>
                        <Flex align="center" justify="space-between" gap="10px" mt="10px">
                          <Text fontSize="12px" fontWeight="700" color="#9CA3AF">
                            {notification.actor.name} · {notification.actor.profileType === 'anonymous' ? '익명' : notification.actor.profileType === 'system' ? '시스템' : '실명'}
                          </Text>
                          <Flex align="center" gap="8px">
                            {isUnread ? (
                              <Box
                                as="span"
                                display="inline-flex"
                                alignItems="center"
                                gap="4px"
                                fontSize="12px"
                                fontWeight="800"
                                color="#FF6900"
                              >
                                <CheckIcon size={12} />
                                읽음 표시
                              </Box>
                            ) : null}
                            <Box as="span" color="#9CA3AF">
                              <MoreIcon size={14} />
                            </Box>
                          </Flex>
                        </Flex>
                      </Box>
                    </Button>
                  );
                })
              )}
                    </Flex>
          </Box>
        </Portal>
      ) : null}

      {isTestLoginModalOpen ? (
        <Portal>
          <Flex
            position="fixed"
            inset="0"
            zIndex="1500"
            align="center"
            justify="center"
            bg="rgba(17, 24, 39, 0.42)"
            px="4"
            onMouseDown={() => setIsTestLoginModalOpen(false)}
          >
            <Box
              w="min(380px, 100%)"
              maxH="min(520px, calc(100vh - 48px))"
              overflow="hidden"
              borderRadius="22px"
              bg="#FFFFFF"
              p="20px"
              boxShadow="0 24px 60px rgba(15, 23, 42, 0.24)"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Flex align="flex-start" justify="space-between" gap="4" mb="16px">
                <Box>
                  <Text fontSize="18px" fontWeight="800" color="#111827">
                    테스트 계정으로 로그인
                  </Text>
                  <Text mt="6px" fontSize="13px" color="#6B7280">
                    임시 바이패스 모달입니다. 선택한 계정으로 글 작성과 댓글 작성을 테스트할 수 있습니다.
                  </Text>
                </Box>
                <Button
                  type="button"
                  minW="32px"
                  h="32px"
                  rounded="full"
                  bg="transparent"
                  p="0"
                  color="#9CA3AF"
                  _hover={{ bg: '#F3F4F6', color: '#4B5563' }}
                  onClick={() => setIsTestLoginModalOpen(false)}
                  aria-label="로그인 모달 닫기"
                >
                  ×
                </Button>
              </Flex>

              <Flex
                direction="column"
                gap="8px"
                maxH="340px"
                overflowY="auto"
                pr="4px"
                css={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#D1D5DB transparent',
                }}
              >
                {TEST_LOGIN_USERS.map((user) => (
                  <Button
                    key={user.accountId}
                    type="button"
                    justifyContent="flex-start"
                    h="auto"
                    w="full"
                    gap="12px"
                    rounded="16px"
                    borderWidth="1px"
                    borderColor={currentUser.accountId === user.accountId ? '#FFB366' : '#E5E7EB'}
                    bg={currentUser.accountId === user.accountId ? '#FFF7ED' : '#FFFFFF'}
                    px="14px"
                    py="10px"
                    textAlign="left"
                    _hover={{ bg: '#FFF7ED', borderColor: '#FFB366' }}
                    onClick={() => {
                      void setCurrentUserByAccountId(user.accountId);
                      setIsTestLoginModalOpen(false);
                    }}
                  >
                    <ChakraImage
                      src={user.avatar}
                      alt={`${user.name} 프로필`}
                      boxSize="40px"
                      rounded="full"
                      objectFit="cover"
                      flexShrink={0}
                    />
                    <Box minW="0" flex="1">
                      <Flex align="center" gap="8px">
                        <Text fontSize="14px" fontWeight="800" color="#111827" truncate>
                          {user.name}
                        </Text>
                        {currentUser.accountId === user.accountId ? (
                          <Box px="7px" py="2px" rounded="full" bg="#FF6900">
                            <Text fontSize="10px" fontWeight="800" color="#FFFFFF">
                              선택됨
                            </Text>
                          </Box>
                        ) : null}
                      </Flex>
                      <Text mt="3px" fontSize="12px" fontWeight="500" color="#9CA3AF" truncate>
                        {[user.company, user.position].filter(Boolean).join(' · ') || '프로필 정보 없음'}
                      </Text>
                    </Box>
                  </Button>
                ))}
              </Flex>
            </Box>
          </Flex>
        </Portal>
      ) : null}
    </Fragment>
  );
}

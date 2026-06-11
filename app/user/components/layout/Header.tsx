'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fragment, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import { Box, Button, Flex, HStack, Icon, Image as ChakraImage, Link as ChakraLink, Portal, Text } from '@chakra-ui/react';
import { CommunityProfileCard } from '@/app/user/components/community/CommunityProfileCard';
import { TEST_LOGIN_USERS, useAuth } from '@/app/user/components/providers/AuthProvider';
import { useMobileNav } from '@/app/user/components/providers/MobileNavProvider';
import { useProfileMenu } from '@/app/user/components/providers/ProfileMenuProvider';
import { getCommunityIdentityLabel } from '@/app/user/lib/community-identity';

export default function Header() {
  const [profileModeToast, setProfileModeToast] = useState<string | null>(null);
  const [isTestLoginModalOpen, setIsTestLoginModalOpen] = useState(false);
  const pathname = usePathname();
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

  const isCommunityRoute = pathname.startsWith('/user/community');

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

  useEffect(() => {
    if (!profileModeToast) return;

    const toastTimer = window.setTimeout(() => {
      setProfileModeToast(null);
    }, 1800);

    return () => {
      window.clearTimeout(toastTimer);
    };
  }, [profileModeToast]);

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
                  type="button"
                  position="relative"
                  minW="9"
                  h="9"
                  rounded="full"
                  bg="transparent"
                  p="0"
                  color="gray.600"
                  _hover={{ bg: 'gray.100', color: 'gray.800' }}
                  aria-label="알림"
                  title="알림 기능 예정"
                >
                  <Icon as={Bell} boxSize="5" />
                  <Box position="absolute" top="2" right="2" h="2" w="2" rounded="full" bg="orange.500" />
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

'use client';

import { Box, Button, Flex, Grid, Link as ChakraLink, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut, MessageSquareText, School, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { useAuth } from '@/app/user/components/providers/AuthProvider';

const sidebarItems = [
  { label: '커뮤니티', href: '/user/mypage/community', icon: MessageSquareText },
  {
    label: '캠퍼스',
    href: '/user/mypage/campus',
    icon: School,
    children: ['신청 내역', '팀 빌딩', '지원/팀 관리', '활동 게시판'],
  },
  {
    label: '설정',
    href: '/user/mypage/settings',
    icon: Settings,
    children: [
      { label: '프로필', href: '/user/mypage/settings/profile' },
      { label: '프로덕트', href: '/user/mypage/settings/product' },
      { label: '알림', href: '/user/mypage/settings/notifications' },
    ],
  },
  { label: '로그아웃', href: '/user/community', icon: LogOut, isLogout: true },
];

const settingsTabs = [
  { label: '프로필', href: '/user/mypage/settings/profile' },
  { label: '프로덕트', href: '/user/mypage/settings/product' },
  { label: '알림', href: '/user/mypage/settings/notifications' },
];

type SidebarItem = (typeof sidebarItems)[number];

function SidebarLink({
  item,
  isActive,
}: {
  item: SidebarItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
      <Link href={item.href}>
        <Flex
          align="center"
          gap="12px"
          px="16px"
          py="12px"
          borderRadius="14px"
          bg={isActive ? '#FFF7ED' : 'transparent'}
          color={isActive ? '#F97316' : '#4B5563'}
          fontSize="14px"
          fontWeight="600"
          transition="background-color 0.2s ease, color 0.2s ease"
          _hover={{ bg: '#F9FAFB', color: '#111827' }}
        >
          <Icon size={16} />
          <Text as="span" flex="1">
            {item.label}
          </Text>
        </Flex>
      </Link>
    </ChakraLink>
  );
}

export default function MyPageLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();
  const [isCampusOpen, setIsCampusOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isSettingsRoute = pathname.startsWith('/user/mypage/settings');
  const isCampusRoute = pathname.startsWith('/user/mypage/campus');

  return (
    <Box minH="100vh" bg="#F3F4F6">
      <Grid maxW="1400px" mx="auto" templateColumns={{ base: '1fr', lg: '220px minmax(0, 1fr)' }}>
        <Box
          display={{ base: 'none', lg: 'block' }}
          minH="100vh"
          bg="#FFFFFF"
          borderRight="1px solid"
          borderColor="#E5E7EB"
        >
          <Box px="24px" py="20px" borderBottom="1px solid" borderColor="#E5E7EB">
            <Text fontSize="18px" fontWeight="700" color="#111827">
              마이페이지
            </Text>
          </Box>

          <Box px="16px" py="20px">
            <Flex as="ul" direction="column" gap="8px">
              {sidebarItems.map((item) => {
                const isExpandableItem = item.label === '캠퍼스' || item.label === '설정';
                const isCampusItem = item.label === '캠퍼스';
                const isSettingsItem = item.label === '설정';
                const isLogoutItem = item.isLogout;
                const isActive = !isExpandableItem && !isLogoutItem && pathname === item.href;
                const isExpanded =
                  (isCampusItem && (isCampusOpen || isCampusRoute)) ||
                  (isSettingsItem && (isSettingsOpen || isSettingsRoute));
                const Icon = item.icon;

                return (
                  <Box as="li" key={item.label}>
                    {isExpandableItem ? (
                      <Button
                        type="button"
                        unstyled
                        display="flex"
                        w="100%"
                        alignItems="center"
                        gap="12px"
                        px="16px"
                        py="12px"
                        borderRadius="14px"
                        color="#4B5563"
                        fontSize="14px"
                        fontWeight="600"
                        textAlign="left"
                        transition="background-color 0.2s ease, color 0.2s ease"
                        _hover={{ bg: '#F9FAFB', color: '#111827' }}
                        onClick={() => {
                          if (isCampusItem) setIsCampusOpen((prev) => !prev);
                          if (isSettingsItem) setIsSettingsOpen((prev) => !prev);
                        }}
                      >
                        <Icon size={16} />
                        <Text as="span" flex="1">
                          {item.label}
                        </Text>
                        <Box
                          transition="transform 0.2s ease"
                          transform={isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                        >
                          <ChevronDown size={16} />
                        </Box>
                      </Button>
                    ) : isLogoutItem ? (
                      <Button
                        type="button"
                        unstyled
                        display="flex"
                        w="100%"
                        alignItems="center"
                        gap="12px"
                        px="16px"
                        py="12px"
                        borderRadius="14px"
                        color="#4B5563"
                        fontSize="14px"
                        fontWeight="600"
                        textAlign="left"
                        transition="background-color 0.2s ease, color 0.2s ease"
                        _hover={{ bg: '#F9FAFB', color: '#111827' }}
                        onClick={() => {
                          setIsLoggedIn(false);
                          router.push('/user/community');
                        }}
                      >
                        <Icon size={16} />
                        <Text as="span" flex="1">
                          {item.label}
                        </Text>
                      </Button>
                    ) : (
                      <SidebarLink item={item} isActive={isActive} />
                    )}

                    {isExpandableItem && isExpanded ? (
                      <Flex as="ul" direction="column" gap="4px" mt="8px" pl="44px">
                        {item.children?.map((child) => {
                          if (typeof child === 'string') {
                            return (
                              <Box as="li" key={child}>
                                <Button
                                  type="button"
                                  unstyled
                                  display="block"
                                  w="100%"
                                  px="12px"
                                  py="10px"
                                  borderRadius="10px"
                                  textAlign="left"
                                  fontSize="14px"
                                  color="#6B7280"
                                  _hover={{ bg: '#F9FAFB', color: '#111827' }}
                                >
                                  {child}
                                </Button>
                              </Box>
                            );
                          }

                          const isChildActive = pathname === child.href;

                          return (
                            <Box as="li" key={child.href}>
                              <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
                                <Link href={child.href}>
                                  <Box
                                    px="12px"
                                    py="10px"
                                    borderRadius="10px"
                                    bg={isChildActive ? '#FFF7ED' : 'transparent'}
                                    color={isChildActive ? '#F97316' : '#6B7280'}
                                    fontSize="14px"
                                    transition="background-color 0.2s ease, color 0.2s ease"
                                    _hover={{ bg: '#F9FAFB', color: '#111827' }}
                                  >
                                    {child.label}
                                  </Box>
                                </Link>
                              </ChakraLink>
                            </Box>
                          );
                        })}
                      </Flex>
                    ) : null}
                  </Box>
                );
              })}
            </Flex>
          </Box>
        </Box>

        <Box
          minW="0"
          px={{ base: '16px', sm: '24px', lg: '40px' }}
          py={isSettingsRoute ? { base: '0', lg: '32px' } : { base: '24px', lg: '32px' }}
          borderLeft={{ base: 'none', lg: '1px solid' }}
          borderColor="#E5E7EB"
          bg="#F3F4F6"
        >
          {isSettingsRoute ? (
            <Box
              display={{ base: 'block', lg: 'none' }}
              mx={{ base: '-16px', sm: '-24px' }}
              px={{ base: '16px', sm: '24px' }}
              bg="#FFFFFF"
              borderBottom="1px solid"
              borderColor="#E5E7EB"
            >
              <Grid templateColumns="repeat(3, minmax(0, 1fr))">
                {settingsTabs.map((tab) => {
                  const isActive = pathname === tab.href;

                  return (
                    <ChakraLink key={tab.href} asChild _hover={{ textDecoration: 'none' }}>
                      <Link href={tab.href}>
                        <Flex
                          position="relative"
                          justify="center"
                          px="4px"
                          py="16px"
                          fontSize="14px"
                          fontWeight="700"
                          color={isActive ? '#F97316' : '#6B7280'}
                          transition="color 0.2s ease"
                          _hover={{ color: '#111827' }}
                        >
                          {tab.label}
                          {isActive ? (
                            <Box position="absolute" insetX="0" bottom="0" h="2px" bg="#F97316" />
                          ) : null}
                        </Flex>
                      </Link>
                    </ChakraLink>
                  );
                })}
              </Grid>
            </Box>
          ) : null}

          {isSettingsRoute ? <Box h={{ base: '24px', lg: '0' }} /> : null}
          {children}
        </Box>
      </Grid>
    </Box>
  );
}

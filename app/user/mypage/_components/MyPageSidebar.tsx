'use client';

import { Box, Button, Flex, Link as ChakraLink, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import type { ElementType } from 'react';

import CampusIcon from '@/app/user/components/icons/CampusIcon';
import CommunityIcon from '@/app/user/components/icons/CommunityIcon';
import LogoutIcon from '@/app/user/components/icons/LogoutIcon';
import SettingIcon from '@/app/user/components/icons/SettingIcon';
import { useAuth } from '@/app/user/components/providers/AuthProvider';

type SidebarChildLink = {
  label: string;
  href: string;
};

type SidebarChildDisabled = {
  label: string;
  disabled: true;
};

type SidebarLinkItem = {
  label: string;
  href: string;
  icon: ElementType;
};

type SidebarSectionItem = {
  label: string;
  href: string;
  icon: ElementType;
  children: Array<SidebarChildLink | SidebarChildDisabled>;
};

const sidebarItems: Array<SidebarLinkItem | SidebarSectionItem> = [
  { label: '커뮤니티', href: '/user/mypage/community', icon: CommunityIcon },
  {
    label: '캠퍼스',
    href: '/user/mypage/campus',
    icon: CampusIcon,
    children: [
      { label: '신청 내역', disabled: true },
      { label: '팀 빌딩', disabled: true },
      { label: '지원/팀 관리', disabled: true },
      { label: '활동 게시판', disabled: true },
    ],
  },
  {
    label: '설정',
    href: '/user/mypage/settings',
    icon: SettingIcon,
    children: [
      { label: '프로필', href: '/user/mypage/settings/profile' },
      { label: '프로덕트', href: '/user/mypage/settings/product' },
      { label: '알림 및 계정', href: '/user/mypage/settings/notifications' },
    ],
  },
];

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function hasChildren(item: SidebarLinkItem | SidebarSectionItem): item is SidebarSectionItem {
  return 'children' in item;
}

function isDisabledChild(child: SidebarChildLink | SidebarChildDisabled): child is SidebarChildDisabled {
  return 'disabled' in child && child.disabled;
}

function subscribeToHydration() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function SidebarLink({
  item,
  isActive,
}: {
  item: SidebarLinkItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
      <Link href={item.href} style={{ display: 'block', width: '100%', outline: 'none' }}>
        <Flex
          position="relative"
          align="center"
          gap="10px"
          h="40px"
          px="16px"
          borderRadius="8px"
          bg={isActive ? '#FFF4E8' : 'transparent'}
          color={isActive ? '#F59E42' : '#374151'}
          fontSize="16px"
          fontWeight="600"
          transition="background-color 0.2s ease, color 0.2s ease"
          _hover={{ bg: isActive ? '#FFF4E8' : '#FFFFFF', color: isActive ? '#F59E42' : '#374151' }}
          aria-current={isActive ? 'page' : undefined}
          _focus={{
            outline: 'none',
            boxShadow: 'none',
            bg: isActive ? '#FFF4E8' : 'transparent',
            color: isActive ? '#F59E42' : '#374151',
          }}
          _focusVisible={{
            outline: 'none',
            boxShadow: 'none',
            bg: isActive ? '#FFF4E8' : 'transparent',
            color: isActive ? '#F59E42' : '#374151',
          }}
        >
          {isActive ? (
            <Box
              position="absolute"
              left="0"
              top="50%"
              h="20px"
              w="3px"
              transform="translateY(-50%)"
              borderRightRadius="9999px"
              bg="#F59E42"
            />
          ) : null}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="16px"
            h="16px"
            color={isActive ? '#F59E42' : '#6B7280'}
          >
            <Icon size={16} strokeWidth={1.9} />
          </Box>
          <Text as="span" flex="1">
            {item.label}
          </Text>
        </Flex>
      </Link>
    </ChakraLink>
  );
}

export default function MyPageSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();
  const [manuallyOpenSections, setManuallyOpenSections] = useState<Record<string, boolean>>({});
  const isMounted = useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerSnapshot);
  const activePathname = isMounted ? pathname : '';

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/user/community');
  };

  return (
    <Box
      as="aside"
      display={{ base: 'none', lg: 'block' }}
      position="sticky"
      top="0"
      alignSelf="start"
      w="260px"
      minH="calc(100vh - 92px)"
      bg="transparent"
    >
      <Box
        display="flex"
        flexDirection="column"
        minH="calc(100vh - 92px)"
        bg="transparent"
      >
        <Flex minH="84px" align="center" px="24px" py="20px">
          <Text fontSize="20px" fontWeight="800" color="#4B5563" letterSpacing="-0.02em">
            마이페이지
          </Text>
        </Flex>

        <Box as="nav" flex="1" overflowY="auto" px="20px" pb="24px" pt="6px">
          <VStack gap="10px" align="stretch">
            {sidebarItems.map((item) => {
              if (!hasChildren(item)) {
                return <SidebarLink key={item.href} item={item} isActive={isRouteActive(activePathname, item.href)} />;
              }

              const Icon = item.icon;
              const hasActiveChild = item.children.some(
                (child) => !isDisabledChild(child) && isRouteActive(activePathname, child.href),
              );
              const isDirectActive = activePathname === item.href;
              const isActive = isDirectActive && !hasActiveChild;
              const isOpen = hasActiveChild || isDirectActive || Boolean(manuallyOpenSections[item.label]);

              return (
                <VStack key={item.label} gap="6px" align="stretch">
                  <Button
                    type="button"
                    variant="ghost"
                    justifyContent="space-between"
                    position="relative"
                    h="40px"
                    px="16px"
                    borderRadius="8px"
                    bg={isActive ? '#FFF4E8' : 'transparent'}
                    color={isActive ? '#F59E42' : '#374151'}
                    fontSize="16px"
                    fontWeight="600"
                    minW="100%"
                    transition="background-color 0.2s ease, color 0.2s ease"
                    _hover={{ bg: isActive ? '#FFF4E8' : '#FFFFFF', color: isActive ? '#F59E42' : '#374151' }}
                    _active={{ bg: isActive ? '#FFF4E8' : 'transparent', color: isActive ? '#F59E42' : '#374151' }}
                    _focus={{
                      outline: 'none',
                      boxShadow: 'none',
                      bg: isActive ? '#FFF4E8' : 'transparent',
                      color: isActive ? '#F59E42' : '#374151',
                    }}
                    _focusVisible={{
                      outline: 'none',
                      boxShadow: 'none',
                      bg: isActive ? '#FFF4E8' : 'transparent',
                      color: isActive ? '#F59E42' : '#374151',
                    }}
                    aria-expanded={isOpen}
                    aria-current={isDirectActive ? 'page' : undefined}
                    onClick={() => {
                      setManuallyOpenSections((prev) => ({
                        ...prev,
                        [item.label]: !isOpen,
                      }));
                    }}
                  >
                    {isActive ? (
                      <Box
                        position="absolute"
                        left="0"
                        top="50%"
                        h="20px"
                        w="3px"
                        transform="translateY(-50%)"
                        borderRightRadius="9999px"
                        bg="#F59E42"
                      />
                    ) : null}
                    <Flex align="center" gap="10px">
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        w="16px"
                        h="16px"
                        color={isActive ? '#F59E42' : '#6B7280'}
                      >
                        <Icon size={16} strokeWidth={1.9} />
                      </Box>
                      <Text fontSize="16px" fontWeight="600" lineHeight="1">
                        {item.label}
                      </Text>
                    </Flex>
                    <Box
                      color={isActive ? '#F59E42' : '#B6BDC7'}
                      transition="transform 0.2s ease"
                      transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                    >
                      <ChevronDown size={14} />
                    </Box>
                  </Button>

                  {isOpen ? (
                    <VStack as="ul" gap="0" align="stretch" pb="8px" pl="42px" pt="2px">
                      {item.children.map((child) => {
                        if (isDisabledChild(child)) {
                          return (
                            <Box
                              as="li"
                              key={child.label}
                              display="flex"
                              alignItems="center"
                              minH="44px"
                              px="8px"
                              borderRadius="6px"
                              color="#B6BDC7"
                              fontSize="16px"
                              fontWeight="500"
                              cursor="not-allowed"
                              aria-disabled="true"
                            >
                              <Text as="span">{child.label}</Text>
                            </Box>
                          );
                        }

                        const isChildActive = isRouteActive(activePathname, child.href);

                        return (
                          <Box as="li" key={child.href}>
                            <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
                              <Link href={child.href} style={{ display: 'block', width: '100%', outline: 'none' }}>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  minH="44px"
                                  px="8px"
                                  borderRadius="6px"
                                  bg={isChildActive ? '#FFF8F1' : 'transparent'}
                                  color={isChildActive ? '#F59E42' : '#6B7280'}
                                  fontSize="16px"
                                  fontWeight="500"
                                  transition="background-color 0.2s ease, color 0.2s ease"
                                  _hover={{
                                    bg: isChildActive ? '#FFF8F1' : '#FFFFFF',
                                    color: isChildActive ? '#F59E42' : '#6B7280',
                                  }}
                                  aria-current={isChildActive ? 'page' : undefined}
                                  _focus={{
                                    outline: 'none',
                                    boxShadow: 'none',
                                    bg: isChildActive ? '#FFF8F1' : 'transparent',
                                    color: isChildActive ? '#F59E42' : '#6B7280',
                                  }}
                                  _focusVisible={{
                                    outline: 'none',
                                    boxShadow: 'none',
                                    bg: isChildActive ? '#FFF8F1' : 'transparent',
                                    color: isChildActive ? '#F59E42' : '#6B7280',
                                  }}
                                >
                                  {child.label}
                                </Box>
                              </Link>
                            </ChakraLink>
                          </Box>
                        );
                      })}
                    </VStack>
                  ) : null}
                </VStack>
              );
            })}
          </VStack>

          <Box mt="10px">
            <Button
              type="button"
              variant="ghost"
              justifyContent="flex-start"
              h="40px"
              w="100%"
              gap="10px"
              px="16px"
              borderRadius="8px"
              color="#374151"
              fontSize="16px"
              fontWeight="600"
              transition="background-color 0.2s ease, color 0.2s ease"
              _hover={{ bg: '#FFFFFF', color: '#374151' }}
              _active={{ bg: 'transparent', color: '#374151' }}
              _focus={{ outline: 'none', boxShadow: 'none', bg: 'transparent', color: '#374151' }}
              _focusVisible={{ outline: 'none', boxShadow: 'none', bg: 'transparent', color: '#374151' }}
              onClick={handleLogout}
            >
              <Box display="flex" alignItems="center" justifyContent="center" w="16px" h="16px" color="#6B7280">
                <LogoutIcon size={16} />
              </Box>
              <Text fontSize="16px" fontWeight="600" lineHeight="1">
                로그아웃
              </Text>
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

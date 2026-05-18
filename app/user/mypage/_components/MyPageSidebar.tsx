'use client';

import { Box, Button, Flex, Link as ChakraLink, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut, MessageSquareText, School, Settings } from 'lucide-react';
import { useState } from 'react';
import type { ElementType } from 'react';

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
  { label: '커뮤니티', href: '/user/mypage/community', icon: MessageSquareText },
  {
    label: '캠퍼스',
    href: '/user/mypage/campus',
    icon: School,
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
    icon: Settings,
    children: [
      { label: '프로필', href: '/user/mypage/settings/profile' },
      { label: '프로덕트', href: '/user/mypage/settings/product' },
      { label: '알림', href: '/user/mypage/settings/notifications' },
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
          fontWeight="700"
          transition="background-color 0.2s ease, color 0.2s ease"
          _hover={{ bg: isActive ? '#FFF7ED' : '#F9FAFB', color: isActive ? '#F97316' : '#111827' }}
          aria-current={isActive ? 'page' : undefined}
        >
          <Icon size={17} />
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/user/community');
  };

  return (
    <Box display={{ base: 'none', lg: 'block' }} position="sticky" top="24px">
      <Box
        borderRadius="20px"
        bg="#FFFFFF"
        boxShadow="0 12px 30px rgba(223, 223, 223, 0.9)"
        overflow="hidden"
      >
        <Box px="24px" py="22px" borderBottom="1px solid" borderColor="#F3F4F6">
          <Text fontSize="18px" fontWeight="800" color="#111827">
            마이페이지
          </Text>
          <Text mt="4px" fontSize="12px" color="#9CA3AF">
            내 활동과 설정을 관리합니다.
          </Text>
        </Box>

        <Flex as="nav" direction="column" gap="6px" px="14px" py="16px">
          {sidebarItems.map((item) => {
            if (!hasChildren(item)) {
              return <SidebarLink key={item.href} item={item} isActive={isRouteActive(pathname, item.href)} />;
            }

            const Icon = item.icon;
            const isActive = isRouteActive(pathname, item.href);
            const isOpen = isActive || Boolean(manuallyOpenSections[item.label]);

            return (
              <Box key={item.label}>
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
                  bg={isActive ? '#FFF7ED' : 'transparent'}
                  color={isActive ? '#F97316' : '#4B5563'}
                  fontSize="14px"
                  fontWeight="700"
                  textAlign="left"
                  transition="background-color 0.2s ease, color 0.2s ease"
                  _hover={{ bg: isActive ? '#FFF7ED' : '#F9FAFB', color: isActive ? '#F97316' : '#111827' }}
                  aria-expanded={isOpen}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => {
                    setManuallyOpenSections((prev) => ({
                      ...prev,
                      [item.label]: !isOpen,
                    }));
                  }}
                >
                  <Icon size={17} />
                  <Text as="span" flex="1">
                    {item.label}
                  </Text>
                  <Box transition="transform 0.2s ease" transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}>
                    <ChevronDown size={16} />
                  </Box>
                </Button>

                {isOpen ? (
                  <Flex as="ul" direction="column" gap="2px" mt="6px" pl="45px" pr="4px">
                    {item.children.map((child) => {
                      if (isDisabledChild(child)) {
                        return (
                          <Box
                            as="li"
                            key={child.label}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            gap="8px"
                            px="12px"
                            py="9px"
                            borderRadius="10px"
                            color="#C4C7CD"
                            fontSize="13px"
                            fontWeight="600"
                            cursor="not-allowed"
                            aria-disabled="true"
                          >
                            <Text as="span">{child.label}</Text>
                            <Text
                              as="span"
                              px="6px"
                              py="2px"
                              borderRadius="999px"
                              bg="#F3F4F6"
                              color="#A1A7B0"
                              fontSize="10px"
                              fontWeight="700"
                            >
                              준비중
                            </Text>
                          </Box>
                        );
                      }

                      const isChildActive = isRouteActive(pathname, child.href);

                      return (
                        <Box as="li" key={child.href}>
                          <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
                            <Link href={child.href}>
                              <Box
                                px="12px"
                                py="9px"
                                borderRadius="10px"
                                bg={isChildActive ? '#FFF7ED' : 'transparent'}
                                color={isChildActive ? '#F97316' : '#6B7280'}
                                fontSize="13px"
                                fontWeight="600"
                                transition="background-color 0.2s ease, color 0.2s ease"
                                _hover={{
                                  bg: isChildActive ? '#FFF7ED' : '#F9FAFB',
                                  color: isChildActive ? '#F97316' : '#111827',
                                }}
                                aria-current={isChildActive ? 'page' : undefined}
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

        <Box px="14px" pb="16px" pt="8px" borderTop="1px solid" borderColor="#F3F4F6">
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
            color="#6B7280"
            fontSize="14px"
            fontWeight="700"
            textAlign="left"
            transition="background-color 0.2s ease, color 0.2s ease"
            _hover={{ bg: '#F9FAFB', color: '#111827' }}
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <Text as="span" flex="1">
              로그아웃
            </Text>
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

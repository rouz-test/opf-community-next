'use client';

import { Box, Flex, Grid, Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import MyPageSidebar from '@/app/user/mypage/_components/MyPageSidebar';

const settingsTabs = [
  { label: '프로필', href: '/user/mypage/settings/profile' },
  { label: '프로덕트', href: '/user/mypage/settings/product' },
  { label: '알림', href: '/user/mypage/settings/notifications' },
];

export default function MyPageLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSettingsRoute = pathname.startsWith('/user/mypage/settings');

  return (
    <Box minH="100vh" bg="#F3F4F6">
      <Grid
        maxW="1400px"
        mx="auto"
        gap={{ base: '0', lg: '24px' }}
        px={{ base: '0', lg: '24px' }}
        py={{ base: '0', lg: '24px' }}
        templateColumns={{ base: '1fr', lg: '244px minmax(0, 1fr)' }}
      >
        <MyPageSidebar />

        <Box
          minW="0"
          px={{ base: '16px', sm: '24px', lg: '16px' }}
          py={isSettingsRoute ? { base: '0', lg: '8px' } : { base: '24px', lg: '8px' }}
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

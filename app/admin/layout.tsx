'use client';

import type { ReactNode } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import AdminChakraProvider from './components/admin-chakra-provider';
import AdminSidebar from './components/sidebar/admin-sidebar';
import AdminBreadcrumb from './components/breadcrumb/admin-breadcrumb';
import {
  formatBreadcrumbLabel,
  getAdminBreadcrumb,
} from './components/breadcrumb/admin-breadcrumb-utils';
import Toaster from './components/ui/toaster';

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const breadcrumbItems = getAdminBreadcrumb(pathname).map(formatBreadcrumbLabel);

  return (
    <AdminChakraProvider>
      <Toaster />
      <Box minH="100vh" bg="white" color="#111827">
        <Flex minH="100vh">
          <AdminSidebar />

          <Flex minW="0" flex="1" direction="column">
            <Box
              as="header"
              position="sticky"
              top="0"
              zIndex="20"
              borderBottom="1px solid"
              borderColor="#E5E7EB"
              bg="rgba(255,255,255,0.95)"
              backdropFilter="blur(8px)"
            >
              <Flex h="72px" align="center" justify="space-between" px={{ base: '24px', lg: '32px' }}>
                <Box />

                <Flex
                  align="center"
                  gap="12px"
                  border="1px solid"
                  borderColor="#E5E7EB"
                  bg="white"
                  px="12px"
                  py="8px"
                  borderRadius="9999px"
                  boxShadow="sm"
                >
                  <Flex
                    h="40px"
                    w="40px"
                    align="center"
                    justify="center"
                    borderRadius="full"
                    bg="#FFF7ED"
                    color="#F97316"
                    fontSize="14px"
                    fontWeight="600"
                  >
                    관
                  </Flex>
                  <Box minW="0">
                    <Text truncate fontSize="14px" fontWeight="600" color="#111827">
                      관리자
                    </Text>
                    <Text truncate fontSize="12px" color="#6B7280">
                      admin@orangeplanet.or.kr
                    </Text>
                  </Box>
                </Flex>
              </Flex>
            </Box>

            <Box as="main" flex="1" px={{ base: '24px', lg: '32px' }} py={{ base: '24px', lg: '32px' }}>
              <Box w="100%" maxW="1200px">
                <Flex direction="column" gap="16px">
                  <AdminBreadcrumb items={breadcrumbItems} />
                  {children}
                </Flex>
              </Box>
            </Box>
          </Flex>
        </Flex>
      </Box>
    </AdminChakraProvider>
  );
}

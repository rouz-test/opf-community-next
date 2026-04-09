'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';
import { adminSidebarSections } from './admin-sidebar-data';
import SidebarSectionIcon from './sidebar-section-icon';

export default function AdminSidebar() {
  const pathname = usePathname();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      adminSidebarSections.map((section) => [
        section.title,
        section.items.some(
          (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
        ),
      ]),
    ),
  );

  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      adminSidebarSections.forEach((section) => {
        const hasActiveItem = section.items.some(
          (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
        );

        if (hasActiveItem) {
          next[section.title] = true;
        }
      });
      return next;
    });
  }, [pathname]);

  return (
    <Box
      as="aside"
      width="220px"
      borderRight="1px solid"
      borderColor="#EEF1F4"
      bg="#FCFCFD"
      display={{ base: 'none', xl: 'block' }}
    >
      <Flex direction="column" h="full" bg="#FCFCFD">
        <Flex minH="84px" align="center" borderBottom="1px solid" borderColor="#F3F4F6" px="24px" py="20px">
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/admin-logo.png" alt="OrangePlanet Admin" width={134} height={27} priority />
          </Link>
        </Flex>

        <Box as="nav" flex="1" overflowY="auto" px="12px" pb="24px" pt="16px">
          <VStack gap="10px" align="stretch">
            {adminSidebarSections.map((section) => {
              const hasActiveItem = section.items.some(
                (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
              );

              return (
                <VStack key={section.title} gap="6px" align="stretch">
                  <Button
                    type="button"
                    onClick={() =>
                      setOpenSections((prev) => ({ ...prev, [section.title]: !prev[section.title] }))
                    }
                    variant="ghost"
                    justifyContent="space-between"
                    position="relative"
                    h="40px"
                    px="16px"
                    borderRadius="8px"
                    bg={hasActiveItem ? '#FFF4E8' : 'transparent'}
                    color={hasActiveItem ? '#F59E42' : '#374151'}
                    _hover={{ bg: hasActiveItem ? '#FFF4E8' : 'white', color: '#111827' }}
                    _active={{ bg: hasActiveItem ? '#FFF4E8' : '#F9FAFB' }}
                    fontSize="13px"
                    fontWeight="600"
                    minW="100%"
                  >
                    {hasActiveItem ? (
                      <Box
                        position="absolute"
                        left="0"
                        top="50%"
                        transform="translateY(-50%)"
                        h="20px"
                        w="3px"
                        borderRightRadius="9999px"
                        bg="#F59E42"
                      />
                    ) : null}

                    <Flex align="center" gap="10px">
                      <Box color={hasActiveItem ? '#F59E42' : '#6B7280'} display="flex" alignItems="center" justifyContent="center" w="16px" h="16px">
                        <SidebarSectionIcon title={section.title} />
                      </Box>
                      <Text fontSize="13px" fontWeight="600" lineHeight="1">{section.title}</Text>
                    </Flex>

                    <Text
                      fontSize="10px"
                      color={hasActiveItem ? '#F59E42' : '#B6BDC7'}
                      transform={openSections[section.title] ? 'rotate(180deg)' : 'rotate(0deg)'}
                      transition="transform 0.2s ease"
                    >
                      ▾
                    </Text>
                  </Button>

                  {openSections[section.title] ? (
                    <VStack gap="2px" align="stretch" pb="8px" pl="42px" pt="2px">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                          <Link key={item.href} href={item.href} style={{ display: 'block' }}>
                            <Box
                              display="flex"
                              alignItems="center"
                              minH="30px"
                              px="8px"
                              borderRadius="6px"
                              bg={isActive ? '#FFF8F1' : 'transparent'}
                              color={isActive ? '#F59E42' : '#6B7280'}
                              fontSize="12px"
                              fontWeight="500"
                              transition="background-color 0.2s ease, color 0.2s ease"
                              _hover={{ bg: isActive ? '#FFF8F1' : 'white', color: '#111827' }}
                            >
                              {item.label}
                            </Box>
                          </Link>
                        );
                      })}
                    </VStack>
                  ) : null}
                </VStack>
              );
            })}
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}

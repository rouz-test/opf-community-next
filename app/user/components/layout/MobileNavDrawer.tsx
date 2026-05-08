'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { useMobileNav } from '@/app/user/components/providers/MobileNavProvider';

export default function MobileNavDrawer() {
  const { isOpen, closeNav } = useMobileNav();

  if (!isOpen) return null;

  return (
    <Box position="fixed" inset="0" zIndex="100" display={{ lg: 'none' }}>
      <Button
        type="button"
        aria-label="메뉴 닫기"
        onClick={closeNav}
        position="absolute"
        inset="0"
        bg="blackAlpha.300"
        _hover={{ bg: 'blackAlpha.300' }}
        _active={{ bg: 'blackAlpha.300' }}
      />

      <Flex
        position="absolute"
        top="0"
        left="0"
        h="full"
        w="320px"
        maxW="85vw"
        direction="column"
        borderRightWidth="1px"
        borderColor="gray.200"
        bg="white"
        boxShadow="2xl"
      >
        <Flex align="center" justify="space-between" borderBottomWidth="1px" borderColor="gray.200" px="5" py="4">
          <Box>
            <Text fontSize="sm" fontWeight="500" color="gray.400">
              Orange Park
            </Text>
            <Text mt="1" fontSize="lg" fontWeight="600" color="gray.900">
              메뉴
            </Text>
          </Box>

          <Button
            type="button"
            onClick={closeNav}
            minW="9"
            h="9"
            rounded="full"
            borderWidth="1px"
            borderColor="gray.200"
            bg="white"
            p="0"
            color="gray.500"
            _hover={{ bg: 'gray.50', color: 'gray.700' }}
            aria-label="닫기"
          >
            <Icon as={X} boxSize="4" />
          </Button>
        </Flex>

        <Box as="nav" flex="1" px="4" py="5">
          <Flex as="ul" direction="column" gap="2">
            <Box as="li">
              <Link
                href="/user/community"
                onClick={closeNav}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                }}
              >
                커뮤니티
              </Link>
            </Box>
            <Box as="li">
              <Button
                type="button"
                onClick={closeNav}
                justifyContent="flex-start"
                w="full"
                rounded="xl"
                bg="transparent"
                px="4"
                py="3"
                fontSize="sm"
                fontWeight="500"
                color="gray.700"
                _hover={{ bg: 'gray.50', color: 'orange.600' }}
              >
                캠퍼스
              </Button>
            </Box>
            <Box as="li">
              <Link
                href="/user/article"
                onClick={closeNav}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                }}
              >
                아티클
              </Link>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

'use client';

import { useState } from 'react';
import { Box, Button, Collapsible, Flex, HStack, Text } from '@chakra-ui/react';

export type CommunityTagFilterProps = {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
};

export function CommunityTagFilter({
  allTags,
  selectedTags,
  onToggleTag,
  onClearTags,
}: CommunityTagFilterProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <Box rounded="lg" borderWidth="1px" borderColor="gray.200" bg="white">
      <Box display={{ base: 'block', sm: 'none' }}>
        <Button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          w="full"
          justifyContent="space-between"
          rounded="none"
          bg="transparent"
          px="4"
          py="3"
          textAlign="left"
          fontWeight="normal"
          _hover={{ bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
          aria-expanded={isMobileOpen}
          aria-label="태그 필터 열기"
        >
          <Box minW="0">
            <Text fontSize="sm" fontWeight="600" color="gray.900">
              태그 필터
            </Text>
            <Text mt="1" fontSize="xs" color="gray.500">
              {selectedTags.length > 0
                ? `${selectedTags.length}개 선택됨`
                : '태그를 선택해 게시글을 좁혀보세요'}
            </Text>
          </Box>
          <Text
            ml="3"
            flexShrink={0}
            fontSize="sm"
            color="gray.400"
            transform={isMobileOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
            transition="transform 0.2s"
          >
            ▾
          </Text>
        </Button>

        <Collapsible.Root open={isMobileOpen}>
          <Collapsible.Content>
            <Box borderTopWidth="1px" borderColor="gray.100" px="4" py="3">
              <Flex mb="3" align="center" justify="space-between" gap="3">
                <Text fontSize="xs" fontWeight="600" color="gray.600">
                  태그 선택
                </Text>
                {selectedTags.length > 0 ? (
                  <Button
                    type="button"
                    onClick={onClearTags}
                    variant="ghost"
                    h="auto"
                    minW="auto"
                    px="0"
                    py="0"
                    fontSize="xs"
                    fontWeight="600"
                    color="orange.500"
                    _hover={{ color: 'orange.600', bg: 'transparent' }}
                  >
                    초기화
                  </Button>
                ) : null}
              </Flex>

              <HStack align="stretch" flexWrap="wrap" gap="1.5">
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    onClick={() => onToggleTag(tag)}
                    rounded="full"
                    px="3"
                    py="1.5"
                    h="auto"
                    fontSize="xs"
                    fontWeight="600"
                    bg={selectedTags.includes(tag) ? 'orange.500' : 'gray.100'}
                    color={selectedTags.includes(tag) ? 'white' : 'gray.600'}
                    _hover={{
                      bg: selectedTags.includes(tag) ? 'orange.600' : 'gray.200',
                    }}
                  >
                    #{tag}
                  </Button>
                ))}
              </HStack>
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>
      </Box>

      <Box display={{ base: 'none', sm: 'block' }} p="4">
        <Text mb="3" fontSize="xs" fontWeight="600" color="gray.900">
          태그 필터
        </Text>
        <HStack align="stretch" flexWrap="wrap" gap="1.5">
          {allTags.map((tag) => (
            <Button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              rounded="full"
              px="2.5"
              py="1"
              h="auto"
              fontSize="xs"
              fontWeight="600"
              bg={selectedTags.includes(tag) ? 'orange.500' : 'gray.100'}
              color={selectedTags.includes(tag) ? 'white' : 'gray.600'}
              _hover={{
                bg: selectedTags.includes(tag) ? 'orange.600' : 'gray.200',
              }}
            >
              #{tag}
            </Button>
          ))}
        </HStack>
        {selectedTags.length > 0 ? (
          <Button
            type="button"
            onClick={onClearTags}
            variant="ghost"
            mt="3"
            h="auto"
            minW="auto"
            px="0"
            py="0"
            fontSize="xs"
            fontWeight="600"
            color="orange.500"
            _hover={{ color: 'orange.600', bg: 'transparent' }}
          >
            필터 초기화
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}

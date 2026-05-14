'use client';

import { useState } from 'react';
import { Box, Button, Collapsible, Flex, Text } from '@chakra-ui/react';
import { Check, RefreshCw } from 'lucide-react';

import tagsData from '@/data/mock/tags.json';
import type { Tag } from '@/types/tag';

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
  const tagOptions = (tagsData as Tag[])
    .filter((tag) => tag.status === 'active' && !tag.isDefault && allTags.includes(tag.name))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const renderTagRows = () => (
    <Flex direction="column" gap="18px">
      {tagOptions.map((tag) => {
        const isSelected = selectedTags.includes(tag.name);

        return (
          <Button
            key={tag.id}
            type="button"
            onClick={() => onToggleTag(tag.name)}
            h="auto"
            minH="22px"
            w="full"
            justifyContent="space-between"
            rounded="none"
            bg="transparent"
            p="0"
            color="gray.500"
            fontWeight="500"
            _hover={{ bg: 'transparent', color: 'gray.700' }}
          >
            <Flex align="center" gap="7px" minW="0">
              <Box
                boxSize="8px"
                borderRadius="9999px"
                bg={tag.style.color}
                flexShrink={0}
              />
              <Text fontSize="14px" lineHeight="1" color={isSelected ? '#4B5563' : '#8C8C8C'} truncate>
                {tag.name}
              </Text>
            </Flex>
            {isSelected ? <Check size={14} color="#FF6900" strokeWidth={2.2} /> : <Box boxSize="14px" />}
          </Button>
        );
      })}
    </Flex>
  );

  return (
    <Box borderRadius="20px" bg="white" boxShadow="0 12px 30px rgba(223, 223, 223, 0.9)">
      <Box display={{ base: 'block', sm: 'none' }}>
        <Button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          w="full"
          justifyContent="space-between"
          rounded="none"
          bg="transparent"
          px="20px"
          py="18px"
          textAlign="left"
          fontWeight="normal"
          _hover={{ bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
          aria-expanded={isMobileOpen}
          aria-label="태그 필터 열기"
        >
          <Box minW="0">
            <Text fontSize="16px" fontWeight="700" color="#4B4B4B">
              필터 설정
            </Text>
          </Box>
          <Flex align="center" gap="12px">
            {selectedTags.length > 0 ? (
              <Text fontSize="13px" fontWeight="600" color="#FF6900">
                {selectedTags.length}
              </Text>
            ) : null}
            <Box
              as="span"
              color="#9CA3AF"
              transform={isMobileOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
              transition="transform 0.2s"
              fontSize="14px"
              lineHeight="1"
            >
              ▾
            </Box>
          </Flex>
        </Button>

        <Collapsible.Root open={isMobileOpen}>
          <Collapsible.Content>
            <Box borderTopWidth="1px" borderColor="gray.100" px="20px" pb="20px" pt="18px">
              <Flex align="center" justify="space-between" mb="22px">
                <Text fontSize="14px" fontWeight="700" color="#8C8C8C">
                  태그
                </Text>
                <Button
                  type="button"
                  onClick={onClearTags}
                  variant="ghost"
                  h="auto"
                  minW="auto"
                  px="0"
                  py="0"
                  color="#A3A3A3"
                  _hover={{ color: '#6B7280', bg: 'transparent' }}
                  aria-label="태그 필터 초기화"
                >
                  <RefreshCw size={18} />
                </Button>
              </Flex>
              {renderTagRows()}
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>
      </Box>

      <Box display={{ base: 'none', sm: 'block' }} px="20px" py="20px">
        <Flex align="center" justify="space-between" mb="26px">
          <Text fontSize="16px" fontWeight="700" color="#4B4B4B">
            필터 설정
          </Text>
          <Button
            type="button"
            onClick={onClearTags}
            variant="ghost"
            h="auto"
            minW="auto"
            px="0"
            py="0"
            color="#A3A3A3"
            _hover={{ color: '#6B7280', bg: 'transparent' }}
            aria-label="태그 필터 초기화"
          >
            <RefreshCw size={18} />
          </Button>
        </Flex>
        {renderTagRows()}
      </Box>
    </Box>
  );
}

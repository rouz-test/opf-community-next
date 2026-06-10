'use client';

import { Box, Button, Flex, Image, Portal, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';

type MentionSuggestionLayerProps = {
  open: boolean;
  query?: string;
  viewerAccountId: string;
  onSelect: (item: MentionSuggestionItem) => void;
  floatingRect?: Pick<DOMRect, 'left' | 'top' | 'bottom' | 'width'> | null;
};

export type MentionSuggestionItem = {
  accountId: string;
  name: string;
  avatar: string;
  company: string;
  position: string;
  relation: 'mutual' | 'following' | 'search';
};

const relationLabels: Record<MentionSuggestionItem['relation'], string> = {
  mutual: '맞팔로우',
  following: '팔로잉',
  search: '검색',
};

export default function MentionSuggestionLayer({
  open,
  query = '',
  viewerAccountId,
  onSelect,
  floatingRect,
}: MentionSuggestionLayerProps) {
  const [items, setItems] = useState<MentionSuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const normalizedQuery = query.trim();
  const titleText = useMemo(
    () => (normalizedQuery ? `"${normalizedQuery}" 검색 결과` : '멘션 추천'),
    [normalizedQuery],
  );

  useEffect(() => {
    if (!open) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadSuggestions = async () => {
      try {
        setIsLoading(true);
        const searchParams = new URLSearchParams({
          viewerAccountId,
          query: normalizedQuery,
          limit: '10',
        });
        const response = await fetch(`/api/mock/community-mentions?${searchParams.toString()}`, {
          cache: 'no-store',
        });
        const data = (await response.json().catch(() => null)) as
          | { items?: MentionSuggestionItem[]; message?: string }
          | null;

        if (!response.ok || !data?.items) {
          throw new Error(data?.message || '멘션 후보를 불러오지 못했습니다.');
        }

        if (isCancelled) return;
        setItems(data.items);
      } catch (error) {
        if (isCancelled) return;
        console.error('[MentionSuggestionLayer] failed to load suggestions:', error);
        setItems([]);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSuggestions();

    return () => {
      isCancelled = true;
    };
  }, [normalizedQuery, open, viewerAccountId]);

  if (!open) return null;

  const layer = (
    <Box
      position={floatingRect ? 'fixed' : 'absolute'}
      left={floatingRect ? { base: '50%', md: `${floatingRect.left}px` } : '0'}
      top={floatingRect ? { base: '50%', md: `${floatingRect.bottom + 8}px` } : 'calc(100% + 8px)'}
      transform={floatingRect ? { base: 'translate(-50%, -50%)', md: 'none' } : undefined}
      zIndex="1500"
      w={
        floatingRect
          ? { base: 'calc(100vw - 48px)', md: `${Math.min(floatingRect.width, 320)}px` }
          : { base: 'min(100%, 320px)', md: '320px' }
      }
      maxW="360px"
      overflow="hidden"
      borderRadius="16px"
      borderWidth="1px"
      borderColor="#FFE1C2"
      bg="#FFFFFF"
      boxShadow="0 18px 42px rgba(255, 105, 0, 0.18)"
    >
      <Box px="16px" py="13px" borderBottomWidth="1px" borderBottomColor="#F3F4F6">
        <Text fontSize="14px" fontWeight="700" color="#111827">
          {titleText}
        </Text>
        {!normalizedQuery ? (
          <Text mt="3px" fontSize="12px" color="#9CA3AF">
            맞팔로우와 팔로잉 대상을 먼저 보여줍니다.
          </Text>
        ) : null}
      </Box>

      <Flex direction="column" maxH="280px" overflowY="auto" px="8px" py="8px" gap="2px">
        {isLoading ? (
          <Flex align="center" justify="center" gap="8px" py="22px" color="#9CA3AF">
            <Spinner size="sm" />
            <Text fontSize="12px">불러오는 중</Text>
          </Flex>
        ) : items.length > 0 ? (
          items.map((item) => (
            <Button
              key={item.accountId}
              type="button"
              justifyContent="flex-start"
              h="auto"
              w="full"
              gap="10px"
              rounded="12px"
              bg="transparent"
              px="8px"
              py="8px"
              textAlign="left"
              _hover={{ bg: '#FFF7ED' }}
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(item);
              }}
            >
              <Image
                src={item.avatar}
                alt={item.name}
                w="34px"
                h="34px"
                borderRadius="9999px"
                objectFit="cover"
                flexShrink={0}
              />
              <Box minW="0" flex="1">
                <Flex align="center" gap="6px">
                  <Text fontSize="13px" fontWeight="700" color="#111827" truncate>
                    {item.name}
                  </Text>
                  {item.relation !== 'search' ? (
                    <Box px="6px" py="2px" borderRadius="9999px" bg="#E0F2FE">
                      <Text fontSize="10px" fontWeight="700" color="#0284C7">
                        {relationLabels[item.relation]}
                      </Text>
                    </Box>
                  ) : null}
                </Flex>
                <Text mt="2px" fontSize="12px" fontWeight="500" color="#9CA3AF" truncate>
                  {[item.company, item.position].filter(Boolean).join(' · ') || '프로필 정보 없음'}
                </Text>
              </Box>
            </Button>
          ))
        ) : (
          <Box px="10px" py="18px" textAlign="center">
            <Text fontSize="12px" color="#9CA3AF">
              표시할 멘션 후보가 없습니다.
            </Text>
          </Box>
        )}
      </Flex>
    </Box>
  );

  if (floatingRect) {
    return <Portal>{layer}</Portal>;
  }

  return layer;
}

'use client';

import { useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  Input,
  InputGroup,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Tag,
  UserCheck,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export type CommunityToolbarProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  showFollowingOnly: boolean;
  onToggleFollowingOnly: () => void;
  sortBy: 'recommended' | 'latest';
  onSortByChange: (value: 'recommended' | 'latest') => void;
  viewMode: 'feed' | 'board';
  onViewModeChange: (value: 'feed' | 'board') => void;
  isFilterOpen: boolean;
  onToggleFilterOpen: () => void;
  onCloseFilterOpen: () => void;
  isTagFilterOpen: boolean;
  onToggleTagFilterOpen: () => void;
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  searchPlaceholder?: string;
  showFollowingFilter?: boolean;
};

type OptionCardProps = {
  active: boolean;
  icon: typeof Filter;
  label: string;
  onClick: () => void;
};

function OptionCard({ active, icon, label, onClick }: OptionCardProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      justifyContent="space-between"
      rounded="xl"
      borderWidth="1px"
      borderColor={active ? 'orange.200' : 'gray.200'}
      bg={active ? 'orange.50' : 'gray.50'}
      px="4"
      py="3"
      h="auto"
      fontSize="sm"
      fontWeight="600"
      color={active ? 'orange.700' : 'gray.700'}
      _hover={{ bg: active ? 'orange.100' : 'gray.100' }}
    >
      <HStack gap="2">
        <Icon as={icon} boxSize="4" />
        <Text>{label}</Text>
      </HStack>
      {active ? <Text fontSize="base">✓</Text> : null}
    </Button>
  );
}

export function CommunityToolbar({
  searchQuery,
  onSearchQueryChange,
  showFollowingOnly,
  onToggleFollowingOnly,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  isFilterOpen,
  onToggleFilterOpen,
  onCloseFilterOpen,
  isTagFilterOpen,
  onToggleTagFilterOpen,
  allTags,
  selectedTags,
  onToggleTag,
  onClearTags,
  searchPlaceholder = '게시글 검색...',
  showFollowingFilter = true,
}: CommunityToolbarProps) {
  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const filterTriggerRef = useRef<HTMLButtonElement | null>(null);
  const mobileFilterModalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (filterPanelRef.current?.contains(target)) return;
      if (filterTriggerRef.current?.contains(target)) return;
      if (mobileFilterModalRef.current?.contains(target)) return;

      onCloseFilterOpen();
    };

    window.addEventListener('mousedown', handlePointerDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isFilterOpen, onCloseFilterOpen]);

  return (
    <Box position="relative">
      <Stack gap={{ base: '3', lg: '0' }}>
        <HStack display={{ base: 'none', lg: 'flex' }} gap="3">
          <InputGroup startElement={<Icon as={Search} boxSize="4" color="gray.400" />}>
            <Input
              type="text"
              minW="240px"
              flex="1"
              value={searchQuery}
              placeholder={searchPlaceholder}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              rounded="lg"
              borderColor="gray.200"
              bg="white"
              py="2.5"
              pr="4"
              fontSize="sm"
              _focusVisible={{
                borderColor: 'orange.500',
                boxShadow: '0 0 0 2px rgba(249, 115, 22, 0.35)',
              }}
            />
          </InputGroup>

          <Button
            ref={filterTriggerRef}
            type="button"
            onClick={onToggleFilterOpen}
            gap="2"
            rounded="lg"
            borderWidth="1px"
            borderColor={isFilterOpen ? 'orange.200' : 'gray.200'}
            bg={isFilterOpen ? 'orange.50' : 'white'}
            px="4"
            py="2.5"
            fontSize="sm"
            fontWeight="600"
            color={isFilterOpen ? 'orange.700' : 'gray.700'}
            _hover={{ bg: isFilterOpen ? 'orange.100' : 'gray.50' }}
          >
            <Icon as={Filter} boxSize="4" />
            <Text>필터</Text>
          </Button>
        </HStack>

        <Stack display={{ base: 'flex', lg: 'none' }} gap="3">
          <InputGroup startElement={<Icon as={Search} boxSize="4" color="gray.400" />}>
            <Input
              type="text"
              value={searchQuery}
              placeholder={searchPlaceholder}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              rounded="lg"
              borderColor="gray.200"
              bg="white"
              py="2.5"
              pr="4"
              fontSize="sm"
              _focusVisible={{
                borderColor: 'orange.500',
                boxShadow: '0 0 0 2px rgba(249, 115, 22, 0.35)',
              }}
            />
          </InputGroup>

          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="3">
            <Button
              type="button"
              onClick={onToggleTagFilterOpen}
              gap="2"
              rounded="lg"
              borderWidth="1px"
              borderColor={isTagFilterOpen ? 'orange.200' : 'gray.200'}
              bg={isTagFilterOpen ? 'orange.50' : 'white'}
              px="3"
              py="2.5"
              fontSize="sm"
              fontWeight="600"
              color={isTagFilterOpen ? 'orange.700' : 'gray.700'}
              _hover={{ bg: isTagFilterOpen ? 'orange.100' : 'gray.50' }}
            >
              <Icon as={Tag} boxSize="4" />
              <Text>태그</Text>
            </Button>

            <Button
              type="button"
              onClick={onToggleFilterOpen}
              gap="2"
              rounded="lg"
              borderWidth="1px"
              borderColor={isFilterOpen ? 'orange.200' : 'gray.200'}
              bg={isFilterOpen ? 'orange.50' : 'white'}
              px="3"
              py="2.5"
              fontSize="sm"
              fontWeight="600"
              color={isFilterOpen ? 'orange.700' : 'gray.700'}
              _hover={{ bg: isFilterOpen ? 'orange.100' : 'gray.50' }}
            >
              <Icon as={Filter} boxSize="4" />
              <Text>필터</Text>
            </Button>
          </Grid>
        </Stack>
      </Stack>

      {isFilterOpen ? (
        <Box
          ref={filterPanelRef}
          position="absolute"
          top="100%"
          right="0"
          zIndex="20"
          mt="3"
          display={{ base: 'none', lg: 'block' }}
          w="full"
          maxW="360px"
          rounded="2xl"
          borderWidth="1px"
          borderColor="gray.200"
          bg="white"
          p="5"
          boxShadow="xl"
        >
          <Flex mb="4" align="center" justify="space-between">
            <Text fontSize="base" fontWeight="600" color="gray.900">
              필터 설정
            </Text>
            <Button
              type="button"
              onClick={onCloseFilterOpen}
              variant="ghost"
              minW="auto"
              h="auto"
              px="0"
              py="0"
              fontSize="xl"
              lineHeight="none"
              color="gray.400"
              _hover={{ color: 'gray.600', bg: 'transparent' }}
              aria-label="필터 닫기"
            >
              ×
            </Button>
          </Flex>

          <Stack gap="5">
            {showFollowingFilter ? (
              <Box>
                <Text mb="3" fontSize="sm" fontWeight="600" color="gray.700">
                  표시 옵션
                </Text>
                <OptionCard
                  active={showFollowingOnly}
                  icon={UserCheck}
                  label="팔로잉 글만 보기"
                  onClick={onToggleFollowingOnly}
                />
              </Box>
            ) : null}

            <Box borderTopWidth={showFollowingFilter ? '1px' : '0'} borderColor="gray.100" pt={showFollowingFilter ? '5' : '0'}>
              <Text mb="3" fontSize="sm" fontWeight="600" color="gray.700">
                정렬 순서
              </Text>
              <Stack gap="2">
                <OptionCard
                  active={sortBy === 'recommended'}
                  icon={TrendingUp}
                  label="추천순"
                  onClick={() => onSortByChange('recommended')}
                />
                <OptionCard
                  active={sortBy === 'latest'}
                  icon={Sparkles}
                  label="최신순"
                  onClick={() => onSortByChange('latest')}
                />
              </Stack>
            </Box>

            <Box borderTopWidth="1px" borderColor="gray.100" pt="5">
              <Text mb="3" fontSize="sm" fontWeight="600" color="gray.700">
                보기 방식
              </Text>
              <Stack gap="2">
                <OptionCard
                  active={viewMode === 'feed'}
                  icon={LayoutGrid}
                  label="피드뷰"
                  onClick={() => onViewModeChange('feed')}
                />
                <OptionCard
                  active={viewMode === 'board'}
                  icon={List}
                  label="게시판뷰"
                  onClick={() => onViewModeChange('board')}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>
      ) : null}

      {isTagFilterOpen ? (
        <Portal>
          <Flex position="fixed" inset="0" zIndex="50" align="center" justify="center" bg="blackAlpha.500" px="4" display={{ base: 'flex', lg: 'none' }}>
            <Button
              type="button"
              aria-label="태그 필터 닫기"
              position="absolute"
              inset="0"
              onClick={onToggleTagFilterOpen}
              bg="transparent"
              _hover={{ bg: 'transparent' }}
              _active={{ bg: 'transparent' }}
            />
            <Box position="relative" zIndex="10" maxH="80vh" w="full" maxW="md" overflowY="auto" rounded="2xl" bg="white" p="5" boxShadow="2xl">
              <Flex mb="4" align="center" justify="space-between">
                <Text fontSize="base" fontWeight="600" color="gray.900">
                  태그 필터
                </Text>
                <Button
                  type="button"
                  onClick={onToggleTagFilterOpen}
                  variant="ghost"
                  minW="auto"
                  h="auto"
                  px="0"
                  py="0"
                  fontSize="xl"
                  lineHeight="none"
                  color="gray.400"
                  _hover={{ color: 'gray.600', bg: 'transparent' }}
                  aria-label="태그 필터 닫기"
                >
                  ×
                </Button>
              </Flex>

              <Box borderTopWidth="1px" borderColor="gray.100" pt="4">
                <Flex mb="3" align="center" justify="space-between">
                  <Text fontSize="sm" fontWeight="600" color="gray.700">
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
                      color="orange.600"
                      _hover={{ color: 'orange.700', bg: 'transparent' }}
                    >
                      전체 해제
                    </Button>
                  ) : null}
                </Flex>

                <HStack align="stretch" flexWrap="wrap" gap="2">
                  {allTags.map((tag) => {
                    const selected = selectedTags.includes(tag);

                    return (
                      <Button
                        key={tag}
                        type="button"
                        onClick={() => onToggleTag(tag)}
                        rounded="full"
                        px="2.5"
                        py="1"
                        h="auto"
                        fontSize="13px"
                        fontWeight="600"
                        bg={selected ? 'orange.500' : 'gray.100'}
                        color={selected ? 'white' : 'gray.700'}
                        _hover={{ bg: selected ? 'orange.600' : 'gray.200' }}
                      >
                        #{tag}
                      </Button>
                    );
                  })}
                </HStack>
              </Box>
            </Box>
          </Flex>
        </Portal>
      ) : null}

      {isFilterOpen ? (
        <Portal>
          <Flex position="fixed" inset="0" zIndex="50" align="center" justify="center" bg="blackAlpha.500" px="4" display={{ base: 'flex', lg: 'none' }}>
            <Button
              type="button"
              aria-label="필터 닫기"
              position="absolute"
              inset="0"
              onClick={onCloseFilterOpen}
              bg="transparent"
              _hover={{ bg: 'transparent' }}
              _active={{ bg: 'transparent' }}
            />
            <Box
              ref={mobileFilterModalRef}
              position="relative"
              zIndex="10"
              maxH="80vh"
              w="full"
              maxW="md"
              overflowY="auto"
              rounded="2xl"
              bg="white"
              p="5"
              boxShadow="2xl"
            >
              <Flex mb="4" align="center" justify="space-between">
                <Text fontSize="base" fontWeight="600" color="gray.900">
                  필터 설정
                </Text>
                <Button
                  type="button"
                  onClick={onCloseFilterOpen}
                  variant="ghost"
                  minW="auto"
                  h="auto"
                  px="0"
                  py="0"
                  fontSize="xl"
                  lineHeight="none"
                  color="gray.400"
                  _hover={{ color: 'gray.600', bg: 'transparent' }}
                  aria-label="필터 닫기"
                >
                  ×
                </Button>
              </Flex>

              <Stack gap="5">
                {showFollowingFilter ? (
                  <Box>
                    <Text mb="3" fontSize="sm" fontWeight="600" color="gray.700">
                      표시 옵션
                    </Text>
                    <OptionCard
                      active={showFollowingOnly}
                      icon={UserCheck}
                      label="팔로잉 글만 보기"
                      onClick={onToggleFollowingOnly}
                    />
                  </Box>
                ) : null}

                <Box borderTopWidth={showFollowingFilter ? '1px' : '0'} borderColor="gray.100" pt={showFollowingFilter ? '5' : '0'}>
                  <Text mb="3" fontSize="sm" fontWeight="600" color="gray.700">
                    정렬 순서
                  </Text>
                  <Stack gap="2">
                    <OptionCard
                      active={sortBy === 'recommended'}
                      icon={TrendingUp}
                      label="추천순"
                      onClick={() => onSortByChange('recommended')}
                    />
                    <OptionCard
                      active={sortBy === 'latest'}
                      icon={Sparkles}
                      label="최신순"
                      onClick={() => onSortByChange('latest')}
                    />
                  </Stack>
                </Box>

                <Box borderTopWidth="1px" borderColor="gray.100" pt="5">
                  <Text mb="3" fontSize="sm" fontWeight="600" color="gray.700">
                    보기 방식
                  </Text>
                  <Stack gap="2">
                    <OptionCard
                      active={viewMode === 'feed'}
                      icon={LayoutGrid}
                      label="피드뷰"
                      onClick={() => onViewModeChange('feed')}
                    />
                    <OptionCard
                      active={viewMode === 'board'}
                      icon={List}
                      label="게시판뷰"
                      onClick={() => onViewModeChange('board')}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Flex>
        </Portal>
      ) : null}
    </Box>
  );
}

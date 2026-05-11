'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button as ChakraButton,
  Flex,
  Grid,
  HStack,
  Icon,
  Image,
  Input,
  Portal,
  Text,
} from '@chakra-ui/react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/app/user/components/ui/button';
import UserTagBadge from '@/app/user/components/ui/tag/tag-badge';
import { useAuth } from '@/app/user/components/providers/AuthProvider';
import tagsData from '@/data/mock/tags.json';
import { resolveTags } from '@/lib/tags';
import {
  normalizeLegacyCommunityIdentity,
  type CommunityIdentityMode,
} from '@/app/user/lib/community-identity';
import type { Tag } from '@/types/tag';

export type WritePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    nickname: string;
    avatar: string;
    position: string;
  };
};

const WRITE_MAX_TITLE_LENGTH = 200;
const tags = tagsData as Tag[];
const TEMP_PROFILE_IMAGE = 'https://placehold.co/40x40/png';

type WriteErrors = {
  title?: string;
};

type IdentityOption = {
  label: string;
  value: CommunityIdentityMode;
};

const identityOptions: IdentityOption[] = [
  { label: '실명으로 글 작성하기', value: 'real' },
  { label: '익명으로 글 작성하기', value: 'anonymous' },
];

const selectButtonStyles = {
  h: '40px',
  w: 'full',
  justifyContent: 'space-between',
  borderRadius: '12px',
  borderWidth: '1px',
  borderColor: '#D1D5DB',
  bg: 'white',
  px: '14px',
  fontSize: '14px',
  fontWeight: '500',
  color: 'gray.700',
  _hover: { bg: 'gray.50' },
} as const;

export function WritePostModal({ isOpen, onClose }: WritePostModalProps) {
  const { defaultCommunityIdentity } = useAuth();
  const normalizedDefaultIdentity =
    normalizeLegacyCommunityIdentity(defaultCommunityIdentity) ?? 'real';

  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPromotion, setIsPromotion] = useState(false);
  const [profileModeOverride, setProfileModeOverride] = useState<CommunityIdentityMode | null>(null);
  const [isIdentityDropdownOpen, setIsIdentityDropdownOpen] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [errors, setErrors] = useState<WriteErrors>({});

  const identityDropdownRef = useRef<HTMLDivElement | null>(null);
  const tagDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (identityDropdownRef.current?.contains(target)) return;
      if (tagDropdownRef.current?.contains(target)) return;

      setIsIdentityDropdownOpen(false);
      setIsTagDropdownOpen(false);
    };

    window.addEventListener('mousedown', handlePointerDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  const profileMode = profileModeOverride ?? normalizedDefaultIdentity;
  const selectedIdentityLabel = useMemo(
    () => identityOptions.find((option) => option.value === profileMode)?.label ?? identityOptions[0].label,
    [profileMode],
  );
  const availableTags = useMemo(
    () => tags.filter((tag) => tag.status === 'active' && !tag.isDefault),
    [],
  );
  const selectedResolvedTags = useMemo(
    () => (selectedTags.length > 0 ? resolveTags(selectedTags, tags, { includeInactive: false }) : []),
    [selectedTags],
  );

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setTitle('');
    setSelectedTags([]);
    setIsPromotion(false);
    setProfileModeOverride(null);
    setIsIdentityDropdownOpen(false);
    setIsTagDropdownOpen(false);
    setShowCloseConfirm(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCloseAttempt = () => {
    if (title.trim() || selectedTags.length > 0 || isPromotion || profileModeOverride) {
      setShowCloseConfirm(true);
      return;
    }

    handleClose();
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value.length <= WRITE_MAX_TITLE_LENGTH) {
      setTitle(value);
      setErrors((prev) => ({ ...prev, title: undefined }));
      return;
    }

    setErrors((prev) => ({ ...prev, title: '제목은 최대 200자까지 입력할 수 있습니다.' }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setErrors({ title: '제목을 입력해 주세요.' });
      return;
    }

    window.alert('글쓰기 UI 시안만 우선 적용된 상태입니다. 실제 저장과 에디터 연결은 다음 단계에서 진행됩니다.');
    handleClose();
  };

  return (
    <>
      <Flex
        position="fixed"
        inset="0"
        zIndex="80"
        align="center"
        justify="center"
        bg="blackAlpha.600"
        px={{ base: '0', md: '4' }}
        onClick={handleCloseAttempt}
      >
        <Box
          w="full"
          maxW={{ base: '100%', md: '920px' }}
          h={{ base: '100%', md: 'auto' }}
          maxH={{ md: '92vh' }}
          overflow="hidden"
          rounded={{ base: 'none', md: '28px' }}
          bg="white"
          boxShadow="0 24px 80px rgba(15, 23, 42, 0.18)"
          onClick={(event) => event.stopPropagation()}
        >
          <Flex align="center" justify="space-between" px={{ base: '5', md: '10' }} pt={{ base: '6', md: '10' }} pb="4">
            <Text fontSize="20px" fontWeight="700" letterSpacing="-0.02em" color="gray.900">
              글쓰기
            </Text>
            <ChakraButton
              type="button"
              onClick={handleCloseAttempt}
              minW="auto"
              h="auto"
              bg="transparent"
              p="0"
              color="gray.500"
              _hover={{ color: 'gray.700', bg: 'transparent' }}
              aria-label="글쓰기 모달 닫기"
            >
              <Icon as={X} boxSize="6" />
            </ChakraButton>
          </Flex>

          <Box px={{ base: '5', md: '10' }} pb={{ base: '6', md: '10' }}>
            <Grid
              templateColumns={{ base: '1fr', md: 'minmax(0, 1fr) 252px' }}
              gap={{ base: '6', md: '5' }}
              alignItems="start"
            >
              <Box order={{ base: 4, md: 1 }}>
                <Text mb="3" fontSize="16px" fontWeight="700" color="gray.700">
                  제목
                </Text>
                <Input
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="제목을 입력하세요."
                  h="44px"
                  borderRadius="12px"
                  borderColor="#D1D5DB"
                  px="14px"
                  fontSize="14px"
                  color="gray.900"
                  _placeholder={{ color: 'gray.400' }}
                  _focusVisible={{
                    borderColor: '#FF6900',
                    boxShadow: '0 0 0 2px rgba(255, 105, 0, 0.18)',
                  }}
                />
                <Flex mt="2" minH="20px" align="center" justify="space-between">
                  <Text fontSize="12px" color="red.500">
                    {errors.title ?? ''}
                  </Text>
                  <Text fontSize="12px" color="gray.400">
                    {title.length}/{WRITE_MAX_TITLE_LENGTH}
                  </Text>
                </Flex>
              </Box>

              <Box order={{ base: 1, md: 2 }}>
                <Text mb="3" fontSize="16px" fontWeight="700" color="gray.700">
                  작성자
                </Text>
                <Box ref={identityDropdownRef} position="relative">
                    <ChakraButton
                      type="button"
                      onClick={() => setIsIdentityDropdownOpen((prev) => !prev)}
                      {...selectButtonStyles}
                    >
                      <HStack gap="2" minW="0">
                        {profileMode === 'real' ? (
                          <Image
                            src={TEMP_PROFILE_IMAGE}
                            alt="임시 프로필 이미지"
                            h="20px"
                            w="20px"
                            rounded="full"
                            objectFit="cover"
                            flexShrink={0}
                          />
                        ) : (
                          <Flex
                            h="20px"
                            w="20px"
                            align="center"
                            justify="center"
                            rounded="full"
                            bg="gray.900"
                            fontSize="10px"
                            fontWeight="700"
                            color="white"
                            flexShrink={0}
                          >
                            익명
                          </Flex>
                        )}
                        <Text truncate>{selectedIdentityLabel}</Text>
                      </HStack>
                    <Icon
                      as={ChevronDown}
                      boxSize="4"
                      color="gray.500"
                      transform={isIdentityDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                      transition="transform 0.2s"
                    />
                  </ChakraButton>

                  {isIdentityDropdownOpen ? (
                    <Box
                      position="absolute"
                      top="calc(100% + 8px)"
                      left="0"
                      zIndex="20"
                      w="full"
                      rounded="16px"
                      borderWidth="1px"
                      borderColor="#E5E7EB"
                      bg="white"
                      p="2"
                      boxShadow="0 16px 40px rgba(15, 23, 42, 0.12)"
                    >
                      {identityOptions.map((option) => {
                        const selected = option.value === profileMode;

                        return (
                          <ChakraButton
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setProfileModeOverride(option.value);
                              setIsIdentityDropdownOpen(false);
                            }}
                            justifyContent="space-between"
                            w="full"
                            rounded="12px"
                            bg={selected ? '#FFF4E8' : 'transparent'}
                            px="3"
                            py="3"
                            fontSize="14px"
                            fontWeight="500"
                            color={selected ? '#FF6900' : 'gray.700'}
                            _hover={{ bg: selected ? '#FFF0DE' : 'gray.50' }}
                          >
                            <Text>{option.label}</Text>
                            {selected ? <Icon as={Check} boxSize="4" /> : null}
                          </ChakraButton>
                        );
                      })}
                    </Box>
                  ) : null}
                </Box>
              </Box>

              <Box order={{ base: 5, md: 3 }}>
                <Text mb="3" fontSize="16px" fontWeight="700" color="gray.700">
                  내용
                </Text>
                <Box
                  minH={{ base: '280px', md: '404px' }}
                  rounded="12px"
                  borderWidth="1px"
                  borderColor="#D1D5DB"
                  bg="white"
                  px="14px"
                  py="12px"
                >
                  <Text fontSize="14px" color="gray.400">
                    내용을 입력하세요.
                  </Text>
                </Box>
                <Flex mt="2" justify="flex-end">
                  <Text fontSize="12px" color="gray.400">
                    0/2000
                  </Text>
                </Flex>
              </Box>

              <Flex order={{ base: 2, md: 4 }} direction="column" gap="6">
                <Box>
                  <Text mb="3" fontSize="16px" fontWeight="700" color="gray.700">
                    태그
                  </Text>
                  <Box ref={tagDropdownRef} position="relative">
                    <ChakraButton
                      type="button"
                      onClick={() => setIsTagDropdownOpen((prev) => !prev)}
                      {...selectButtonStyles}
                    >
                      <Text color={selectedTags.length > 0 ? 'gray.700' : 'gray.400'}>
                        {selectedTags.length > 0 ? `${selectedTags.length}개 선택됨` : '태그 선택하기'}
                      </Text>
                      <Icon
                        as={ChevronDown}
                        boxSize="4"
                        color="gray.500"
                        transform={isTagDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                        transition="transform 0.2s"
                      />
                    </ChakraButton>

                    {isTagDropdownOpen ? (
                      <Box
                        position="absolute"
                        top="calc(100% + 8px)"
                        left="0"
                        zIndex="20"
                        w="full"
                        rounded="16px"
                        borderWidth="1px"
                        borderColor="#E5E7EB"
                        bg="white"
                        p="2"
                        boxShadow="0 16px 40px rgba(15, 23, 42, 0.12)"
                      >
                        <Flex direction="column" gap="1">
                          {availableTags.map((tag) => {
                            const selected = selectedTags.includes(tag.id);

                            return (
                              <ChakraButton
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTag(tag.id)}
                                justifyContent="space-between"
                                w="full"
                                rounded="12px"
                                bg={selected ? '#FFF4E8' : 'transparent'}
                                px="3"
                                py="3"
                                fontSize="14px"
                                fontWeight="500"
                                color={selected ? '#FF6900' : 'gray.700'}
                                _hover={{ bg: selected ? '#FFF0DE' : 'gray.50' }}
                              >
                                <Text>#{tag.name}</Text>
                                {selected ? <Icon as={Check} boxSize="4" /> : null}
                              </ChakraButton>
                            );
                          })}
                        </Flex>
                      </Box>
                    ) : null}
                  </Box>

                  {selectedResolvedTags.length > 0 ? (
                    <Flex mt="3" wrap="wrap" gap="2">
                      {selectedResolvedTags.map((tag) => (
                        <UserTagBadge key={tag.id} tag={tag} />
                      ))}
                    </Flex>
                  ) : null}
                </Box>

                <Box order={{ base: 3, md: 5 }}>
                  <Text mb="3" fontSize="16px" fontWeight="700" color="gray.700">
                    게시글 유형
                  </Text>
                  <Flex rounded="12px" borderWidth="1px" borderColor="#D1D5DB" overflow="hidden">
                    <ChakraButton
                      type="button"
                      onClick={() => setIsPromotion(false)}
                      flex="1"
                      h="40px"
                      rounded="none"
                      bg={!isPromotion ? '#FFF4E8' : 'white'}
                      borderRightWidth="1px"
                      borderColor="#D1D5DB"
                      fontSize="14px"
                      fontWeight="600"
                      color={!isPromotion ? '#FF6900' : 'gray.700'}
                      _hover={{ bg: !isPromotion ? '#FFF0DE' : 'gray.50' }}
                    >
                      일반글
                    </ChakraButton>
                    <ChakraButton
                      type="button"
                      onClick={() => setIsPromotion(true)}
                      flex="1"
                      h="40px"
                      rounded="none"
                      bg={isPromotion ? '#FFF4E8' : 'white'}
                      fontSize="14px"
                      fontWeight="600"
                      color={isPromotion ? '#FF6900' : 'gray.700'}
                      _hover={{ bg: isPromotion ? '#FFF0DE' : 'gray.50' }}
                    >
                      홍보글
                    </ChakraButton>
                  </Flex>
                </Box>
              </Flex>
            </Grid>

            <Flex mt={{ base: '8', md: '6' }} justify="flex-end" gap="3">
              <Button type="button" variant="ghost" onClick={handleCloseAttempt} minW="88px">
                취소
              </Button>
              <Button type="button" variant="primary" onClick={handleSubmit} minW="122px">
                올리기
              </Button>
            </Flex>
          </Box>
        </Box>
      </Flex>

      {showCloseConfirm ? (
        <Portal>
          <Flex position="fixed" inset="0" zIndex="90" align="center" justify="center" bg="blackAlpha.500" px="4">
            <Box w="full" maxW="sm" rounded="24px" bg="white" p="6" boxShadow="0 20px 60px rgba(15, 23, 42, 0.18)">
              <Text textAlign="center" fontSize="16px" fontWeight="700" color="gray.900">
                작성 중인 내용이 있습니다. 닫으시겠어요?
              </Text>
              <Text mt="2" textAlign="center" fontSize="14px" color="gray.500">
                저장 기능은 아직 연결되지 않아, 닫으면 입력 내용이 사라집니다.
              </Text>

              <Flex mt="5" gap="3">
                <Button type="button" variant="outline" onClick={() => setShowCloseConfirm(false)} flex="1">
                  계속 작성
                </Button>
                <Button type="button" variant="primary" onClick={handleClose} flex="1">
                  닫기
                </Button>
              </Flex>
            </Box>
          </Flex>
        </Portal>
      ) : null}
    </>
  );
}

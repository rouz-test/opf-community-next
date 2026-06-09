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
  useBreakpointValue,
} from '@chakra-ui/react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/app/user/components/ui/button';
import CheckIcon from '@/app/user/components/icons/CheckIcon';
import CloseIcon from '@/app/user/components/icons/CloseIcon';
import { SegmentedControl } from '@/app/user/components/ui/segmented-control';
import { toaster } from '@/app/user/components/ui/toaster';
import ContentEditor from '@/app/user/components/editor/content-editor';
import UserTagBadge from '@/app/user/components/ui/tag/tag-badge';
import ActivitySuspendedModal from '@/app/user/components/modal/activity-suspended-modal';
import BlockedWordAlertModal from '@/app/user/components/modal/blocked-word-alert-modal';
import { useAuth } from '@/app/user/components/providers/AuthProvider';
import {
  COMMUNITY_ACTIVITY_SUSPENDED_MESSAGE,
  fetchCommunitySuspensionStatus,
} from '@/app/user/lib/community-suspension';
import tagsData from '@/data/mock/tags.json';
import { getBlockedWords } from '@/lib/blocked-words';
import { extractTextFromContentBody, findMatchedBlockedWords } from '@/lib/blocked-word-validator';
import { resolveTags } from '@/lib/tags';
import {
  normalizeLegacyCommunityIdentity,
  type CommunityIdentityMode,
} from '@/app/user/lib/community-identity';
import {
  clearCommunityPostDraft,
  loadCommunityPostDraft,
  saveCommunityPostDraft,
} from '@/app/user/lib/community-draft';
import type { ContentEditorJsonValue } from '@/app/user/components/editor/content-editor';
import type { CommunityContent, CommunityContentAuthor, CommunityContentBody, CommunityContentPayload } from '@/types/community-content';
import type { Tag } from '@/types/tag';

export type WritePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (content: CommunityContent) => void;
  onUpdated?: (content: CommunityContent) => void;
  editingContent?: CommunityContent | null;
  currentUser: {
    accountId: string;
    name: string;
    nickname: string;
    avatar: string;
    position: string;
  };
};

const WRITE_MAX_TITLE_LENGTH = 200;
const tags = tagsData as Tag[];

const EMPTY_CONTENT: ContentEditorJsonValue = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
};

const toCommunityContentBody = (value: ContentEditorJsonValue): CommunityContentBody => ({
  type: value.type ?? 'doc',
  content: value.content?.map(toCommunityContentBody),
  text: value.text,
  attrs: value.attrs,
  marks: value.marks,
});

type WriteErrors = {
  title?: string;
  content?: string;
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

export function WritePostModal({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  editingContent,
  currentUser,
}: WritePostModalProps) {
  const { defaultCommunityIdentity } = useAuth();
  const normalizedDefaultIdentity =
    normalizeLegacyCommunityIdentity(defaultCommunityIdentity) ?? 'real';
  const editorHeight = useBreakpointValue({ base: '280px', md: '404px' }) ?? '404px';
  const isEditMode = Boolean(editingContent);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ContentEditorJsonValue>(EMPTY_CONTENT);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPromotion, setIsPromotion] = useState(false);
  const [profileModeOverride, setProfileModeOverride] = useState<CommunityIdentityMode | null>(null);
  const [isIdentityDropdownOpen, setIsIdentityDropdownOpen] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [showClosePrompt, setShowClosePrompt] = useState(false);
  const [isBlockedWordModalOpen, setIsBlockedWordModalOpen] = useState(false);
  const [isActivitySuspendedModalOpen, setIsActivitySuspendedModalOpen] = useState(false);
  const [blockedWordModalTitle, setBlockedWordModalTitle] = useState('금지 키워드가 포함되어 진행할 수 없습니다.');
  const [blockedWordModalDescription, setBlockedWordModalDescription] = useState('금지 키워드를 수정한 뒤 다시 시도해주세요.');
  const [matchedBlockedKeywords, setMatchedBlockedKeywords] = useState<string[]>([]);
  const [blockedWordSourceText, setBlockedWordSourceText] = useState('');
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
  }, [editingContent, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (editingContent) {
      setTitle(editingContent.title);
      setContent(editingContent.content as ContentEditorJsonValue);
      setSelectedTags(editingContent.tagIds);
      setIsPromotion(Boolean(editingContent.flags.isPromoted));
      setProfileModeOverride(editingContent.author.visibility === 'anonymous' ? 'anonymous' : 'real');
      setErrors({});
      return;
    }

    const savedDraft = loadCommunityPostDraft();

    if (!savedDraft) {
      return;
    }

    setTitle(savedDraft.title);
    setContent(savedDraft.content as ContentEditorJsonValue);
    setSelectedTags(savedDraft.selectedTags);
    setIsPromotion(savedDraft.isPromotion);
    setProfileModeOverride(savedDraft.profileModeOverride);
    setErrors({});
  }, [editingContent, isOpen]);

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

  const hasContentText = (node?: ContentEditorJsonValue | null): boolean => {
    if (!node) return false;
    if (typeof node.text === 'string' && node.text.trim().length > 0) return true;
    return node.content?.some((childNode) => hasContentText(childNode)) ?? false;
  };

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setTitle('');
    setContent(EMPTY_CONTENT);
    setSelectedTags([]);
    setIsPromotion(false);
    setProfileModeOverride(null);
    setIsIdentityDropdownOpen(false);
    setIsTagDropdownOpen(false);
    setShowClosePrompt(false);
    setIsBlockedWordModalOpen(false);
    setMatchedBlockedKeywords([]);
    setBlockedWordSourceText('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCloseAttempt = () => {
    if (title.trim() || hasContentText(content) || selectedTags.length > 0 || isPromotion || profileModeOverride) {
      setShowClosePrompt(true);
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

  const openBlockedWordModal = (
    title: string,
    description: string,
    matchedKeywords: string[],
    sourceText: string,
  ) => {
    setBlockedWordModalTitle(title);
    setBlockedWordModalDescription(description);
    setMatchedBlockedKeywords(matchedKeywords);
    setBlockedWordSourceText(sourceText);
    setIsBlockedWordModalOpen(true);
  };

  const getBlockedWordValidationText = () =>
    [title.trim(), extractTextFromContentBody(toCommunityContentBody(content))].filter(Boolean).join('\n');

  const handleSaveDraft = () => {
    saveCommunityPostDraft({
      title: title.trim(),
      content: toCommunityContentBody(content),
      selectedTags,
      isPromotion,
      profileModeOverride,
      savedAt: new Date().toISOString(),
    });
    handleClose();
  };

  const handleDeleteDraft = () => {
    clearCommunityPostDraft();
    handleClose();
  };

  const handleDiscardChanges = () => {
    handleClose();
  };

  const handleSubmit = async () => {
    try {
      const isSuspended = await fetchCommunitySuspensionStatus(currentUser.accountId);
      if (isSuspended) {
        setIsActivitySuspendedModalOpen(true);
        return;
      }
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : COMMUNITY_ACTIVITY_SUSPENDED_MESSAGE,
        type: 'error',
        duration: 2000,
      });
      return;
    }

    if (!title.trim()) {
      setErrors({ title: '제목을 입력해 주세요.' });
      return;
    }

    if (!hasContentText(content)) {
      setErrors({ content: '내용을 입력해 주세요.' });
      return;
    }

    try {
      const blockedWords = await getBlockedWords();
      const validationText = getBlockedWordValidationText();
      const matchResult = findMatchedBlockedWords(validationText, blockedWords);

      if (matchResult.hasBlockedWords) {
        openBlockedWordModal(
          '금지 키워드가 포함되어 발행할 수 없습니다.',
          '제목 또는 본문에 포함된 금지 키워드를 수정한 뒤 다시 올려주세요.',
          matchResult.matchedKeywords,
          validationText,
        );
        return;
      }
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : '금지 키워드 목록을 확인하지 못했습니다.',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    const author: CommunityContentAuthor = {
      type: 'user',
      id: currentUser.accountId,
      visibility: profileMode === 'anonymous' ? 'anonymous' : 'public',
      displayName: profileMode === 'anonymous' ? '익명' : currentUser.name,
      identifierType: 'name',
      identifierValue: currentUser.name,
    };

    const payload: CommunityContentPayload = {
      title: title.trim(),
      content: toCommunityContentBody(content),
      tagIds: selectedTags,
      status: 'published',
      author,
      flags: {
        isPinned: false,
        isNotice: false,
        isPromoted: isPromotion,
      },
    };

    try {
      const endpoint = isEditMode && editingContent
        ? `/api/mock/community-contents/${editingContent.id}`
        : '/api/mock/community-contents';
      const response = await fetch(endpoint, {
        method: isEditMode ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | { message?: string; matchedKeywords?: string[] }
          | null;

        if (errorData?.matchedKeywords?.length) {
          openBlockedWordModal(
            '금지 키워드가 포함되어 발행할 수 없습니다.',
            '제목 또는 본문에 포함된 금지 키워드를 수정한 뒤 다시 올려주세요.',
            errorData.matchedKeywords,
            getBlockedWordValidationText(),
          );
          return;
        }

        if (errorData?.message === COMMUNITY_ACTIVITY_SUSPENDED_MESSAGE) {
          setIsActivitySuspendedModalOpen(true);
          return;
        }

        throw new Error(errorData?.message || '게시글을 저장하지 못했습니다.');
      }

      const createdContent = (await response.json()) as CommunityContent;
      if (isEditMode) {
        onUpdated?.(createdContent);
      } else {
        clearCommunityPostDraft();
        onCreated?.(createdContent);
      }
      handleClose();
      toaster.create({
        description: isEditMode ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.',
        type: 'success',
        duration: 2000,
      });
      return createdContent;
    } catch (error) {
      toaster.create({
        description: error instanceof Error ? error.message : '게시글 저장에 실패했습니다.',
        type: 'error',
        duration: 2000,
      });
    }
  };

  return (
    <>
      <Flex
        position="fixed"
        inset="0"
        zIndex="80"
        align={{ base: 'stretch', md: 'center' }}
        justify="center"
        bg="blackAlpha.600"
        px={{ base: '0', md: '4' }}
        py={{ base: '0', md: '6' }}
        onClick={handleCloseAttempt}
      >
        <Box
          w="full"
          maxW={{ base: '100%', md: '80vw' }}
          h={{ base: '100dvh', md: 'auto' }}
          maxH={{ md: '92vh' }}
          overflow="hidden"
          rounded={{ base: 'none', md: '28px' }}
          bg="white"
          boxShadow="0 24px 80px rgba(15, 23, 42, 0.18)"
          display="flex"
          flexDirection="column"
          onClick={(event) => event.stopPropagation()}
        >
          <Flex align="center" justify="space-between" px={{ base: '5', md: '10' }} pt={{ base: '6', md: '10' }} pb="4">
            <Text fontSize="20px" fontWeight="700" letterSpacing="-0.02em" color="gray.900">
              {isEditMode ? '글 수정' : '글쓰기'}
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
              <CloseIcon size={24} />
            </ChakraButton>
          </Flex>

          <Box
            px={{ base: '5', md: '10' }}
            pb={{ base: '6', md: '10' }}
            overflowY={{ base: 'auto', md: 'visible' }}
            overflowX="hidden"
            flex="1"
          >
            <Grid
              templateColumns={{ base: '1fr', md: 'minmax(0, 1fr) 252px' }}
              gap={{ base: '5', md: '5' }}
              alignItems="stretch"
            >
              <Box order={{ base: 4, md: 1 }} minW="0">
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
                  _focus={{
                    outline: 'none',
                    borderColor: '#FF6900',
                    boxShadow: '0 0 0 2px rgba(255, 105, 0, 0.18)',
                  }}
                  _focusVisible={{
                    outline: 'none',
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

              <Box order={{ base: 1, md: 2 }} minW="0">
                <Text mb="3" fontSize="16px" fontWeight="700" color="gray.700">
                  작성자
                </Text>
                <Box ref={identityDropdownRef} position="relative">
                    <ChakraButton
                      type="button"
                      onClick={() => {
                        setIsTagDropdownOpen(false);
                        setIsIdentityDropdownOpen((prev) => !prev);
                      }}
                      {...selectButtonStyles}
                    >
                      <HStack gap="2" minW="0">
                        {profileMode === 'real' ? (
                          <Image
                            src={currentUser.avatar || '/images/profiles/real-small.png'}
                            alt={`${currentUser.name} 프로필 이미지`}
                            h="20px"
                            w="20px"
                            rounded="full"
                            objectFit="cover"
                            flexShrink={0}
                          />
                        ) : (
                          <Image
                            src="/images/profiles/anonymous-small.png"
                            alt="익명"
                            h="20px"
                            w="20px"
                            rounded="full"
                            objectFit="cover"
                            flexShrink={0}
                          />
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
                            {selected ? <CheckIcon size={16} /> : null}
                          </ChakraButton>
                        );
                      })}
                    </Box>
                  ) : null}
                </Box>
              </Box>

              <Box order={{ base: 5, md: 3 }} minW="0">
                <Box maxW="full">
                  <ContentEditor
                    format="json"
                    value={content}
                    onChange={(nextValue) => {
                      setContent(nextValue);
                      setErrors((prev) => ({ ...prev, content: undefined }));
                    }}
                    minHeight={editorHeight}
                    maxHeight={editorHeight}
                    placeholder="내용을 입력하세요."
                  />
                </Box>
                <Flex mt="2" minH="20px" justify="space-between">
                  <Text fontSize="12px" color="red.500">
                    {errors.content ?? ''}
                  </Text>
                  <Text fontSize="12px" color="gray.400">
                    제한 없음
                  </Text>
                </Flex>
              </Box>

              <Flex order={{ base: 2, md: 4 }} direction="column" justify="space-between" minH="full" minW="0">
                <Flex direction="column" gap="6">
                  <Box>
                    <Text mb="3" fontSize="16px" fontWeight="700" color="gray.700">
                      태그
                    </Text>
                    <Box ref={tagDropdownRef} position="relative">
                      <ChakraButton
                        type="button"
                        onClick={() => {
                          setIsIdentityDropdownOpen(false);
                          setIsTagDropdownOpen((prev) => !prev);
                        }}
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
                                  {selected ? <CheckIcon size={16} /> : null}
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
                    <SegmentedControl
                      aria-label="게시글 유형 선택"
                      value={isPromotion ? 'promoted' : 'normal'}
                      options={[
                        { label: '일반글', value: 'normal' },
                        { label: '홍보글', value: 'promoted' },
                      ]}
                      onValueChange={(nextValue) => {
                        setIsPromotion(nextValue === 'promoted');
                      }}
                    />
                  </Box>
                </Flex>

                <Flex
                  display={{ base: 'none', md: 'flex' }}
                  mt={{ base: '8', md: '10' }}
                  justify={{ base: 'flex-end', md: 'stretch' }}
                  gap="3"
                  direction={{ base: 'row', md: 'row' }}
                >
                  <Button type="button" variant="ghost" onClick={handleCloseAttempt} minW={{ base: '88px', md: '0' }} flex={{ md: 1 }}>
                    취소
                  </Button>
                  <Button type="button" variant="primary" onClick={handleSubmit} minW={{ base: '122px', md: '0' }} flex={{ md: 1 }}>
                    {isEditMode ? '수정하기' : '올리기'}
                  </Button>
                </Flex>
              </Flex>
            </Grid>

            <Flex
              display={{ base: 'flex', md: 'none' }}
              mt="6"
              justify="flex-end"
              gap="3"
              pb="calc(env(safe-area-inset-bottom, 0px) + 4px)"
            >
              <Button type="button" variant="ghost" minW="88px" onClick={handleCloseAttempt}>
                취소
              </Button>
              <Button type="button" variant="primary" minW="122px" onClick={handleSubmit}>
                {isEditMode ? '수정하기' : '올리기'}
              </Button>
            </Flex>
          </Box>
        </Box>
      </Flex>

      {showClosePrompt ? (
        <Portal>
          <Flex position="fixed" inset="0" zIndex="90" align="center" justify="center" bg="blackAlpha.500" px="4">
            <Box w="full" maxW="sm" rounded="24px" bg="white" p="6" boxShadow="0 20px 60px rgba(15, 23, 42, 0.18)">
              <Text textAlign="center" fontSize="16px" fontWeight="700" color="gray.900">
                {isEditMode ? '변경 사항을 버리시겠습니까?' : '임시 저장 하시겠습니까?'}
              </Text>
              <Text mt="2" textAlign="center" fontSize="14px" color="gray.500">
                {isEditMode
                  ? '수정 중인 내용은 저장되지 않고 사라집니다.'
                  : '작성 중인 글은 브라우저에 임시 저장되며, 다음에 글쓰기를 열면 다시 불러올 수 있습니다.'}
              </Text>

              <Flex mt="5" gap="3">
                {isEditMode ? (
                  <>
                    <Button type="button" variant="outline" onClick={() => setShowClosePrompt(false)} flex="1">
                      계속 수정
                    </Button>
                    <Button type="button" variant="primary" onClick={handleDiscardChanges} flex="1">
                      닫기
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={handleDeleteDraft} flex="1">
                      삭제
                    </Button>
                    <Button type="button" variant="primary" onClick={handleSaveDraft} flex="1">
                      임시 저장
                    </Button>
                  </>
                )}
              </Flex>
            </Box>
          </Flex>
        </Portal>
      ) : null}

      <BlockedWordAlertModal
        isOpen={isBlockedWordModalOpen}
        onClose={() => setIsBlockedWordModalOpen(false)}
        title={blockedWordModalTitle}
        description={blockedWordModalDescription}
        matchedKeywords={matchedBlockedKeywords}
        sourceText={blockedWordSourceText}
      />
      <ActivitySuspendedModal
        isOpen={isActivitySuspendedModalOpen}
        onClose={() => setIsActivitySuspendedModalOpen(false)}
      />
    </>
  );
}

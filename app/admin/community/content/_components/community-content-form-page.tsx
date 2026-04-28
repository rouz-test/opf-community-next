'use client';

import { Box, Flex, Grid, Input, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import ContentEditor, { type ContentEditorJsonValue } from '@/app/admin/components/editor/content-editor';
import BlockedWordAlertModal from '@/app/admin/components/modal/blocked-word-alert-modal';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import AdminButton from '@/app/admin/components/ui/button';
import AdminSwitch from '@/app/admin/components/ui/switch';
import { toaster } from '@/app/admin/components/ui/toaster';
import tagsData from '@/data/mock/tags.json';
import { getBlockedWords } from '@/lib/blocked-words';
import { extractTextFromContentBody, findMatchedBlockedWords } from '@/lib/blocked-word-validator';
import type { CommunityContent, CommunityContentAuthor, CommunityContentBody, CommunityContentPayload } from '@/types/community-content';
import type { Tag } from '@/types/tag';

type CommunityContentFormPageProps = {
  contentId?: string;
};

type DraftSnapshot = {
  draftContentId: string | null;
  title: string;
  content: CommunityContentBody;
  selectedTagIds: string[];
  isNotice: boolean;
  isPinned: boolean;
  isPromoted: boolean;
  author: CommunityContentAuthor;
  savedAt: string;
};

const allTags = tagsData as Tag[];
const sortedTags = [...allTags].sort((a, b) => a.sortOrder - b.sortOrder);
const defaultTag = sortedTags.find((tag) => tag.isDefault) ?? null;
const tags = sortedTags.filter((tag) => !tag.isDefault);
const AUTOSAVE_INTERVAL_MS = 60 * 1000;
const LOCAL_DRAFT_STORAGE_KEY = 'admin-community-content-create-draft';
const FORCE_FRESH_CREATE_SESSION_KEY = 'admin-community-content-force-fresh-create';
const defaultAuthor: CommunityContentAuthor = {
  type: 'admin',
  id: 'admin-1',
  visibility: 'public',
  displayName: '관리자',
  identifierType: 'email',
  identifierValue: 'admin@comasoft.io',
};

function withAlpha(hex: string, alphaHex: string = '66') {
  if (!hex) return hex;
  if (hex.startsWith('#') && hex.length === 7) {
    return `${hex}${alphaHex}`;
  }
  return hex;
}

function createEmptyContentBody(): CommunityContentBody {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
  };
}

function getLocalDraftStorageKey(contentId?: string) {
  if (contentId) {
    return `admin-community-content-edit-draft:${contentId}`;
  }

  return LOCAL_DRAFT_STORAGE_KEY;
}

function hasMeaningfulDraftSnapshot(snapshot: Partial<DraftSnapshot>) {
  const titleText = typeof snapshot.title === 'string' ? snapshot.title.trim() : '';
  const bodyText =
    snapshot.content && typeof snapshot.content === 'object'
      ? extractTextFromContentBody(snapshot.content as CommunityContentBody).trim()
      : '';
  const selectedTags =
    Array.isArray(snapshot.selectedTagIds)
      ? snapshot.selectedTagIds.filter((tagId) => typeof tagId === 'string' && tagId.trim())
      : [];

  return (
    titleText.length > 0 ||
    bodyText.length > 0 ||
    selectedTags.length > 0 ||
    snapshot.isNotice === true ||
    snapshot.isPinned === true ||
    snapshot.isPromoted === true
  );
}

export default function CommunityContentFormPage({ contentId }: CommunityContentFormPageProps) {
  const router = useRouter();
  const isEditMode = Boolean(contentId);

  const [draftContentId, setDraftContentId] = useState<string | null>(contentId ?? null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<CommunityContentBody>(createEmptyContentBody);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isNotice, setIsNotice] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isPromoted, setIsPromoted] = useState(false);
  const [author, setAuthor] = useState<CommunityContentAuthor>(defaultAuthor);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<'draft' | 'publish' | null>(null);
  const [matchedBlockedKeywords, setMatchedBlockedKeywords] = useState<string[]>([]);
  const [blockedWordSourceText, setBlockedWordSourceText] = useState('');
  const [isBlockedWordModalOpen, setIsBlockedWordModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const lastAutosaveFingerprintRef = useRef<string | null>(null);
  const isAutosavingRef = useRef(false);
  const localDraftStorageKey = useMemo(() => getLocalDraftStorageKey(contentId), [contentId]);

  const isWarning = title.length >= 40 && title.length < 50;
  const isError = title.length >= 50;

  const localSnapshot = useMemo<DraftSnapshot>(
    () => ({
      draftContentId,
      title,
      content,
      selectedTagIds,
      isNotice,
      isPinned,
      isPromoted,
      author,
      savedAt: new Date().toISOString(),
    }),
    [author, content, draftContentId, isNotice, isPinned, isPromoted, selectedTagIds, title],
  );

  const currentFingerprint = useMemo(
    () =>
      JSON.stringify({
        draftContentId: localSnapshot.draftContentId,
        title: localSnapshot.title,
        content: localSnapshot.content,
        selectedTagIds: localSnapshot.selectedTagIds,
        isNotice: localSnapshot.isNotice,
        isPinned: localSnapshot.isPinned,
        isPromoted: localSnapshot.isPromoted,
        author: localSnapshot.author,
      }),
    [localSnapshot],
  );

  const hasDraftableChanges = useMemo(() => {
    const contentText = extractTextFromContentBody(content).trim();

    return (
      title.trim().length > 0 ||
      contentText.length > 0 ||
      selectedTagIds.length > 0 ||
      isNotice ||
      isPinned ||
      isPromoted
    );
  }, [content, isNotice, isPinned, isPromoted, selectedTagIds, title]);

  const clearLocalDraftSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(localDraftStorageKey);
  }, [localDraftStorageKey]);

  useEffect(() => {
    if (!contentId) return;

    let isCancelled = false;

    const loadContent = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response = await fetch(`/api/mock/community-contents/${contentId}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(errorData?.message || '콘텐츠를 불러오지 못했습니다.');
        }

        const fetchedContent = (await response.json()) as CommunityContent;

        if (isCancelled) return;

        let nextTitle = fetchedContent.title;
        let nextContent = fetchedContent.content;
        let nextDraftContentId = fetchedContent.id;
        let nextSelectedTagIds = fetchedContent.tagIds.filter((tagId) => tagId !== defaultTag?.id);
        let nextIsNotice = fetchedContent.flags.isNotice;
        let nextIsPinned = fetchedContent.flags.isPinned;
        let nextIsPromoted = fetchedContent.flags.isPromoted;
        let nextAuthor = fetchedContent.author;

        if (typeof window !== 'undefined') {
          try {
            const storedSnapshotRaw = window.localStorage.getItem(localDraftStorageKey);

            if (storedSnapshotRaw) {
              const parsedSnapshot = JSON.parse(storedSnapshotRaw) as Partial<DraftSnapshot>;
              const hasValidDraftId =
                typeof parsedSnapshot.draftContentId !== 'string' ||
                parsedSnapshot.draftContentId.trim() === '' ||
                parsedSnapshot.draftContentId === fetchedContent.id;

              if (hasValidDraftId && hasMeaningfulDraftSnapshot(parsedSnapshot)) {
                if (typeof parsedSnapshot.title === 'string') {
                  nextTitle = parsedSnapshot.title;
                }

                if (parsedSnapshot.content && typeof parsedSnapshot.content === 'object') {
                  nextContent = parsedSnapshot.content as CommunityContentBody;
                }

                if (Array.isArray(parsedSnapshot.selectedTagIds)) {
                  nextSelectedTagIds = parsedSnapshot.selectedTagIds.filter(
                    (tagId) => typeof tagId === 'string' && tagId !== defaultTag?.id,
                  );
                }

                if (typeof parsedSnapshot.isNotice === 'boolean') {
                  nextIsNotice = parsedSnapshot.isNotice;
                }

                if (typeof parsedSnapshot.isPinned === 'boolean') {
                  nextIsPinned = parsedSnapshot.isPinned;
                }

                if (typeof parsedSnapshot.isPromoted === 'boolean') {
                  nextIsPromoted = parsedSnapshot.isPromoted;
                }

                if (parsedSnapshot.author && typeof parsedSnapshot.author === 'object') {
                  nextAuthor = parsedSnapshot.author as CommunityContentAuthor;
                }

                if (
                  typeof parsedSnapshot.draftContentId === 'string' &&
                  parsedSnapshot.draftContentId.trim()
                ) {
                  nextDraftContentId = parsedSnapshot.draftContentId;
                }
              } else {
                clearLocalDraftSnapshot();
              }
            }
          } catch (error) {
            console.error('failed to restore local draft snapshot:', error);
            clearLocalDraftSnapshot();
          }
        }

        setTitle(nextTitle);
        setContent(nextContent);
        setDraftContentId(nextDraftContentId);
        setSelectedTagIds(nextSelectedTagIds);
        setIsNotice(nextIsNotice);
        setIsPinned(nextIsPinned);
        setIsPromoted(nextIsPromoted);
        setAuthor(nextAuthor);
      } catch (error) {
        if (!isCancelled) {
          setLoadError(error instanceof Error ? error.message : '콘텐츠를 불러오지 못했습니다.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          setIsHydrated(true);
        }
      }
    };

    void loadContent();

    return () => {
      isCancelled = true;
    };
  }, [clearLocalDraftSnapshot, contentId, localDraftStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isEditMode) return;

    const shouldForceFreshCreate =
      window.sessionStorage.getItem(FORCE_FRESH_CREATE_SESSION_KEY) === '1';

    if (shouldForceFreshCreate) {
      window.sessionStorage.removeItem(FORCE_FRESH_CREATE_SESSION_KEY);
      clearLocalDraftSnapshot();
      setDraftContentId(null);
      setTitle('');
      setContent(createEmptyContentBody());
      setSelectedTagIds([]);
      setIsNotice(false);
      setIsPinned(false);
      setIsPromoted(false);
      setAuthor(defaultAuthor);
      setIsHydrated(true);
      return;
    }

    try {
      const storedSnapshotRaw = window.localStorage.getItem(localDraftStorageKey);

      if (!storedSnapshotRaw) {
        setIsHydrated(true);
        return;
      }

      const parsedSnapshot = JSON.parse(storedSnapshotRaw) as Partial<DraftSnapshot>;

      if (!hasMeaningfulDraftSnapshot(parsedSnapshot)) {
        clearLocalDraftSnapshot();
        setIsHydrated(true);
        return;
      }

      if (typeof parsedSnapshot.title === 'string') {
        setTitle(parsedSnapshot.title);
      }

      if (parsedSnapshot.content && typeof parsedSnapshot.content === 'object') {
        setContent(parsedSnapshot.content as CommunityContentBody);
      }

      if (Array.isArray(parsedSnapshot.selectedTagIds)) {
        setSelectedTagIds(
          parsedSnapshot.selectedTagIds.filter((tagId) => typeof tagId === 'string'),
        );
      }

      if (typeof parsedSnapshot.isNotice === 'boolean') {
        setIsNotice(parsedSnapshot.isNotice);
      }

      if (typeof parsedSnapshot.isPinned === 'boolean') {
        setIsPinned(parsedSnapshot.isPinned);
      }

      if (typeof parsedSnapshot.isPromoted === 'boolean') {
        setIsPromoted(parsedSnapshot.isPromoted);
      }

      if (parsedSnapshot.author && typeof parsedSnapshot.author === 'object') {
        setAuthor(parsedSnapshot.author as CommunityContentAuthor);
      }

      if (
        typeof parsedSnapshot.draftContentId === 'string' &&
        parsedSnapshot.draftContentId.trim()
      ) {
        setDraftContentId(parsedSnapshot.draftContentId);
      }
    } catch (error) {
      console.error('failed to restore local draft snapshot:', error);
      clearLocalDraftSnapshot();
    } finally {
      setIsHydrated(true);
    }
  }, [clearLocalDraftSnapshot, isEditMode, localDraftStorageKey]);

  useEffect(() => {
    if (!isHydrated || isLoading) return;
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(
      localDraftStorageKey,
      JSON.stringify(localSnapshot),
    );
  }, [isHydrated, isLoading, localDraftStorageKey, localSnapshot]);

  useEffect(() => {
    if (!isHydrated || isLoading) return;

    if (lastAutosaveFingerprintRef.current === null) {
      lastAutosaveFingerprintRef.current = currentFingerprint;
    }
  }, [currentFingerprint, isHydrated, isLoading]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const resolvedTagIds = useMemo(
    () => (selectedTagIds.length > 0 ? selectedTagIds : defaultTag ? [defaultTag.id] : []),
    [selectedTagIds],
  );

  const createPayload = useCallback(
    (status: 'draft' | 'published'): CommunityContentPayload => ({
      title: title.trim() || '제목 없음',
      content,
      tagIds: resolvedTagIds,
      status,
      author,
      flags: {
        isNotice,
        isPinned,
        isPromoted,
      },
    }),
    [author, content, isNotice, isPinned, isPromoted, resolvedTagIds, title],
  );

  const submitContent = useCallback(
    async (
      status: 'draft' | 'published',
      options?: {
        stayOnPage?: boolean;
      },
    ) => {
      const payload = createPayload(status);
      const targetContentId = contentId ?? draftContentId;
      const endpoint = targetContentId
        ? `/api/mock/community-contents/${targetContentId}`
        : '/api/mock/community-contents';
      const method = targetContentId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | { message?: string; matchedKeywords?: string[] }
          | null;
        const error = new Error(errorData?.message || '콘텐츠 저장에 실패했습니다.') as Error & {
          matchedKeywords?: string[];
        };
        error.matchedKeywords = errorData?.matchedKeywords;
        throw error;
      }

      const savedContent = (await response.json()) as CommunityContent;

      if (options?.stayOnPage && !contentId) {
        setDraftContentId(savedContent.id);
      }

      return savedContent;
    },
    [contentId, createPayload, draftContentId],
  );

  const getBlockedWordValidationText = () => [title, extractTextFromContentBody(content)].filter(Boolean).join(' ');

  const validateBlockedWords = async () => {
    const blockedWords = await getBlockedWords();
    const validationText = getBlockedWordValidationText();
    const matchResult = findMatchedBlockedWords(validationText, blockedWords);

    if (matchResult.hasBlockedWords) {
      setMatchedBlockedKeywords(matchResult.matchedKeywords);
      setBlockedWordSourceText(validationText);
      setIsBlockedWordModalOpen(true);
      return false;
    }

    return true;
  };

  const handleSaveDraft = async () => {
    try {
      setLastAction('draft');
      await submitContent('draft');
      clearLocalDraftSnapshot();
      toaster.create({
        description: isEditMode ? '임시저장이 완료되었습니다.' : '콘텐츠가 임시저장되었습니다.',
        type: 'success',
        duration: 2000,
      });
      router.push('/admin/community/content');
    } catch (error) {
      console.error('draft save failed:', error);
      toaster.create({
        description: error instanceof Error ? error.message : '임시저장에 실패했습니다.',
        type: 'error',
        duration: 2000,
      });
    }
  };

  const handlePublish = async () => {
    try {
      const isPublishAllowed = await validateBlockedWords();
      if (!isPublishAllowed) {
        return;
      }

      setLastAction('publish');
      await submitContent('published');
      clearLocalDraftSnapshot();
      toaster.create({
        description: isEditMode ? '콘텐츠 수정이 완료되었습니다.' : '콘텐츠가 발행되었습니다.',
        type: 'success',
        duration: 2000,
      });
      router.push('/admin/community/content');
    } catch (error) {
      if (
        error instanceof Error &&
        'matchedKeywords' in error &&
        Array.isArray((error as Error & { matchedKeywords?: string[] }).matchedKeywords) &&
        (error as Error & { matchedKeywords?: string[] }).matchedKeywords?.length
      ) {
        setMatchedBlockedKeywords((error as Error & { matchedKeywords?: string[] }).matchedKeywords ?? []);
        setBlockedWordSourceText(getBlockedWordValidationText());
        setIsBlockedWordModalOpen(true);
        return;
      }

      console.error('publish failed:', error);
      toaster.create({
        description: error instanceof Error ? error.message : '콘텐츠 발행에 실패했습니다.',
        type: 'error',
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    if (!isHydrated || isLoading) return;
    if (!hasDraftableChanges) return;

    const timerId = window.setInterval(async () => {
      if (isAutosavingRef.current) return;
      if (!hasDraftableChanges) return;
      if (lastAutosaveFingerprintRef.current === currentFingerprint) return;

      try {
        isAutosavingRef.current = true;
        const savedContent = await submitContent('draft', {
          stayOnPage: true,
        });

        lastAutosaveFingerprintRef.current = JSON.stringify({
          draftContentId: savedContent.id,
          title,
          content,
          selectedTagIds,
          isNotice,
          isPinned,
          isPromoted,
          author,
        });

        toaster.create({
          description: isEditMode
            ? '수정 중인 내용이 자동으로 임시저장되었습니다.'
            : '작성 중인 내용이 자동으로 임시저장되었습니다.',
          type: 'info',
          duration: 1800,
        });
      } catch (error) {
        console.error('autosave failed:', error);
        toaster.create({
          description: error instanceof Error ? error.message : '자동 임시저장에 실패했습니다.',
          type: 'error',
          duration: 2000,
        });
      } finally {
        isAutosavingRef.current = false;
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, [
    author,
    content,
    currentFingerprint,
    hasDraftableChanges,
    isHydrated,
    isLoading,
    isNotice,
    isPinned,
    isPromoted,
    isEditMode,
    selectedTagIds,
    submitContent,
    title,
  ]);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader left={null} right={null} />

        <Box borderWidth="1px" borderColor="#E5E7EB" borderRadius="16px" bg="#FFFFFF" px="24px" py="32px">
          <Text fontSize="14px" color="#6B7280">
            콘텐츠를 불러오는 중입니다.
          </Text>
        </Box>
      </PageContainer>
    );
  }

  if (loadError) {
    return (
      <PageContainer>
        <PageHeader left={null} right={null} />

        <Box borderWidth="1px" borderColor="#E5E7EB" borderRadius="16px" bg="#FFFFFF" px="24px" py="32px">
          <Text fontSize="14px" color="#6B7280">
            {loadError}
          </Text>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader left={null} right={null} />

      <Grid templateColumns="minmax(0, 1fr) 240px" gap="24px" alignItems="start">
        <Box
          borderWidth="1px"
          borderColor="#E5E7EB"
          borderRadius="16px"
          bg="#FFFFFF"
          px="28px"
          py="26px"
          minH="760px"
        >
          <Flex direction="column" gap="20px">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 작성해 주세요."
              border="none"
              borderBottomWidth="2px"
              borderColor={isError ? '#EF4444' : isWarning ? '#F59E42' : 'transparent'}
              fontSize="28px"
              fontWeight="700"
              color="#111827"
              maxLength={50}
              _placeholder={{ color: '#C4C7CE' }}
              _focus={{ borderColor: 'transparent', boxShadow: 'none', outline: 'none' }}
              _focusVisible={{ borderColor: 'transparent', boxShadow: 'none', outline: 'none' }}
            />

            <Text
              fontSize="12px"
              textAlign="right"
              color={isError ? '#EF4444' : isWarning ? '#F59E42' : '#9CA3AF'}
            >
              {title.length} / 50
            </Text>

            <Box h="2px" bg="#F59E42" />

            <ContentEditor
              format="json"
              value={content}
              onChange={(nextValue) => setContent(nextValue as CommunityContentBody & ContentEditorJsonValue)}
              minHeight="500px"
            />
          </Flex>
        </Box>

        <Flex direction="column" gap="24px">
          <Box>
            <Text fontSize="14px" fontWeight="700" color="#111827" mb="12px">
              태그
            </Text>
            <Flex direction="column" gap="10px">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);

                return (
                  <Box
                    key={tag.id}
                    as="button"
                    h="36px"
                    borderRadius="8px"
                    borderWidth="1px"
                    borderColor={withAlpha(tag.style.textColor)}
                    bg={isSelected ? tag.style.textColor : tag.style.bgColor}
                    color={isSelected ? tag.style.bgColor : tag.style.textColor}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    px="12px"
                    cursor="pointer"
                    transition="all 0.2s ease"
                    _hover={{ transform: 'translateY(-1px)' }}
                    _focusVisible={{
                      outline: 'none',
                      boxShadow: `0 0 0 2px ${withAlpha(tag.style.textColor, '22')}`,
                    }}
                    onClick={() => {
                      handleToggleTag(tag.id);
                    }}
                  >
                    <Text fontSize="12px" fontWeight="600" lineClamp="1">
                      {tag.name}
                    </Text>
                  </Box>
                );
              })}
            </Flex>
            <Text mt="10px" fontSize="12px" color="#9CA3AF">
              선택된 태그 {selectedTagIds.length}개{selectedTagIds.length === 0 && defaultTag ? ` · 미선택 시 ${defaultTag.name} 자동 적용` : ''}
            </Text>
          </Box>

          <Box>
            <Text fontSize="14px" fontWeight="700" color="#111827" mb="14px">
              상세
            </Text>
            <Flex direction="column" gap="14px">
              <Flex align="center" justify="space-between">
                <Text fontSize="14px" fontWeight="600" color="#374151">
                  공지
                </Text>
                <AdminSwitch checked={isNotice} onCheckedChange={setIsNotice} size="sm" />
              </Flex>

              <Flex align="center" justify="space-between">
                <Text fontSize="14px" fontWeight="600" color="#374151">
                  상단 고정
                </Text>
                <AdminSwitch checked={isPinned} onCheckedChange={setIsPinned} size="sm" />
              </Flex>
            </Flex>
          </Box>

          <Box>
            <Text fontSize="12px" fontWeight="700" color="#6B7280" mb="6px">
              저장
            </Text>
            <Text fontSize="12px" color="#9CA3AF" lineHeight="1.7" whiteSpace="pre-wrap">
              작성 중인 내용은 1분마다 자동으로 임시저장되고,
              수동 임시저장은 목록에서 임시 상태로 표시되며,
              발행 시 즉시 콘텐츠 목록과 상세에서 확인할 수 있습니다.
            </Text>
          </Box>

          <Flex direction="column" gap="10px">
            <AdminButton
              type="button"
              variantStyle="outline"
              size="lg"
              onClick={handleSaveDraft}
              disabled={lastAction === 'publish'}
            >
              임시저장
            </AdminButton>
            <AdminButton
              type="button"
              variantStyle="primary"
              size="lg"
              onClick={handlePublish}
              disabled={lastAction === 'draft'}
            >
              {isEditMode ? '수정 완료' : '발행하기'}
            </AdminButton>
          </Flex>
        </Flex>
      </Grid>

      <BlockedWordAlertModal
        isOpen={isBlockedWordModalOpen}
        onClose={() => setIsBlockedWordModalOpen(false)}
        title="금지 키워드가 포함되어 발행할 수 없습니다."
        description="제목 또는 본문에 포함된 금지 키워드를 수정한 뒤 다시 발행해주세요."
        matchedKeywords={matchedBlockedKeywords}
        sourceText={blockedWordSourceText}
      />
    </PageContainer>
  );
}

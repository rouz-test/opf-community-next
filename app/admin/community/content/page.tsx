'use client';
import { LuTrash2, LuArchive, LuCalendar } from 'react-icons/lu';
import { ChevronDownIcon, SearchIcon } from '@/app/admin/components/ui/icons';
import AdminPageSizeSelect from '@/app/admin/components/ui/table/page-size-select';
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Icon,
  IconButton,
  Table,
  Text,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import tagsData from '@/data/mock/tags.json';
import type { CommunityContent, CommunityContentBody } from '@/types/community-content';
import { resolveTags } from '@/lib/tags';
import type { Tag } from '@/types/tag';
import AdminTagBadge from '@/app/admin/components/ui/tag/tag-badge';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import BaseModal from '@/app/admin/components/modal/base-modal';
import AdminButton from '@/app/admin/components/ui/button';
import AdminBadge from '@/app/admin/components/ui/badge';
import AdminSearchField from '@/app/admin/components/ui/search-field';
import AdminTable, {
  AdminTableBody,
  AdminTableCell,
  AdminTableColumnHeader,
  AdminTableEllipsisText,
  AdminTableHead,
  AdminTableRoot,
  AdminTableRow,
} from '@/app/admin/components/ui/table/admin-table';
import AdminTablePagination, {
  type AdminTablePaginationItem,
} from '@/app/admin/components/ui/table/admin-table-pagination';
import ContentActionMenu from '@/app/admin/components/content-action-menu';
import { Tooltip } from '@/app/admin/components/editor/tooltip';

const DEFAULT_PAGE_SIZE = 13;
const PAGE_SIZE_OPTIONS = [13, 30, 50] as const;
const PAGE_WINDOW = 5;

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): AdminTablePaginationItem[] {
  if (totalPages <= 1) {
    return [
      { type: 'first' },
      { type: 'prev' },
      { type: 'page', value: 1, isActive: true },
      { type: 'next' },
      { type: 'last' },
    ];
  }

  const items: AdminTablePaginationItem[] = [
    { type: 'first' },
    { type: 'prev' },
  ];

  const halfWindow = Math.floor(PAGE_WINDOW / 2);
  let startPage = Math.max(1, currentPage - halfWindow);
  const endPage = Math.min(totalPages, startPage + PAGE_WINDOW - 1);

  if (endPage - startPage + 1 < PAGE_WINDOW) {
    startPage = Math.max(1, endPage - PAGE_WINDOW + 1);
  }

  if (startPage > 1) {
    items.push({ type: 'page', value: 1, isActive: currentPage === 1 });
  }

  if (startPage > 2) {
    items.push({ type: 'ellipsis' });
  }

  for (let page = startPage; page <= endPage; page += 1) {
    items.push({
      type: 'page',
      value: page,
      isActive: currentPage === page,
    });
  }

  if (endPage < totalPages - 1) {
    items.push({ type: 'ellipsis' });
  }

  if (endPage < totalPages) {
    items.push({
      type: 'page',
      value: totalPages,
      isActive: currentPage === totalPages,
    });
  }

  items.push({ type: 'next' }, { type: 'last' });

  return items;
}

const tags = [...(tagsData as Tag[])].sort((a, b) => a.sortOrder - b.sortOrder);
const tagOptions = tags.map((tag) => tag.name);

function extractTextFromTiptapNodes(nodes?: CommunityContentBody[]): string {
  if (!nodes?.length) return '';

  return nodes
    .map((node) => {
      const currentText = node.text ?? '';
      const childText = extractTextFromTiptapNodes(node.content);
      return [currentText, childText].filter(Boolean).join(' ');
    })
    .filter(Boolean)
    .join(' ')
    .trim();
}

function getContentTypeLabel(content: CommunityContent) {
  if (content.author.type === 'admin') {
    return '관리자';
  }

  return content.author.visibility === 'anonymous' ? '익명' : '실명';
}

function getAuthorDisplay(content: CommunityContent) {
  if (content.author.visibility === 'anonymous') {
    return content.author.identifierValue || content.author.id;
  }

  return content.author.displayName || content.author.identifierValue || content.author.id;
}

function getPublishedAtDisplay(content: CommunityContent) {
  if (!content.publishedAt) return '-';

  const publishedAt = new Date(content.publishedAt);
  if (Number.isNaN(publishedAt.getTime())) return '-';

  const yyyy = publishedAt.getFullYear();
  const mm = String(publishedAt.getMonth() + 1).padStart(2, '0');
  const dd = String(publishedAt.getDate()).padStart(2, '0');
  const hh = String(publishedAt.getHours()).padStart(2, '0');
  const min = String(publishedAt.getMinutes()).padStart(2, '0');

  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

function getContentStatusLabel(content: CommunityContent) {
  if (content.status === 'draft') return '임시';
  if (content.status === 'archived') return '보관';
  return '노출';
}

function getContentReferenceDate(content: CommunityContent) {
  const candidate = content.publishedAt ?? content.createdAt;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateDisplay(value: string) {
  if (!value) return 'YYYY.MM.DD';
  return value.replaceAll('-', '.');
}

function getStatusTone(status: string) {
  if (status === '보관') {
    return 'graySolid';
  }

  if (status === '노출') {
    return 'blueSolid';
  }

  if (status === '임시') {
    return 'yellowSolid';
  }

  return 'graySolid';
}



export default function CommunityContentPage() {
  const [contents, setContents] = useState<CommunityContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [archiveTargetIds, setArchiveTargetIds] = useState<string[]>([]);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const startDateInputRef = useRef<HTMLInputElement | null>(null);
  const endDateInputRef = useRef<HTMLInputElement | null>(null);
  const tagFilterRef = useRef<HTMLDivElement | null>(null);
  const flagFilterRef = useRef<HTMLDivElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [isPageSizeMenuOpen, setIsPageSizeMenuOpen] = useState(false);

  type FlagFilter = 'promoted' | 'notice' | 'pinned';
  const [flagFilter, setFlagFilter] = useState<FlagFilter[]>([]);
  const [isFlagFilterOpen, setIsFlagFilterOpen] = useState(false);

  const router = useRouter();

  const loadContents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/mock/community-contents', {
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorData?.message || '콘텐츠 목록을 불러오지 못했습니다.');
      }

      const data = (await response.json()) as { items?: CommunityContent[] };
      setContents(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.error('failed to load community contents:', error);
      window.alert(error instanceof Error ? error.message : '콘텐츠 목록을 불러오지 못했습니다.');
      setContents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContents();
  }, [loadContents]);

  useEffect(() => {
    if (!isTagFilterOpen && !isFlagFilterOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (tagFilterRef.current?.contains(target)) return;
      if (flagFilterRef.current?.contains(target)) return;

      setIsTagFilterOpen(false);
      setIsFlagFilterOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTagFilterOpen(false);
        setIsFlagFilterOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFlagFilterOpen, isTagFilterOpen]);

  const handleNavigateToDetail = (contentId: string) => {
    router.push(`/admin/community/content/${contentId}`);
  };
  const handleNavigateToCreate = () => {
    router.push('/admin/community/content/create');
  };

  const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    const input = ref.current;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.click();
  };

  const handleApplyDateFilter = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1);
    setIsPageSizeMenuOpen(false);
  };

  const handleDeleteContents = useCallback(
    async (contentIds: string[]) => {
      if (contentIds.length === 0) return;

      try {
        setIsMutating(true);

        for (const contentId of contentIds) {
          const response = await fetch(`/api/mock/community-contents/${contentId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
            throw new Error(errorData?.message || '콘텐츠 삭제에 실패했습니다.');
          }
        }

        setContents((prev) => prev.filter((content) => !contentIds.includes(content.id)));
        setSelectedRowKeys((prev) => prev.filter((rowKey) => !contentIds.includes(rowKey)));
      } catch (error) {
        console.error('failed to delete contents:', error);
        window.alert(error instanceof Error ? error.message : '콘텐츠 삭제에 실패했습니다.');
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  const handleArchiveContents = useCallback(
    async (contentIds: string[]) => {
      if (contentIds.length === 0) return;

      try {
        setIsMutating(true);

        const updatedContents: CommunityContent[] = [];

        for (const contentId of contentIds) {
          const targetContent = contents.find((content) => content.id === contentId);

          if (!targetContent || targetContent.status === 'archived') {
            continue;
          }

          const response = await fetch(`/api/mock/community-contents/${contentId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'archived' }),
          });

          if (!response.ok) {
            const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
            throw new Error(errorData?.message || '콘텐츠 보관에 실패했습니다.');
          }

          updatedContents.push((await response.json()) as CommunityContent);
        }

        if (updatedContents.length > 0) {
          const updatedMap = new Map(updatedContents.map((content) => [content.id, content]));
          setContents((prev) =>
            prev.map((content) => updatedMap.get(content.id) ?? content)
          );
        }

        setSelectedRowKeys((prev) => prev.filter((rowKey) => !contentIds.includes(rowKey)));
      } catch (error) {
        console.error('failed to archive contents:', error);
        window.alert(error instanceof Error ? error.message : '콘텐츠 보관에 실패했습니다.');
      } finally {
        setIsMutating(false);
      }
    },
    [contents]
  );

  const handleOpenArchiveModal = useCallback((contentIds: string[]) => {
    if (contentIds.length === 0) return;
    setArchiveTargetIds(contentIds);
  }, []);

  const handleCloseArchiveModal = useCallback(() => {
    if (isMutating) return;
    setArchiveTargetIds([]);
  }, [isMutating]);

  const handleConfirmArchiveContents = useCallback(async () => {
    if (archiveTargetIds.length === 0) return;

    await handleArchiveContents(archiveTargetIds);
    setArchiveTargetIds([]);
  }, [archiveTargetIds, handleArchiveContents]);

  const handleOpenDeleteModal = useCallback((contentIds: string[]) => {
    if (contentIds.length === 0) return;
    setDeleteTargetIds(contentIds);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    if (isMutating) return;
    setDeleteTargetIds([]);
  }, [isMutating]);

  const handleConfirmDeleteContents = useCallback(async () => {
    if (deleteTargetIds.length === 0) return;

    await handleDeleteContents(deleteTargetIds);
    setDeleteTargetIds([]);
  }, [deleteTargetIds, handleDeleteContents]);

  const handleUpdateContent = useCallback(
    async (contentId: string, payload: Partial<CommunityContent>) => {
      try {
        setIsMutating(true);

        const response = await fetch(`/api/mock/community-contents/${contentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(errorData?.message || '콘텐츠 상태 변경에 실패했습니다.');
        }

        const updatedContent = (await response.json()) as CommunityContent;
        setContents((prev) => prev.map((content) => (content.id === updatedContent.id ? updatedContent : content)));
      } catch (error) {
        console.error('failed to update content:', error);
        window.alert(error instanceof Error ? error.message : '콘텐츠 상태 변경에 실패했습니다.');
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  const contentRows = useMemo(
    () =>
      contents.map((content) => ({
        id: content.id,
        type: getContentTypeLabel(content),
        title: content.title,
        bodyText: extractTextFromTiptapNodes(content.content.content),
        author: getAuthorDisplay(content),
        publishedAt: getPublishedAtDisplay(content),
        referenceDate: getContentReferenceDate(content),
        viewCount: content.stats.viewCount,
        status: getContentStatusLabel(content),
        isPromoted: content.flags.isPromoted,
        isNotice: content.flags.isNotice,
        tags: resolveTags(content.tagIds, tags),
        originalContent: content,
      })),
    [contents]
  );

  const handlePaginationItemClick = (item: AdminTablePaginationItem) => {
    if (item.type === 'first') {
      setCurrentPage(1);
      return;
    }
  
    if (item.type === 'prev') {
      setCurrentPage((prev) => Math.max(1, prev - 1));
      return;
    }
  
    if (item.type === 'next') {
      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
      return;
    }
  
    if (item.type === 'last') {
      setCurrentPage(totalPages);
      return;
    }
  
    if (item.type === 'page' && typeof item.value === 'number') {
      setCurrentPage(item.value);
    }
  };

  const normalizedSearchKeyword = appliedSearchKeyword.trim().toLowerCase();

  const filteredRows = useMemo(
    () =>
      contentRows.filter((row) => {
        const referenceDate = row.referenceDate;

        if (appliedStartDate) {
          if (!referenceDate) return false;
          const start = new Date(appliedStartDate);
          start.setHours(0, 0, 0, 0);
          if (referenceDate < start) return false;
        }

        if (appliedEndDate) {
          if (!referenceDate) return false;
          const end = new Date(appliedEndDate);
          end.setHours(23, 59, 59, 999);
          if (referenceDate > end) return false;
        }

        if (selectedTags.length > 0) {
          const hasSelectedTag = row.tags.some((tag) => selectedTags.includes(tag.name));
          if (!hasSelectedTag) {
            return false;
          }
        }

        if (flagFilter.length > 0) {
          const matches = [];
        
          if (flagFilter.includes('promoted')) matches.push(row.isPromoted);
          if (flagFilter.includes('notice')) matches.push(row.isNotice);
          if (flagFilter.includes('pinned')) matches.push(row.originalContent.flags.isPinned);
        
          if (!matches.some(Boolean)) return false;
        }
        
        if (normalizedSearchKeyword) {
          const searchTarget = [
            row.title,
            row.bodyText,
            row.author,
            row.type,
            ...row.tags.map((tag) => tag.name),
          ]
            .join(' ')
            .toLowerCase();

          if (!searchTarget.includes(normalizedSearchKeyword)) {
            return false;
          }
        }

        return true;
      }),
    [appliedEndDate, appliedStartDate, contentRows, flagFilter, normalizedSearchKeyword, selectedTags]
  );

  const totalCount = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageSafe - 1) * pageSize,
    currentPageSafe * pageSize,
  );
  const paginationItems = getPaginationItems(currentPageSafe, totalPages);
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleRowKeys = pagedRows.map((row) => row.id);
  const isAllSelected = visibleRowKeys.length > 0 && visibleRowKeys.every((key) => selectedRowKeys.includes(key));
  const isIndeterminate = selectedRowKeys.length > 0 && !isAllSelected;

  const handleToggleAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(visibleRowKeys);
      return;
    }

    setSelectedRowKeys([]);
  };

  const handleToggleRow = (rowKey: string, checked: boolean) => {
    setSelectedRowKeys((prev) => {
      if (checked) {
        return prev.includes(rowKey) ? prev : [...prev, rowKey];
      }

      return prev.filter((key) => key !== rowKey);
    });
  };

  const tagFilterLabel = selectedTags.length > 0 ? `태그 ${selectedTags.length}개` : '태그';

  return (
    <PageContainer>
      <PageHeader
        left={
          <Flex direction="column" gap="12px">
            <Flex direction="column" gap="12px">
              <Flex wrap="wrap" align="center" gap="8px">
                <Flex
                  align="stretch"
                  overflow="hidden"
                  borderWidth="1px"
                  borderColor="#D1D5DB"
                  borderRadius="12px"
                  bg="#FFFFFF"
                >
                  <Flex
                    h="40px"
                    minW="68px"
                    align="center"
                    justify="center"
                    borderRightWidth="1px"
                    borderRightColor="#D1D5DB"
                    bg="#F3F4F6"
                    px="16px"
                  >
                    <Text fontSize="13px" fontWeight="700" color="#111827">
                      일시
                    </Text>
                  </Flex>

                  <Box position="relative">
                    <input
                      ref={startDateInputRef}
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        pointerEvents: 'none',
                      }}
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      h="40px"
                      minW="146px"
                      borderRadius="0"
                      borderRightWidth="1px"
                      borderRightColor="#D1D5DB"
                      bg="#FFFFFF"
                      px="14px"
                      _hover={{ bg: '#F9FAFB' }}
                      onClick={() => openDatePicker(startDateInputRef)}
                    >
                      <Flex align="center" justify="space-between" w="100%" gap="8px">
                        <Text
                          as="span"
                          fontSize="13px"
                          fontWeight="500"
                          color={startDate ? '#374151' : '#9CA3AF'}
                        >
                          {formatDateDisplay(startDate)}
                        </Text>
                        <Icon as={LuCalendar} boxSize="14px" color="#9CA3AF" />
                      </Flex>
                    </Button>
                  </Box>

                  <Box position="relative">
                    <input
                      ref={endDateInputRef}
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        pointerEvents: 'none',
                      }}
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      h="40px"
                      minW="146px"
                      borderRadius="0"
                      borderRightWidth="1px"
                      borderRightColor="#D1D5DB"
                      bg="#FFFFFF"
                      px="14px"
                      _hover={{ bg: '#F9FAFB' }}
                      onClick={() => openDatePicker(endDateInputRef)}
                    >
                      <Flex align="center" justify="space-between" w="100%" gap="8px">
                        <Text
                          as="span"
                          fontSize="13px"
                          fontWeight="500"
                          color={endDate ? '#374151' : '#9CA3AF'}
                        >
                          {formatDateDisplay(endDate)}
                        </Text>
                        <Icon as={LuCalendar} boxSize="14px" color="#9CA3AF" />
                      </Flex>
                    </Button>
                  </Box>

                  <IconButton
                    type="button"
                    aria-label="기간 검색"
                    h="40px"
                    w="44px"
                    minW="44px"
                    borderRadius="0"
                    bg="#FFFFFF"
                    color="#111827"
                    _hover={{ bg: '#F9FAFB' }}
                    onClick={handleApplyDateFilter}
                  >
                    <SearchIcon />
                  </IconButton>
                </Flex>

                <Box ref={tagFilterRef} position="relative">
                  <Button
                    type="button"
                    variant="outline"
                    h="40px"
                    px="16px"
                    borderRadius="8px"
                    borderColor="#E5E7EB"
                    bg="#FFFFFF"
                    color="#374151"
                    fontSize="13px"
                    fontWeight="500"
                    _hover={{ bg: '#F9FAFB' }}
                    onClick={() => {
                      setIsTagFilterOpen((prev) => !prev);
                      setIsFlagFilterOpen(false);
                    }}
                  >
                    <Flex align="center" gap="8px">
                      <Text as="span">{tagFilterLabel}</Text>
                      <ChevronDownIcon />
                    </Flex>
                  </Button>

                  {isTagFilterOpen ? (
                    <Box
                      position="absolute"
                      top="calc(100% + 8px)"
                      left="0"
                      minW="220px"
                      borderWidth="1px"
                      borderColor="#E5E7EB"
                      borderRadius="12px"
                      bg="#FFFFFF"
                      boxShadow="0 12px 32px rgba(17, 24, 39, 0.12)"
                      p="8px"
                      zIndex={20}
                    >
                      <CheckboxGroup
                        value={selectedTags}
                        onValueChange={(values) => {
                          setSelectedTags([...values]);
                          setCurrentPage(1);
                        }}
                      >
                        <Flex direction="column" gap="2px">
                          {tagOptions.map((tag) => (
                            <Checkbox.Root
                              key={tag}
                              value={tag}
                              size="sm"
                              px="10px"
                              py="8px"
                              borderRadius="8px"
                              _hover={{ bg: '#F9FAFB' }}
                            >
                              <Checkbox.HiddenInput />
                              <Flex align="center" gap="8px">
                                <Checkbox.Control />
                                <Checkbox.Label>
                                  <Text fontSize="13px" fontWeight="500" color="#374151">
                                    {tag}
                                  </Text>
                                </Checkbox.Label>
                              </Flex>
                            </Checkbox.Root>
                          ))}
                        </Flex>
                      </CheckboxGroup>
                    </Box>
                  ) : null}
                </Box>

                <Box ref={flagFilterRef} position="relative" ml="auto">
                  <Button
                    variant="outline"
                    h="40px"
                    px="16px"
                    borderRadius="8px"
                    borderColor="#E5E7EB"
                    bg="#FFFFFF"
                    color="#374151"
                    fontSize="13px"
                    fontWeight="500"
                    _hover={{ bg: '#F9FAFB' }}
                    onClick={() => {
                      setIsFlagFilterOpen((prev) => !prev);
                      setIsTagFilterOpen(false);
                    }}
                  >
                    <Flex align="center" gap="8px">
                      <Text>
                       {flagFilter.length === 0
                        ? '전체'
                        : `선택 ${flagFilter.length}개`}
                      </Text>
                      <ChevronDownIcon />
                    </Flex>
                  </Button>

                  {isFlagFilterOpen && (
                    <Box
                      position="absolute"
                      top="calc(100% + 8px)"
                      right="0"
                      minW="160px"
                      borderWidth="1px"
                      borderColor="#E5E7EB"
                      borderRadius="12px"
                      bg="#FFFFFF"
                      boxShadow="0 12px 32px rgba(17, 24, 39, 0.12)"
                      p="6px"
                      zIndex={20}
                    >
                      <CheckboxGroup
                        value={flagFilter}
                        onValueChange={(values) => {
                          setFlagFilter(values as FlagFilter[]);
                          setCurrentPage(1);
                        }}
                      >
                        <Flex direction="column" gap="2px">
                          {[
                            { label: '홍보글', value: 'promoted' },
                            { label: '공지글', value: 'notice' },
                            { label: '고정글', value: 'pinned' },
                          ].map((option) => (
                            <Checkbox.Root
                              key={option.value}
                              value={option.value}
                              size="sm"
                              px="10px"
                              py="8px"
                              borderRadius="8px"
                              _hover={{ bg: '#F9FAFB' }}
                            >
                              <Checkbox.HiddenInput />
                              <Flex align="center" gap="8px">
                                <Checkbox.Control />
                                <Checkbox.Label>
                                  <Text fontSize="13px" fontWeight="500" color="#374151">
                                    {option.label}
                                  </Text>
                                </Checkbox.Label>
                              </Flex>
                            </Checkbox.Root>
                          ))}
                        </Flex>
                      </CheckboxGroup>
                    </Box>
                  )}
                </Box>
              </Flex>

            </Flex>

          </Flex>
        }
        right={null}
      />

      <Flex align="center" justify="space-between" gap="12px" mb="4px">
      <Box flex="1" minW="640px" maxW="840px">
        <AdminSearchField
          w="480px"
          placeholder="제목 / 내용 / 작성자명"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onEnter={(value) => {
            setAppliedSearchKeyword(value);
            setSelectedRowKeys([]);
            setCurrentPage(1);
            setIsPageSizeMenuOpen(false);
          }}
        />
      </Box>

        <Flex align="center" gap="8px">
          <AdminPageSizeSelect
            value={pageSize}
            options={PAGE_SIZE_OPTIONS}
            isOpen={isPageSizeMenuOpen}
            onToggle={() => setIsPageSizeMenuOpen((prev) => !prev)}
            onSelect={(value) => {
              setPageSize(value);
              setCurrentPage(1);
              setIsPageSizeMenuOpen(false);
            }}
          />

          <AdminButton
            type="button"
            variantStyle="outline"
            size="sm"
            disabled={selectedRowKeys.length === 0 || isMutating}
            onClick={() => {
              handleOpenArchiveModal(selectedRowKeys);
            }}
          >
            <Flex align="center" gap="6px">
              <Icon as={LuArchive} boxSize="14px" />
              <Text as="span">선택 항목 보관</Text>
            </Flex>
          </AdminButton>

          <AdminButton
            type="button"
            variantStyle="outline"
            size="sm"
            disabled={selectedRowKeys.length === 0 || isMutating}
            onClick={() => {
              handleOpenDeleteModal(selectedRowKeys);
            }}
          >
            <Flex align="center" gap="6px">
              <Icon as={LuTrash2} boxSize="14px" />
              <Text as="span">선택 항목 삭제</Text>
            </Flex>
          </AdminButton>

          <AdminButton type="button" variantStyle="primary" size="sm" onClick={handleNavigateToCreate}>
            글 작성
          </AdminButton>
        </Flex>
      </Flex>
      {isLoading ? (
        <Box borderWidth="1px" borderColor="#E5E7EB" borderRadius="16px" bg="#FFFFFF" px="24px" py="32px">
          <Text fontSize="14px" color="#6B7280">
            콘텐츠 목록을 불러오는 중입니다.
          </Text>
        </Box>
      ) : (
      <>
      <AdminTable>
        <AdminTableRoot>
          <AdminTableHead>
            <Table.Row>
              <AdminTableColumnHeader w="44px" textAlign="center" px="16px">
                <Checkbox.Root
                  size="sm"
                  checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
                  onCheckedChange={(details) => handleToggleAllRows(details.checked === true)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              </AdminTableColumnHeader>
              <AdminTableColumnHeader w="72px">번호</AdminTableColumnHeader>
              <AdminTableColumnHeader w="88px">구분</AdminTableColumnHeader>
              <AdminTableColumnHeader w="180px">태그</AdminTableColumnHeader>
              <AdminTableColumnHeader minW="320px">제목</AdminTableColumnHeader>
              <AdminTableColumnHeader w="120px">작성자</AdminTableColumnHeader>
              <AdminTableColumnHeader w="160px">발행일시</AdminTableColumnHeader>
              <AdminTableColumnHeader w="96px" textAlign="center">조회수</AdminTableColumnHeader>
              <AdminTableColumnHeader w="96px" textAlign="center">상태</AdminTableColumnHeader>
              <AdminTableColumnHeader w="56px" textAlign="center">액션</AdminTableColumnHeader>
            </Table.Row>
          </AdminTableHead>

          <AdminTableBody>
            {pagedRows.map((row, index) => {
              const rowKey = row.id;

              return (
              <AdminTableRow key={rowKey}>
                <AdminTableCell textAlign="center" px="16px">
                  <Checkbox.Root
                    size="sm"
                    checked={selectedRowKeys.includes(rowKey)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isMutating}
                    onCheckedChange={(details) => handleToggleRow(rowKey, details.checked === true)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </AdminTableCell>
                <AdminTableCell
                  fontWeight="600"
                  color="#374151"
                  cursor="pointer"
                  onClick={() => handleNavigateToDetail(row.id)}
                >
                  {(currentPageSafe - 1) * pageSize + index + 1}
                </AdminTableCell>
                <AdminTableCell
                  color="#4B5563"
                  cursor="pointer"
                  onClick={() => handleNavigateToDetail(row.id)}
                >
                  {row.type}
                </AdminTableCell>
                <AdminTableCell cursor="pointer" onClick={() => handleNavigateToDetail(row.id)}>
                  {row.tags.length > 1 ? (
                    <Tooltip
                      content={row.tags
                        .slice(1)
                        .map((tag) => tag.name)
                        .join(', ')}
                      positioning={{ placement: 'top' }}
                      openDelay={150}
                      closeDelay={50}
                      contentProps={{
                        maxW: '280px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                    >
                      <Flex align="center" gap="6px" minW="0" wrap="nowrap">
                        {row.tags.slice(0, 1).map((tag) => (
                          <Box key={tag.id} flexShrink={0}>
                            <AdminTagBadge tag={tag} />
                          </Box>
                        ))}
                        <Text fontSize="12px" fontWeight="600" color="#6B7280" flexShrink={0}>
                          +{row.tags.length - 1}
                        </Text>
                      </Flex>
                    </Tooltip>
                  ) : (
                    <Flex align="center" gap="6px" minW="0" wrap="nowrap">
                      {row.tags.slice(0, 1).map((tag) => (
                        <Box key={tag.id} flexShrink={0}>
                          <AdminTagBadge tag={tag} />
                        </Box>
                      ))}
                    </Flex>
                  )}
                </AdminTableCell>
                <AdminTableCell cursor="pointer" onClick={() => handleNavigateToDetail(row.id)}>
                  <Flex align="center" gap="8px" minW="0">
                    {row.isNotice ? (
                      <AdminBadge
                        tone="orangeSolid"
                        rounded="md"
                        h="20px"
                        px="6px"
                        fontSize="10px"
                        fontWeight="700"
                        flexShrink={0}
                      >
                        공지
                      </AdminBadge>
                    ) : null}
                    {row.originalContent.flags.isPinned ? (
                      <AdminBadge
                        tone="blueSolid"
                        rounded="md"
                        h="20px"
                        px="6px"
                        fontSize="10px"
                        fontWeight="700"
                        flexShrink={0}
                      >
                        고정
                      </AdminBadge>
                    ) : null}
                    {row.isPromoted ? (
                      <AdminBadge
                        tone="purple"
                        rounded="md"
                        h="20px"
                        px="6px"
                        fontSize="10px"
                        fontWeight="700"
                        flexShrink={0}
                      >
                        홍보
                      </AdminBadge>
                    ) : null}
                    <AdminTableEllipsisText
                      flex="1"
                      minW="0"
                      fontSize="13px"
                      fontWeight="500"
                      color="#111827"
                    >
                      {row.title}
                    </AdminTableEllipsisText>
                  </Flex>
                </AdminTableCell>
                <AdminTableCell
                  fontWeight="500"
                  color="#4B5563"
                  cursor="pointer"
                  onClick={() => handleNavigateToDetail(row.id)}
                >
                  <AdminTableEllipsisText flex="1" minW="0">
                    {row.author}
                  </AdminTableEllipsisText>
                </AdminTableCell>
                <AdminTableCell
                  color="#6B7280"
                  cursor="pointer"
                  onClick={() => handleNavigateToDetail(row.id)}
                >
                  <AdminTableEllipsisText flex="1" minW="0">
                    {row.publishedAt}
                  </AdminTableEllipsisText>
                </AdminTableCell>
                <AdminTableCell
                  textAlign="center"
                  fontWeight="500"
                  color="#374151"
                  cursor="pointer"
                  onClick={() => handleNavigateToDetail(row.id)}
                >
                  {row.viewCount}
                </AdminTableCell>
                <AdminTableCell
                  textAlign="center"
                  cursor="pointer"
                  onClick={() => handleNavigateToDetail(row.id)}
                >
                  <AdminBadge
                    tone={getStatusTone(row.status)}
                    h="24px"
                    px="12px"
                    fontSize="11px"
                    fontWeight="700"
                  >
                    {row.status}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell textAlign="center">
                <ContentActionMenu
                  content={row.originalContent}
                  isSubmitting={isMutating}
                  onArchiveToggle={() => {
                    void handleUpdateContent(row.id, {
                      status: row.originalContent.status === 'archived' ? 'published' : 'archived',
                    });
                  }}
                  onPinnedToggle={() => {
                    void handleUpdateContent(row.id, {
                      flags: {
                        ...row.originalContent.flags,
                        isPinned: !row.originalContent.flags.isPinned,
                      },
                    });
                  }}
                  onNoticeToggle={() => {
                    void handleUpdateContent(row.id, {
                      flags: {
                        ...row.originalContent.flags,
                        isNotice: !row.originalContent.flags.isNotice,
                      },
                    });
                  }}
                  onEdit={() => router.push(`/admin/community/content/${row.id}/edit`)}
                  onDelete={() => {
                    handleOpenDeleteModal([row.id]);
                  }}
                />
                </AdminTableCell>
              </AdminTableRow>
              );
            })}
          </AdminTableBody>
        </AdminTableRoot>
      </AdminTable>

      <Flex justify="space-between" align="center" mt="4px">
        <Text fontSize="13px" fontWeight="500" color="#4B5563">
         항목 수 : {totalCount}
        </Text>

        <AdminTablePagination
          items={paginationItems}
          onItemClick={handlePaginationItemClick}
        />
      </Flex>
      </>
      )}

      <BaseModal
        isOpen={archiveTargetIds.length > 0}
        onClose={handleCloseArchiveModal}
        title="콘텐츠 보관"
        footer={
          <Flex gap="8px" w="100%">
            <AdminButton
              type="button"
              variantStyle="outline"
              size="md"
              onClick={handleCloseArchiveModal}
              disabled={isMutating}
              flex={1}
            >
              취소
            </AdminButton>
            <AdminButton
              type="button"
              variantStyle="primary"
              size="md"
              onClick={() => {
                void handleConfirmArchiveContents();
              }}
              disabled={isMutating}
              flex={1}
            >
              보관하기
            </AdminButton>
          </Flex>
        }
      >
        <Flex direction="column" gap="8px">
          <Text fontSize="14px" fontWeight="600" color="#111827">
            선택한 콘텐츠를 보관하시겠습니까?
          </Text>
          <Text fontSize="13px" color="#6B7280">
            보관 대상: {archiveTargetIds.length === 1 ? '1개' : `${archiveTargetIds.length}개`}
          </Text>
        </Flex>
      </BaseModal>

      <BaseModal
        isOpen={deleteTargetIds.length > 0}
        onClose={handleCloseDeleteModal}
        title="콘텐츠 삭제"
        footer={
          <Flex gap="8px" w="100%">
            <AdminButton
              type="button"
              variantStyle="outline"
              size="md"
              onClick={handleCloseDeleteModal}
              disabled={isMutating}
              flex={1}
            >
              취소
            </AdminButton>
            <AdminButton
              type="button"
              variantStyle="primary"
              size="md"
              onClick={() => {
                void handleConfirmDeleteContents();
              }}
              disabled={isMutating}
              flex={1}
            >
              삭제하기
            </AdminButton>
          </Flex>
        }
      >
        <Flex direction="column" gap="8px">
          <Text fontSize="14px" fontWeight="600" color="#111827">
            선택한 콘텐츠를 삭제하시겠습니까?
          </Text>
          <Text fontSize="13px" color="#6B7280">
            삭제 대상: {deleteTargetIds.length === 1 ? '1개' : `${deleteTargetIds.length}개`}
          </Text>
        </Flex>
      </BaseModal>
    </PageContainer>
  );
}

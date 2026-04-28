'use client';
import { LuTrash2, LuArchive, LuCalendar, LuChevronDown, LuSearch } from 'react-icons/lu';
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
import { fetchCommunityContentList } from '@/lib/community-contents';
import type {
  CommunityContent,
  CommunityContentBody,
  CommunityContentListAuthorFilter,
  CommunityContentListFlagFilter,
  CommunityContentListResponse,
  CommunityContentListSortDirection,
  CommunityContentListSortKey,
} from '@/types/community-content';
import { resolveTags } from '@/lib/tags';
import type { Tag } from '@/types/tag';
import AdminTagBadge from '@/app/admin/components/ui/tag/tag-badge';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import BaseModal from '@/app/admin/components/modal/base-modal';
import AdminButton from '@/app/admin/components/ui/button';
import AdminBadge from '@/app/admin/components/ui/badge';
import AdminSearchField from '@/app/admin/components/ui/search-field';
import { toaster } from '@/app/admin/components/ui/toaster';
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
const FORCE_FRESH_CREATE_SESSION_KEY = 'admin-community-content-force-fresh-create';

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
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
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
  const authorFilterRef = useRef<HTMLDivElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [isPageSizeMenuOpen, setIsPageSizeMenuOpen] = useState(false);

  type SortKey = CommunityContentListSortKey | null;
  type SortDirection = CommunityContentListSortDirection;
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  type FlagFilter = CommunityContentListFlagFilter;
  const [flagFilter, setFlagFilter] = useState<FlagFilter[]>([]);
  const [isFlagFilterOpen, setIsFlagFilterOpen] = useState(false);

  type AuthorFilter = CommunityContentListAuthorFilter;
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>('all');
  const [isAuthorFilterOpen, setIsAuthorFilterOpen] = useState(false);

  const router = useRouter();

  const loadContents = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = (await fetchCommunityContentList({
        page: currentPage,
        pageSize,
        search: appliedSearchKeyword.trim(),
        startDate: appliedStartDate,
        endDate: appliedEndDate,
        authorType: authorFilter,
        tags: selectedTags,
        flags: flagFilter,
        sortKey: sortKey ?? undefined,
        sortDirection,
      })) as CommunityContentListResponse;

      setContents(data.items);
      setTotalCount(data.meta.totalCount);
      setTotalPages(data.meta.totalPages);

      if (data.meta.page !== currentPage) {
        setCurrentPage(data.meta.page);
      }

      if (data.meta.pageSize !== pageSize) {
        setPageSize(data.meta.pageSize);
      }
    } catch (error) {
      console.error('failed to load community contents:', error);
      window.alert(error instanceof Error ? error.message : '콘텐츠 목록을 불러오지 못했습니다.');
      setContents([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [
    appliedEndDate,
    appliedSearchKeyword,
    appliedStartDate,
    authorFilter,
    currentPage,
    flagFilter,
    pageSize,
    selectedTags,
    sortDirection,
    sortKey,
  ]);

  useEffect(() => {
    void loadContents();
  }, [loadContents]);

  useEffect(() => {
    if (!isTagFilterOpen && !isFlagFilterOpen && !isAuthorFilterOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (tagFilterRef.current?.contains(target)) return;
      if (flagFilterRef.current?.contains(target)) return;
      if (authorFilterRef.current?.contains(target)) return;

      setIsTagFilterOpen(false);
      setIsFlagFilterOpen(false);
      setIsAuthorFilterOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTagFilterOpen(false);
        setIsFlagFilterOpen(false);
        setIsAuthorFilterOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthorFilterOpen, isFlagFilterOpen, isTagFilterOpen]);

  const handleNavigateToDetail = (contentId: string) => {
    router.push(`/admin/community/content/${contentId}`);
  };
  const handleNavigateToCreate = () => {
    window.sessionStorage.setItem(FORCE_FRESH_CREATE_SESSION_KEY, '1');
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

          toaster.create({
            description:
              updatedContents.length === 1
                ? '콘텐츠가 보관되었습니다.'
                : `${updatedContents.length}개의 콘텐츠가 보관되었습니다.`,
            type: 'success',
            duration: 2000,
          });
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

        if (payload.status !== undefined) {
          toaster.create({
            description:
              payload.status === 'archived'
                ? '콘텐츠가 보관되었습니다.'
                : '콘텐츠가 노출로 전환되었습니다.',
            type: 'success',
            duration: 2000,
          });
        } else if (payload.flags?.isPinned !== undefined) {
          toaster.create({
            description: payload.flags.isPinned ? '콘텐츠가 고정되었습니다.' : '콘텐츠 고정이 해제되었습니다.',
            type: 'success',
            duration: 2000,
          });
        } else if (payload.flags?.isNotice !== undefined) {
          toaster.create({
            description: payload.flags.isNotice ? '콘텐츠가 공지로 지정되었습니다.' : '콘텐츠 공지 지정이 해제되었습니다.',
            type: 'success',
            duration: 2000,
          });
        }
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

  const handleSort = (key: SortKey) => {
    setCurrentPage(1);
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDirection('desc');
        return key;
      }

      setSortDirection((prevDir) => {
        if (prevDir === 'desc') return 'asc';
        // asc -> none
        setSortKey(null);
        return 'desc';
      });

      return prevKey;
    });
  };

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

  const filteredRows = contentRows;
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows;
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
                    <Icon as={LuSearch} boxSize="16px" />
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
                      <Icon as={LuChevronDown} boxSize="16px" />
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
                      <Icon as={LuChevronDown} boxSize="16px" />
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

                <Box ref={authorFilterRef} position="relative">
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
                      setIsAuthorFilterOpen((prev) => !prev);
                      setIsTagFilterOpen(false);
                      setIsFlagFilterOpen(false);
                    }}
                  >
                    <Flex align="center" gap="8px">
                      <Text>
                        {authorFilter === 'all' ? '작성자 전체' : authorFilter === 'admin' ? '관리자' : '사용자'}
                      </Text>
                      <Icon as={LuChevronDown} boxSize="16px" />
                    </Flex>
                  </Button>

                  {isAuthorFilterOpen ? (
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
                      {[
                        { label: '전체', value: 'all' },
                        { label: '관리자', value: 'admin' },
                        { label: '사용자', value: 'user' },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant="ghost"
                          w="100%"
                          justifyContent="flex-start"
                          h="36px"
                          px="10px"
                          borderRadius="8px"
                          fontSize="13px"
                          fontWeight="500"
                          color="#374151"
                          _hover={{ bg: '#F9FAFB' }}
                          onClick={() => {
                            setAuthorFilter(option.value as AuthorFilter);
                            setCurrentPage(1);
                            setIsAuthorFilterOpen(false);
                          }}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </Box>
                  ) : null}
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
              <AdminTableColumnHeader w="60px">번호</AdminTableColumnHeader>
              <AdminTableColumnHeader w="72px">구분</AdminTableColumnHeader>
              <AdminTableColumnHeader w="150px">태그</AdminTableColumnHeader>
              <AdminTableColumnHeader minW="320px">제목</AdminTableColumnHeader>
              <AdminTableColumnHeader w="100px">작성자</AdminTableColumnHeader>
              <AdminTableColumnHeader w="140px">
                <Flex align="center" gap="4px" cursor="pointer" onClick={() => handleSort('date')}>
                  <Text>발행일시</Text>
                  <Icon
                    as={LuChevronDown}
                    boxSize="14px"
                    transform={sortKey === 'date' && sortDirection === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'}
                    opacity={sortKey === 'date' ? 1 : 0.3}
                  />
                </Flex>
              </AdminTableColumnHeader>
              <AdminTableColumnHeader w="80px" textAlign="center">
                <Flex align="center" justify="center" gap="4px" cursor="pointer" onClick={() => handleSort('view')}>
                  <Text>조회수</Text>
                  <Icon
                    as={LuChevronDown}
                    boxSize="14px"
                    transform={sortKey === 'view' && sortDirection === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'}
                    opacity={sortKey === 'view' ? 1 : 0.3}
                  />
                </Flex>
              </AdminTableColumnHeader>
              <AdminTableColumnHeader w="80px" textAlign="center">
                <Flex align="center" justify="center" gap="4px" cursor="pointer" onClick={() => handleSort('comment')}>
                  <Text>댓글</Text>
                  <Icon
                    as={LuChevronDown}
                    boxSize="14px"
                    transform={sortKey === 'comment' && sortDirection === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'}
                    opacity={sortKey === 'comment' ? 1 : 0.3}
                  />
                </Flex>
              </AdminTableColumnHeader>
              <AdminTableColumnHeader w="80px" textAlign="center">
                <Flex align="center" justify="center" gap="4px" cursor="pointer" onClick={() => handleSort('like')}>
                  <Text>좋아요</Text>
                  <Icon
                    as={LuChevronDown}
                    boxSize="14px"
                    transform={sortKey === 'like' && sortDirection === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'}
                    opacity={sortKey === 'like' ? 1 : 0.3}
                  />
                </Flex>
              </AdminTableColumnHeader>
              <AdminTableColumnHeader w="96px" textAlign="center">상태</AdminTableColumnHeader>
              <AdminTableColumnHeader w="56px" textAlign="center">액션</AdminTableColumnHeader>
            </Table.Row>
          </AdminTableHead>

          <AdminTableBody>
            {pagedRows.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={12} textAlign="center" py="24px">
                  <Text fontSize="13px" color="#6B7280">
                    검색 결과가 없습니다.
                  </Text>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              pagedRows.map((row, index) => {
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
                  <AdminTableCell textAlign="center" color="#374151">
                    {row.originalContent.stats.commentCount + row.originalContent.stats.replyCount}
                  </AdminTableCell>
                  <AdminTableCell textAlign="center" color="#374151">
                    {row.originalContent.stats.likeCount}
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
              })
            )}
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

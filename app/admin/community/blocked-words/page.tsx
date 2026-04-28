'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  Box,
  Checkbox,
  Flex,
  Icon,
  IconButton,
  Table,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import AdminPageSizeSelect from '@/app/admin/components/ui/table/page-size-select';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import BaseModal from '@/app/admin/components/modal/base-modal';
import AdminButton from '@/app/admin/components/ui/button';
import { toaster } from '@/app/admin/components/ui/toaster';
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
import {
  createBlockedWord,
  fetchBlockedWordsList,
  deleteBlockedWord,
} from '@/lib/blocked-words';
import type { BlockedWord, BlockedWordsListResponse } from '@/types/blocked-word';

import BlockedWordCreateModal from './BlockedWordCreateModal';

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

export default function CommunityBlockedWordsPage() {
  const { open, onOpen, onClose } = useDisclosure();
  const [blockedWords, setBlockedWords] = useState<BlockedWord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [createKeywordError, setCreateKeywordError] = useState('');
  const [isCreatingKeyword, setIsCreatingKeyword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlockedWord | null>(null);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [isPageSizeMenuOpen, setIsPageSizeMenuOpen] = useState(false);

  const loadBlockedWords = useCallback(
    async (override?: { page?: number; pageSize?: number; search?: string }) => {
      try {
        setIsLoading(true);
        const data = (await fetchBlockedWordsList({
          page: override?.page ?? currentPage,
          pageSize: override?.pageSize ?? pageSize,
          search: override?.search ?? appliedSearchKeyword.trim(),
        })) as BlockedWordsListResponse;

        setBlockedWords(data.items);
        setTotalCount(data.meta.totalCount);
        setTotalPages(data.meta.totalPages);

        if (data.meta.page !== currentPage) {
          setCurrentPage(data.meta.page);
        }

        if (data.meta.pageSize !== pageSize) {
          setPageSize(data.meta.pageSize);
        }
      } catch (error) {
        console.error('[CommunityBlockedWordsPage] failed to load blocked words:', error);

        toaster.create({
          description: '금지 키워드 목록을 불러오지 못했습니다.',
          type: 'error',
          duration: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [appliedSearchKeyword, currentPage, pageSize],
  );

  useEffect(() => {
    void loadBlockedWords();
  }, [loadBlockedWords]);

  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginationItems = getPaginationItems(currentPageSafe, totalPages);

  const allKeywordIds = blockedWords.map((item) => item.id);
  const isAllSelected =
    blockedWords.length > 0 &&
    blockedWords.every((item) => selectedKeywordIds.includes(item.id));
  const isIndeterminate = selectedKeywordIds.length > 0 && !isAllSelected;

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

  const handleCreateKeyword = async () => {
    const trimmedKeyword = newKeyword.trim();
    if (!trimmedKeyword || isCreatingKeyword) return;

    setIsCreatingKeyword(true);
    setCreateKeywordError('');
    setIsPageSizeMenuOpen(false);

    try {
      await createBlockedWord({
        keyword: trimmedKeyword,
        createdBy: 'admin01',
      });

      setNewKeyword('');
      setCreateKeywordError('');
      onClose();
      setSelectedKeywordIds([]);

      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        await loadBlockedWords({ page: 1 });
      }

      toaster.create({
        description: '키워드가 등록되었습니다.',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '키워드를 등록하지 못했습니다.';

      setCreateKeywordError(message);
    } finally {
      setIsCreatingKeyword(false);
    }
  };

  const handleToggleAllKeywords = (checked: boolean) => {
    if (checked) {
      setSelectedKeywordIds(allKeywordIds);
      return;
    }

    setSelectedKeywordIds([]);
  };

  const handleToggleKeyword = (id: string, checked: boolean) => {
    setSelectedKeywordIds((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }

      return prev.filter((itemId) => itemId !== id);
    });
  };

  const handleOpenDeleteModal = (item: BlockedWord) => {
    setDeleteTarget(item);
  };

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleDeleteKeyword = async () => {
    if (!deleteTarget) return;

    try {
      await deleteBlockedWord(deleteTarget.id);

      setSelectedKeywordIds((prev) => prev.filter((itemId) => itemId !== deleteTarget.id));
      setDeleteTarget(null);
      await loadBlockedWords();

      toaster.create({
        description: '키워드가 삭제되었습니다.',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '키워드를 삭제하지 못했습니다.';

      toaster.create({
        description: message,
        type: 'error',
        duration: 2000,
      });
    }
  };

  const handleOpenBulkDeleteModal = () => {
    if (selectedKeywordIds.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const handleCloseBulkDeleteModal = () => {
    setIsBulkDeleteModalOpen(false);
  };

  const handleDeleteSelectedKeywords = async () => {
    if (selectedKeywordIds.length === 0) return;

    try {
      for (const id of selectedKeywordIds) {
        await deleteBlockedWord(id);
      }

      setSelectedKeywordIds([]);
      setIsBulkDeleteModalOpen(false);
      setIsPageSizeMenuOpen(false);
      await loadBlockedWords();

      toaster.create({
        description: '선택한 키워드가 삭제되었습니다.',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '선택한 키워드를 삭제하지 못했습니다.';

      toaster.create({
        description: message,
        type: 'error',
        duration: 2000,
      });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        left={
          <Box>
            <Text fontSize="20px" fontWeight="600" lineHeight="1.2" color="#111827">
              금지 키워드 관리
            </Text>
          </Box>
        }
        right={null}
      />

      <Flex direction="column" gap="16px">
        <Flex align="center" justify="space-between" gap="12px">
          <Box maxW="480px" w="100%">
            <AdminSearchField
              w="480px"
              placeholder="키워드 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onEnter={(value) => {
                setAppliedSearchKeyword(value);
                setSelectedKeywordIds([]);
                setIsPageSizeMenuOpen(false);
                setCurrentPage(1);
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
    onClick={handleOpenBulkDeleteModal}
    disabled={selectedKeywordIds.length === 0}
  >
    <Flex align="center" gap="6px">
      <Icon as={LuTrash2} boxSize="14px" />
      <Text as="span">선택 항목 삭제</Text>
    </Flex>
  </AdminButton>

  <AdminButton
    type="button"
    variantStyle="primary"
    size="sm"
    onClick={() => {
      setCreateKeywordError('');
      setIsPageSizeMenuOpen(false);
      onOpen();
    }}
  >
    <Flex align="center" gap="6px">
      <Icon as={LuPlus} boxSize="14px" />
      <Text as="span">키워드 등록</Text>
    </Flex>
  </AdminButton>
</Flex>
        </Flex>

        <AdminTable>
          <AdminTableRoot>
            <AdminTableHead bg="#F9FAFB">
              <Table.Row>
                <AdminTableColumnHeader w="44px" textAlign="center" px="12px">
                  <Checkbox.Root
                    size="sm"
                    checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
                    onCheckedChange={(details) => handleToggleAllKeywords(details.checked === true)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </AdminTableColumnHeader>
                <AdminTableColumnHeader>키워드</AdminTableColumnHeader>
                <AdminTableColumnHeader w="140px">등록일</AdminTableColumnHeader>
                <AdminTableColumnHeader w="140px">등록자</AdminTableColumnHeader>
                <AdminTableColumnHeader w="72px" textAlign="center">관리</AdminTableColumnHeader>
              </Table.Row>
            </AdminTableHead>

            <AdminTableBody>
              {!isLoading && blockedWords.length === 0 ? (
                <AdminTableRow>
                  <AdminTableCell colSpan={5} textAlign="center" py="24px">
                    <Text fontSize="13px" color="#6B7280">
                      검색 결과가 없습니다.
                    </Text>
                  </AdminTableCell>
                </AdminTableRow>
              ) : (
                blockedWords.map((item) => (
                  <AdminTableRow key={item.id}>
                    <AdminTableCell textAlign="center" px="12px">
                      <Checkbox.Root
                        size="sm"
                        checked={selectedKeywordIds.includes(item.id)}
                        onCheckedChange={(details) =>
                          handleToggleKeyword(item.id, details.checked === true)
                        }
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                      </Checkbox.Root>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminTableEllipsisText fontSize="13px" fontWeight="500" color="#111827">
                        {item.keyword}
                      </AdminTableEllipsisText>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminTableEllipsisText>{item.createdAt}</AdminTableEllipsisText>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminTableEllipsisText>{item.createdBy}</AdminTableEllipsisText>
                    </AdminTableCell>
                    <AdminTableCell textAlign="center">
                      <IconButton
                        aria-label="키워드 삭제"
                        variant="ghost"
                        size="xs"
                        color="#9CA3AF"
                        _hover={{ bg: '#F9FAFB', color: '#6B7280' }}
                        onClick={() => handleOpenDeleteModal(item)}
                      >
                        <LuTrash2 />
                      </IconButton>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTableRoot>
        </AdminTable>
        <Flex justify="space-between" align="center" mt="4px">
          <Text fontSize="12px" fontWeight="600" color="#374151">
            항목 수 : {totalCount}
          </Text>

          <AdminTablePagination
            items={paginationItems}
            onItemClick={handlePaginationItemClick}
          />
        </Flex>
      </Flex>

      <BaseModal
        isOpen={isBulkDeleteModalOpen}
        onClose={handleCloseBulkDeleteModal}
        title="키워드 삭제"
        footer={
          <Flex gap="8px" w="100%">
            <AdminButton
              type="button"
              variantStyle="outline"
              size="md"
              onClick={handleCloseBulkDeleteModal}
              flex={1}
            >
              취소
            </AdminButton>
            <AdminButton
              type="button"
              variantStyle="primary"
              size="md"
              onClick={handleDeleteSelectedKeywords}
              flex={1}
            >
              삭제하기
            </AdminButton>
          </Flex>
        }
      >
        <Flex direction="column" gap="8px">
          <Text fontSize="14px" fontWeight="600" color="#111827">
            선택한 키워드를 삭제하시겠습니까?
          </Text>
          <Text fontSize="13px" color="#6B7280">
            삭제 대상: {selectedKeywordIds.length}개
          </Text>
        </Flex>
      </BaseModal>

      <BaseModal
        isOpen={!!deleteTarget}
        onClose={handleCloseDeleteModal}
        title="키워드 삭제"
        footer={
          <Flex gap="8px" w="100%">
            <AdminButton
              type="button"
              variantStyle="outline"
              size="md"
              onClick={handleCloseDeleteModal}
              flex={1}
            >
              취소
            </AdminButton>
            <AdminButton
              type="button"
              variantStyle="primary"
              size="md"
              onClick={handleDeleteKeyword}
              flex={1}
            >
              삭제하기
            </AdminButton>
          </Flex>
        }
      >
        <Flex direction="column" gap="8px">
          <Text fontSize="14px" fontWeight="600" color="#111827">
            선택한 키워드를 삭제하시겠습니까?
          </Text>
          <Text fontSize="13px" color="#6B7280">
            {deleteTarget ? `삭제 대상: ${deleteTarget.keyword}` : ''}
          </Text>
        </Flex>
      </BaseModal>

      <BlockedWordCreateModal
        isOpen={open}
        onClose={() => {
          setCreateKeywordError('');
          onClose();
        }}
        value={newKeyword}
        onChange={(value) => {
          setNewKeyword(value);
          if (createKeywordError) {
            setCreateKeywordError('');
          }
        }}
        onSubmit={handleCreateKeyword}
        errorMessage={createKeywordError}
        isSubmitting={isCreatingKeyword}
      />
    </PageContainer>
  );
}

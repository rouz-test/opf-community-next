'use client';

import { useState } from 'react';

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
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import BaseModal from '@/app/admin/components/modal/base-modal';
import BlockedWordCreateModal from './BlockedWordCreateModal';
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
import AdminTablePagination, { type AdminTablePaginationItem } from '@/app/admin/components/ui/table/admin-table-pagination';

const initialBlockedWords = [
  { id: 1, keyword: '불법도박', createdAt: '2023-10-24', createdBy: 'admin01' },
  { id: 2, keyword: '바카라', createdAt: '2023-10-24', createdBy: 'admin01' },
  { id: 3, keyword: '욕설테스트', createdAt: '2023-10-23', createdBy: 'manager02' },
  { id: 4, keyword: '성인광고', createdAt: '2023-10-22', createdBy: 'system' },
  { id: 5, keyword: '개인정보유출', createdAt: '2023-10-20', createdBy: 'admin01' },
  { id: 6, keyword: '개인정보유출', createdAt: '2023-10-20', createdBy: 'admin01' },
  { id: 7, keyword: '개인정보유출', createdAt: '2023-10-20', createdBy: 'admin01' },
];

const paginationItems: AdminTablePaginationItem[] = [
  { type: 'first' },
  { type: 'prev' },
  { type: 'page', value: 1, isActive: true },
  { type: 'page', value: 2 },
  { type: 'page', value: 3 },
  { type: 'page', value: 4 },
  { type: 'page', value: 5 },
  { type: 'ellipsis' },
  { type: 'page', value: 16 },
  { type: 'next' },
  { type: 'last' },
];


export default function CommunityBlockedWordsPage() {
  const { open, onOpen, onClose } = useDisclosure();
  const [blockedWords, setBlockedWords] = useState(initialBlockedWords);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [createKeywordError, setCreateKeywordError] = useState('');
  const [isCreatingKeyword, setIsCreatingKeyword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<(typeof initialBlockedWords)[number] | null>(null);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const normalizedSearchKeyword = appliedSearchKeyword.trim().toLowerCase();
  const filteredBlockedWords = blockedWords.filter((item) =>
    normalizedSearchKeyword ? item.keyword.toLowerCase().includes(normalizedSearchKeyword) : true,
  );

  const validateKeywordDuplicate = async (keyword: string) => {
    // TODO: Replace this local mock with an actual API request.
    // Example: call a validation endpoint and read the duplicate status from the response.
    await Promise.resolve();

    return blockedWords.some(
      (item) => item.keyword.trim().toLowerCase() === keyword.trim().toLowerCase(),
    );
  };

  const allKeywordIds = filteredBlockedWords.map((item) => item.id);
  const isAllSelected = filteredBlockedWords.length > 0 && filteredBlockedWords.every((item) => selectedKeywordIds.includes(item.id));
  const isIndeterminate = selectedKeywordIds.length > 0 && !isAllSelected;

  const handleCreateKeyword = async () => {
    const trimmedKeyword = newKeyword.trim();
    if (!trimmedKeyword || isCreatingKeyword) return;

    setIsCreatingKeyword(true);
    setCreateKeywordError('');

    try {
      const isDuplicate = await validateKeywordDuplicate(trimmedKeyword);

      if (isDuplicate) {
        setCreateKeywordError('이미 등록된 키워드입니다.');
        return;
      }

      const today = new Date();
      const createdAt = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
        today.getDate(),
      ).padStart(2, '0')}`;

      setBlockedWords((prev) => [
        {
          id: Date.now(),
          keyword: trimmedKeyword,
          createdAt,
          createdBy: 'admin01',
        },
        ...prev,
      ]);
      setNewKeyword('');
      setCreateKeywordError('');
      onClose();

      toaster.create({
        description: '키워드가 등록되었습니다.',
        type: 'success',
        duration: 2000,
      });
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

  const handleToggleKeyword = (id: number, checked: boolean) => {
    setSelectedKeywordIds((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }

      return prev.filter((itemId) => itemId !== id);
    });
  };

  const handleOpenDeleteModal = (item: (typeof initialBlockedWords)[number]) => {
    setDeleteTarget(item);
  };

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleDeleteKeyword = () => {
    if (!deleteTarget) return;

    setBlockedWords((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setSelectedKeywordIds((prev) => prev.filter((itemId) => itemId !== deleteTarget.id));
    setDeleteTarget(null);

    toaster.create({
      description: '키워드가 삭제되었습니다.',
      type: 'success',
      duration: 2000,
    });
  };

  const handleOpenBulkDeleteModal = () => {
    if (selectedKeywordIds.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const handleCloseBulkDeleteModal = () => {
    setIsBulkDeleteModalOpen(false);
  };

  const handleDeleteSelectedKeywords = () => {
    if (selectedKeywordIds.length === 0) return;

    setBlockedWords((prev) => prev.filter((item) => !selectedKeywordIds.includes(item.id)));
    setSelectedKeywordIds([]);
    setIsBulkDeleteModalOpen(false);

    toaster.create({
      description: '선택한 키워드가 삭제되었습니다.',
      type: 'success',
      duration: 2000,
    });
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
              }}
            />
          </Box>

          <Flex align="center" gap="8px">
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
              {filteredBlockedWords.length === 0 ? (
                <AdminTableRow>
                  <AdminTableCell colSpan={5} textAlign="center" py="24px">
                    <Text fontSize="13px" color="#6B7280">
                      검색 결과가 없습니다.
                    </Text>
                  </AdminTableCell>
                </AdminTableRow>
              ) : (
                filteredBlockedWords.map((item) => (
                  <AdminTableRow key={item.id}>
                    <AdminTableCell textAlign="center" px="12px">
                      <Checkbox.Root
                        size="sm"
                        checked={selectedKeywordIds.includes(item.id)}
                        onCheckedChange={(details) => handleToggleKeyword(item.id, details.checked === true)}
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
            항목 수 : {filteredBlockedWords.length}
          </Text>

          <AdminTablePagination items={paginationItems} />
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
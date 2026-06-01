'use client';

import {
  Box,
  Button,
  Flex,
  Icon,
  Spinner,
  Table,
  Text,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuDownload } from 'react-icons/lu';
import AdminPageSizeSelect from '@/app/admin/components/ui/table/page-size-select';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
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
import AdminSearchField from '@/app/admin/components/ui/search-field';
import type { UserProfileBundle } from '@/types/user';

type UsersListResponse = {
  items: UserProfileBundle[];
  meta: {
    totalCount: number;
    totalPages: number;
    page: number;
    pageSize: number;
  };
};

type UserRow = {
  accountId: string;
  name: string;
  phone: string;
  email: string;
  organization: string;
  position: string;
};

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 13, 30, 50] as const;
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

export default function UsersPage() {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [userRows, setUserRows] = useState<UserRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [isPageSizeMenuOpen, setIsPageSizeMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = (value: string) => {
    setAppliedSearchKeyword(value.trim());
    setCurrentPage(1);
    setIsPageSizeMenuOpen(false);
  };

  const loadUsers = useCallback(() => {
    let isCancelled = false;

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const searchParams = new URLSearchParams({
          viewerRole: 'admin',
          includeAdminNotes: 'true',
          page: String(currentPage),
          pageSize: String(pageSize),
        });

        if (appliedSearchKeyword.trim()) {
          searchParams.set('search', appliedSearchKeyword.trim());
        }

        const response = await fetch(`/api/mock/users?${searchParams.toString()}`, { cache: 'no-store' });
        const data = (await response.json().catch(() => null)) as UsersListResponse | { message?: string } | null;

        if (!response.ok || !data || !('items' in data)) {
          throw new Error((data as { message?: string } | null)?.message || '회원 목록을 불러오지 못했습니다.');
        }

        if (isCancelled) return;

        setTotalCount(data.meta.totalCount);
        setTotalPages(data.meta.totalPages);
        if (data.meta.page !== currentPage) {
          setCurrentPage(data.meta.page);
        }
        if (data.meta.pageSize !== pageSize) {
          setPageSize(data.meta.pageSize);
        }
        setUserRows(
          data.items.map((item) => ({
            accountId: item.account.accountId,
            name: item.account.verification.realName,
            phone: item.account.verification.phoneNumber,
            email: item.account.auth.socialEmail,
            organization: item.account.profile.company,
            position: item.account.profile.position,
          })),
        );
      } catch (error) {
        if (isCancelled) return;
        setErrorMessage(error instanceof Error ? error.message : '회원 목록을 불러오지 못했습니다.');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchUsers();

    return () => {
      isCancelled = true;
    };
  }, [appliedSearchKeyword, currentPage, pageSize]);

  useEffect(() => loadUsers(), [loadUsers]);

  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginationItems = getPaginationItems(currentPageSafe, totalPages);

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

  return (
    <PageContainer>
      <PageHeader
        left={null}
        right={null}
      />

      <Flex align="center" justify="space-between" gap="12px" mb="10px">
        <Box w="480px">
          <AdminSearchField
            placeholder="이름 / 전화번호 / 이메일 / 소속을 검색해 보세요."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onEnter={handleSearch}
          />
        </Box>

        <Flex align="center" gap="10px">
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

          <Button
            type="button"
            variant="outline"
            h="40px"
            px="16px"
            borderRadius="10px"
            borderColor="#F59E42"
            bg="#FFFFFF"
            color="#F59E42"
            fontSize="13px"
            fontWeight="600"
            _hover={{ bg: '#FFF7ED' }}
          >
            <Flex align="center" gap="6px">
              <Icon as={LuDownload} boxSize="15px" />
              <Text as="span">다운로드</Text>
            </Flex>
          </Button>
        </Flex>
      </Flex>

      <AdminTable>
        <AdminTableRoot>
          <AdminTableHead>
            <Table.Row>
              <AdminTableColumnHeader w="140px">이름</AdminTableColumnHeader>
              <AdminTableColumnHeader w="150px">전화번호</AdminTableColumnHeader>
              <AdminTableColumnHeader w="420px">이메일</AdminTableColumnHeader>
              <AdminTableColumnHeader w="200px">소속</AdminTableColumnHeader>
              <AdminTableColumnHeader w="260px">직책</AdminTableColumnHeader>
            </Table.Row>
          </AdminTableHead>

          <AdminTableBody>
            {isLoading ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5}>
                  <Flex align="center" justify="center" gap="8px" py="36px" color="#6B7280">
                    <Spinner size="sm" color="#F59E42" />
                    <Text fontSize="13px">회원 목록을 불러오는 중입니다.</Text>
                  </Flex>
                </AdminTableCell>
              </AdminTableRow>
            ) : null}

            {!isLoading && errorMessage ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5}>
                  <Flex align="center" justify="center" py="36px">
                    <Text fontSize="13px" color="#DC2626">
                      {errorMessage}
                    </Text>
                  </Flex>
                </AdminTableCell>
              </AdminTableRow>
            ) : null}

            {!isLoading && !errorMessage && userRows.map((row) => (
              <AdminTableRow
                key={row.accountId}
                cursor="pointer"
                onClick={() => router.push(`/admin/users/${row.accountId}`)}
              >
                <AdminTableCell fontWeight="500" color="#374151">
                  {row.name || ''}
                </AdminTableCell>
                <AdminTableCell color="#374151">
                  {row.phone || ''}
                </AdminTableCell>
                <AdminTableCell color="#374151">
                  {row.email ? <AdminTableEllipsisText>{row.email}</AdminTableEllipsisText> : ''}
                </AdminTableCell>
                <AdminTableCell color="#374151">
                  {row.organization ? <AdminTableEllipsisText>{row.organization}</AdminTableEllipsisText> : ''}
                </AdminTableCell>
                <AdminTableCell color="#374151">
                  {row.position ? <AdminTableEllipsisText>{row.position}</AdminTableEllipsisText> : ''}
                </AdminTableCell>
              </AdminTableRow>
            ))}

            {!isLoading && !errorMessage && userRows.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5}>
                  <Flex align="center" justify="center" py="36px">
                    <Text fontSize="13px" color="#6B7280">
                      검색 결과가 없습니다.
                    </Text>
                  </Flex>
                </AdminTableCell>
              </AdminTableRow>
            ) : null}
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
    </PageContainer>
  );
}

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
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuDownload } from 'react-icons/lu';
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

const paginationItems: AdminTablePaginationItem[] = [
  { type: 'first' },
  { type: 'prev' },
  { type: 'page', value: 1, isActive: true },
  { type: 'page', value: 2 },
  { type: 'page', value: 3 },
  { type: 'page', value: 4 },
  { type: 'page', value: 5 },
  { type: 'page', value: 6 },
  { type: 'page', value: 7 },
  { type: 'page', value: 8 },
  { type: 'ellipsis' },
  { type: 'page', value: 16 },
  { type: 'next' },
  { type: 'last' },
];

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function UsersPage() {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [userRows, setUserRows] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = (value: string) => {
    setSubmittedKeyword(value.trim());
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch('/api/mock/users?viewerRole=admin&includeAdminNotes=true', {
          cache: 'no-store',
        });
        const data = (await response.json().catch(() => null)) as UsersListResponse | { message?: string } | null;

        if (!response.ok || !data || !('items' in data)) {
          throw new Error((data as { message?: string } | null)?.message || '회원 목록을 불러오지 못했습니다.');
        }

        if (isCancelled) return;

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
  }, []);

  const filteredUserRows = useMemo(() => {
    if (!submittedKeyword) return userRows;

    const normalizedKeyword = submittedKeyword.toLowerCase();

    return userRows.filter((row) =>
      [row.name, row.phone, row.email, row.organization, row.position]
        .join(' ')
        .toLowerCase()
        .includes(normalizedKeyword),
    );
  }, [submittedKeyword, userRows]);

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
          <Button
            type="button"
            variant="outline"
            h="40px"
            px="14px"
            borderRadius="10px"
            borderColor="#F59E42"
            bg="#FFFFFF"
            color="#F59E42"
            fontSize="13px"
            fontWeight="600"
            _hover={{ bg: '#FFF7ED' }}
          >
            <Flex align="center" gap="6px">
              <Text as="span">{filteredUserRows.length}</Text>
              <ChevronDownIcon />
            </Flex>
          </Button>

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

            {!isLoading && !errorMessage && filteredUserRows.map((row) => (
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

            {!isLoading && !errorMessage && filteredUserRows.length === 0 ? (
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

      <Flex justify="space-between" align="center" mt="10px">
        <Text fontSize="13px" fontWeight="500" color="#4B5563">
          항목 수: {filteredUserRows.length}
        </Text>

        <AdminTablePagination items={paginationItems} />
      </Flex>
    </PageContainer>
  );
}

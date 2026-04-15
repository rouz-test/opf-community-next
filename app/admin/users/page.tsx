'use client';

import {
  Box,
  Button,
  Flex,
  Icon,
  Table,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
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

const userRows = [
  {
    name: '재현',
    phone: '',
    email: 'sn***@catholic.ac.kr',
    organization: '',
    position: '',
  },
  {
    name: '희상',
    phone: '',
    email: 'he*****@kakao.com',
    organization: '',
    position: '',
  },
  {
    name: '김준경',
    phone: '010-74**-17**',
    email: 'ro**@mail.com',
    organization: '테스터 그룹',
    position: '테스터1',
  },
  {
    name: '김준경',
    phone: '010-74**-17**',
    email: '7r****@gmail.com',
    organization: '',
    position: '',
  },
  {
    name: '박시연',
    phone: '010-32**-02**',
    email: 'sh****@gmail.com',
    organization: '오플',
    position: '주임',
  },
  {
    name: '박한수',
    phone: '010-22**-80**',
    email: 'ki*******@kakao.com',
    organization: '',
    position: '',
  },
  {
    name: '김재현',
    phone: '010-75**-29**',
    email: 'or*************@gmail.com',
    organization: '',
    position: '',
  },
  {
    name: '김재현',
    phone: '010-75**-29**',
    email: 'sn****@hanmail.net',
    organization: 'ㅇㄴㄹsdfsdf',
    position: 'ㄴㅇㄹsdfsdfsdfdsfs',
  },
  {
    name: '김재현',
    phone: '010-75**-29**',
    email: 'ks*****@gmail.com',
    organization: '수정 될까',
    position: '김김김김김김김 김 김 김재현 직책 안녕',
  },
  {
    name: '이호준',
    phone: '010-41**-14**',
    email: 'be**********@gmail.com',
    organization: '프로그램 있는',
    position: '',
  },
  {
    name: '이호준',
    phone: '010-41**-14**',
    email: 'ai*****@naver.com',
    organization: '',
    position: '',
  },
  {
    name: '박한수',
    phone: '010-22**-80**',
    email: 'da******@gmail.com',
    organization: '소속 길게 나오면 어떻게 될까...',
    position: '소속 길게 나오면 어떻게 될까요 어떻게...',
  },
  {
    name: 'test-change',
    phone: '010-55**-55**',
    email: 'ch****@smilegate.com',
    organization: '51656',
    position: '91919',
  },
];

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
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    // TODO: 추후 API 연동 또는 필터링 로직 추가
    console.log('검색 실행:', value);
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
              <Text as="span">13</Text>
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
            {userRows.map((row, index) => (
              <AdminTableRow key={`${row.email}-${index}`}>
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
          </AdminTableBody>
        </AdminTableRoot>
      </AdminTable>

      <Flex justify="space-between" align="center" mt="10px">
        <Text fontSize="13px" fontWeight="500" color="#4B5563">
          항목 수: 204
        </Text>

        <AdminTablePagination items={paginationItems} />
      </Flex>
    </PageContainer>
  );
}
'use client';

import {
  Box,
  Checkbox,
  Flex,
  Grid,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Table,
  Text,
} from '@chakra-ui/react';
import { LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import AdminButton from '@/app/admin/components/ui/button';
import AdminTable, {
  AdminTableBody,
  AdminTableCell,
  AdminTableColumnHeader,
  AdminTableEllipsisText,
  AdminTableFooter,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRoot,
  AdminTableRow,
} from '@/app/admin/components/ui/table/admin-table';
import AdminTablePagination, { type AdminTablePaginationItem } from '@/app/admin/components/ui/table/admin-table-pagination';

const blockedWords = [
  { id: 1, keyword: '불법도박', createdAt: '2023-10-24', createdBy: 'admin01', postCount: 32, commentCount: 32 },
  { id: 2, keyword: '바카라', createdAt: '2023-10-24', createdBy: 'admin01', postCount: 0, commentCount: 0 },
  { id: 3, keyword: '욕설테스트', createdAt: '2023-10-23', createdBy: 'manager02', postCount: 0, commentCount: 0 },
  { id: 4, keyword: '성인광고', createdAt: '2023-10-22', createdBy: 'system', postCount: 1, commentCount: 1 },
  { id: 5, keyword: '개인정보유출', createdAt: '2023-10-20', createdBy: 'admin01', postCount: 2, commentCount: 2 },
  { id: 6, keyword: '개인정보유출', createdAt: '2023-10-20', createdBy: 'admin01', postCount: 0, commentCount: 0 },
  { id: 7, keyword: '개인정보유출', createdAt: '2023-10-20', createdBy: 'admin01', postCount: 0, commentCount: 0 },
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
  return (
    <PageContainer>
      <PageHeader
        left={
          <Box>
            <Text fontSize="28px" fontWeight="700" lineHeight="1.2" color="#111827">
              금지 키워드 관리
            </Text>
            <Text mt="8px" fontSize="13px" color="#6B7280">
              커뮤니티 내 부적절한 게시글 작성을 방지하기 위한 금지어를 관리합니다.
            </Text>
          </Box>
        }
        right={null}
      />

      <Flex direction="column" gap="16px">
        <Box borderWidth="1px" borderColor="#E5E7EB" borderRadius="16px" bg="#FFFFFF" overflow="hidden">
          <Box px="20px" py="16px" borderBottomWidth="1px" borderBottomColor="#F3F4F6">
            <Text fontSize="16px" fontWeight="700" color="#111827">
              새 키워드 등록
            </Text>
          </Box>

          <Box px="20px" py="16px">
            <Text mb="8px" fontSize="12px" fontWeight="600" color="#4B5563">
              금지어 입력
            </Text>

            <Grid templateColumns="1fr auto" gap="12px" alignItems="center">
              <InputGroup startElement={<Icon as={LuSearch} color="#9CA3AF" boxSize="14px" />}>
                <Input
                  h="40px"
                  borderRadius="8px"
                  borderColor="#D1D5DB"
                  placeholder="등록할 단어를 입력하세요. (예: 불법도박)"
                  fontSize="13px"
                  color="#111827"
                  _placeholder={{ color: '#9CA3AF' }}
                  _focus={{
                    borderColor: '#D1D5DB',
                    boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.05)',
                    outline: 'none',
                  }}
                />
              </InputGroup>

              <AdminButton type="button" variantStyle="primary" size="sm" minW="112px">
                <Flex align="center" gap="6px">
                  <Icon as={LuPlus} boxSize="14px" />
                  <Text as="span">등록하기</Text>
                </Flex>
              </AdminButton>
            </Grid>
          </Box>
        </Box>

        <AdminTable>
          <AdminTableHeader
            title="등록된 키워드 목록"
            right={
              <InputGroup maxW="240px" startElement={<Icon as={LuSearch} color="#9CA3AF" boxSize="14px" />}>
                <Input
                  h="36px"
                  borderRadius="8px"
                  borderColor="#D1D5DB"
                  placeholder="키워드 검색..."
                  fontSize="12px"
                  color="#111827"
                  _placeholder={{ color: '#9CA3AF' }}
                  _focus={{
                    borderColor: '#D1D5DB',
                    boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.05)',
                    outline: 'none',
                  }}
                />
              </InputGroup>
            }
          />

          <AdminTableRoot>
            <AdminTableHead>
              <Table.Row>
                <AdminTableColumnHeader w="44px" textAlign="center" px="12px">
                  <Checkbox.Root size="sm">
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </AdminTableColumnHeader>
                <AdminTableColumnHeader>키워드</AdminTableColumnHeader>
                <AdminTableColumnHeader w="140px">등록일</AdminTableColumnHeader>
                <AdminTableColumnHeader w="140px">등록자</AdminTableColumnHeader>
                <AdminTableColumnHeader w="100px" textAlign="center">게시글 수</AdminTableColumnHeader>
                <AdminTableColumnHeader w="100px" textAlign="center">댓글 수</AdminTableColumnHeader>
                <AdminTableColumnHeader w="72px" textAlign="center">관리</AdminTableColumnHeader>
              </Table.Row>
            </AdminTableHead>

            <AdminTableBody>
              {blockedWords.map((item) => (
                <AdminTableRow key={item.id}>
                  <AdminTableCell textAlign="center" px="12px">
                    <Checkbox.Root size="sm">
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
                    <AdminTableEllipsisText textAlign="center">{item.postCount}</AdminTableEllipsisText>
                  </AdminTableCell>
                  <AdminTableCell textAlign="center">
                    <AdminTableEllipsisText textAlign="center">{item.commentCount}</AdminTableEllipsisText>
                  </AdminTableCell>
                  <AdminTableCell textAlign="center">
                    <IconButton
                      aria-label="키워드 삭제"
                      variant="ghost"
                      size="xs"
                      color="#9CA3AF"
                      _hover={{ bg: '#F9FAFB', color: '#6B7280' }}
                    >
                      <LuTrash2 />
                    </IconButton>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTableRoot>

          <AdminTableFooter
            left={
              <AdminButton type="button" variantStyle="outline" size="xs">
                <Flex align="center" gap="6px">
                  <Icon as={LuTrash2} boxSize="12px" />
                  <Text as="span">선택 항목 삭제</Text>
                </Flex>
              </AdminButton>
            }
            right={
              <Flex align="center" gap="20px">
                <AdminTablePagination items={paginationItems} />

                <Text fontSize="12px" fontWeight="600" color="#374151">
                  항목 수 : 1,324,234개
                </Text>
              </Flex>
            }
          />
        </AdminTable>
      </Flex>
    </PageContainer>
  );
}
import {
  Box,
  Checkbox,
  Flex,
  IconButton,
  Table,
  Text,
} from '@chakra-ui/react';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import AdminButton from '@/app/admin/components/ui/button';
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

const selectedTags = ['디자인', '개발', 'UX/UI'];

const contentRows = [
  {
    id: 102,
    type: '닉네임',
    title: '레딧 같은 앱 UI 추천좀...',
    author: 'User_A',
    publishedAt: '2024.01.20 14:23',
    commentCount: 130,
    likeCount: 80,
    exposureCount: 80,
    viewCount: 32,
    status: '보관',
  },
  {
    id: 102,
    type: '실명',
    title: '레딧 같은 앱 UI 추천좀...',
    author: 'ADMIN',
    publishedAt: '2024.01.20 14:23',
    commentCount: 130,
    likeCount: 80,
    exposureCount: 80,
    viewCount: 32,
    status: '노출',
  },
  {
    id: 102,
    type: '실명',
    title: '레딧 같은 앱 UI 추천좀...',
    author: 'ADMIN',
    publishedAt: '2024.01.20 14:23',
    commentCount: 130,
    likeCount: 80,
    exposureCount: 32,
    viewCount: 80,
    status: '노출',
  },
  {
    id: 102,
    type: '실명',
    title: '레딧 같은 앱 UI 추천좀...',
    author: 'ADMIN',
    publishedAt: '2024.01.20 14:23',
    commentCount: 130,
    likeCount: 80,
    exposureCount: 80,
    viewCount: 32,
    status: '노출',
  },
  {
    id: 102,
    type: '닉네임',
    title: '레딧 같은 앱 UI 추천좀...',
    author: 'User_A',
    publishedAt: '2024.01.20 14:23',
    commentCount: 130,
    likeCount: 80,
    exposureCount: 80,
    viewCount: 32,
    status: '고정',
  },
  {
    id: 102,
    type: '실명',
    title: '레딧 같은 앱 UI 추천좀...',
    author: 'ADMIN',
    publishedAt: '2024.01.20 14:23',
    commentCount: 130,
    likeCount: 80,
    exposureCount: 80,
    viewCount: 32,
    status: '노출',
  },
  {
    id: 102,
    type: '실명',
    title: '공지 레딧 같은 앱 UI 추천좀...',
    author: 'ADMIN',
    publishedAt: '2024.01.20 14:23',
    commentCount: 130,
    likeCount: 80,
    exposureCount: 32,
    viewCount: 80,
    status: '고정',
    isNotice: true,
  },
  {
    id: 102,
    type: '실명',
    title: '레딧 같은 앱 UI 추천좀...',
    author: 'ADMIN',
    publishedAt: '2024.01.20 14:23',
    commentCount: 130,
    likeCount: 80,
    exposureCount: 32,
    viewCount: 80,
    status: '노출',
  },
  {
    id: 102,
    type: '실명',
    title: '레딧 같은 앱 UI 추천좀...',
    author: 'ADMIN',
    publishedAt: '2024.01.20 14:23',
    commentCount: 130,
    likeCount: 80,
    exposureCount: 80,
    viewCount: 32,
    status: '임시',
  },
  {
    id: 102,
    type: '실명',
    title: '레딧 같은 앱 UI 추천좀...',
    author: 'ADMIN',
    publishedAt: '2024.01.20 14:23',
    commentCount: 130,
    likeCount: 80,
    exposureCount: 80,
    viewCount: 32,
    status: '노출',
  },
  {
    id: 102,
    type: '실명',
    title: '레딧 같은 앱 UI 추천좀...',
    author: 'ADMIN',
    publishedAt: '2024.01.20 14:23',
    commentCount: 130,
    likeCount: 80,
    exposureCount: 80,
    viewCount: 32,
    status: '노출',
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
  { type: 'ellipsis' },
  { type: 'page', value: 163 },
  { type: 'next' },
  { type: 'last' },
];

function getStatusClassName(status: string) {
  if (status === '보관') {
    return 'bg-[#F3F4F6] text-[#9CA3AF]';
  }

  if (status === '노출') {
    return 'bg-[#111827] text-white';
  }

  if (status === '고정') {
    return 'bg-[#FB923C] text-white';
  }

  if (status === '임시') {
    return 'bg-[#FACC15] text-white';
  }

  return 'bg-[#E5E7EB] text-[#4B5563]';
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="9" r="4.75" />
      <path d="M12.5 12.5L16 16" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5.5 7.5L10 12l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoreVerticalIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
      <circle cx="10" cy="4.5" r="1.2" />
      <circle cx="10" cy="10" r="1.2" />
      <circle cx="10" cy="15.5" r="1.2" />
    </svg>
  );
}

export default function CommunityContentPage() {
  return (
    <PageContainer>
      <PageHeader
        left={
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#374151]"
            >
              <span>발행일시</span>
              <ChevronDownIcon />
            </button>

            <div className="inline-flex h-10 items-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] text-[#9CA3AF]">
              YYYY.MM.DD
            </div>

            <div className="inline-flex h-10 items-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#374151]">
              2024. 09
            </div>

            <button
              type="button"
              aria-label="기간 검색"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#9CA3AF]"
            >
              <SearchIcon />
            </button>

            <div className="flex h-10 min-w-[300px] items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[#9CA3AF]">
              <SearchIcon />
              <span className="text-[13px]">제목 / 내용 / 작성자 프로필 명</span>
            </div>

            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#374151]"
            >
              <span>태그</span>
              <ChevronDownIcon />
            </button>

            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#6B7280]">홍보글만 보기</span>
                <button
                  type="button"
                  className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#E5E7EB] transition"
                >
                  <span className="absolute left-[2px] h-4 w-4 rounded-full bg-white shadow" />
                </button>
              </div>

              <button
                type="button"
                className="inline-flex h-10 items-center gap-1 rounded-lg border border-[#F59E42] bg-white px-3 text-[13px] font-semibold text-[#F59E42]"
              >
                <span>13</span>
                <ChevronDownIcon />
              </button>

              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#F59E42] px-5 text-[14px] font-semibold text-white hover:bg-[#EC8A2E]"
              >
                글 작성
              </button>
            </div>
          </div>

            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="font-medium text-[#4B5563]">선택된 태그:</span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex h-7 items-center gap-1 rounded-full bg-[#FFF1E8] px-3 text-[12px] font-medium text-[#F97316]"
                >
                  <span>{tag}</span>
                  <span className="text-[11px]">×</span>
                </span>
              ))}
            </div>
          </div>
        }
        right={null}
      />

      <AdminTable>
        <AdminTableRoot>
          <AdminTableHead>
            <Table.Row>
              <AdminTableColumnHeader w="44px" textAlign="center" px="16px">
                <Checkbox.Root size="sm">
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              </AdminTableColumnHeader>
              <AdminTableColumnHeader w="72px">번호</AdminTableColumnHeader>
              <AdminTableColumnHeader w="88px">구분</AdminTableColumnHeader>
              <AdminTableColumnHeader minW="260px">제목</AdminTableColumnHeader>
              <AdminTableColumnHeader w="120px">작성자</AdminTableColumnHeader>
              <AdminTableColumnHeader w="160px">발행일시</AdminTableColumnHeader>
              <AdminTableColumnHeader w="96px" textAlign="center">댓글 수</AdminTableColumnHeader>
              <AdminTableColumnHeader w="96px" textAlign="center">좋아요 수</AdminTableColumnHeader>
              <AdminTableColumnHeader w="96px" textAlign="center">저장 수</AdminTableColumnHeader>
              <AdminTableColumnHeader w="96px" textAlign="center">조회수</AdminTableColumnHeader>
              <AdminTableColumnHeader w="96px" textAlign="center">상태</AdminTableColumnHeader>
              <AdminTableColumnHeader w="56px" textAlign="center">액션</AdminTableColumnHeader>
            </Table.Row>
          </AdminTableHead>

          <AdminTableBody>
            {contentRows.map((row, index) => (
              <AdminTableRow key={`${row.id}-${row.author}-${index}`}>
                <AdminTableCell textAlign="center" px="16px">
                  <Checkbox.Root size="sm">
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </AdminTableCell>
                <AdminTableCell fontWeight="600" color="#374151">{row.id}</AdminTableCell>
                <AdminTableCell color="#4B5563">{row.type}</AdminTableCell>
                <AdminTableCell>
                  <Flex align="center" gap="8px" minW="0">
                    {row.isNotice ? (
                      <Box
                        as="span"
                        display="inline-flex"
                        h="20px"
                        alignItems="center"
                        borderRadius="6px"
                        bg="#111827"
                        px="6px"
                        fontSize="10px"
                        fontWeight="700"
                        color="white"
                        flexShrink={0}
                      >
                        공지
                      </Box>
                    ) : null}
                    <AdminTableEllipsisText fontSize="13px" fontWeight="500" color="#111827">
                      {row.title}
                    </AdminTableEllipsisText>
                  </Flex>
                </AdminTableCell>
                <AdminTableCell fontWeight="500" color="#4B5563">
                  <AdminTableEllipsisText>{row.author}</AdminTableEllipsisText>
                </AdminTableCell>
                <AdminTableCell color="#6B7280">
                  <AdminTableEllipsisText>{row.publishedAt}</AdminTableEllipsisText>
                </AdminTableCell>
                <AdminTableCell textAlign="center" fontWeight="500" color="#374151">{row.commentCount}</AdminTableCell>
                <AdminTableCell textAlign="center" fontWeight="500" color="#374151">{row.likeCount}</AdminTableCell>
                <AdminTableCell textAlign="center" fontWeight="500" color="#374151">{row.exposureCount}</AdminTableCell>
                <AdminTableCell textAlign="center" fontWeight="500" color="#374151">{row.viewCount}</AdminTableCell>
                <AdminTableCell textAlign="center">
                  <Box
                    as="span"
                    display="inline-flex"
                    h="24px"
                    alignItems="center"
                    borderRadius="9999px"
                    px="12px"
                    fontSize="11px"
                    fontWeight="700"
                    className={getStatusClassName(row.status)}
                  >
                    {row.status}
                  </Box>
                </AdminTableCell>
                <AdminTableCell textAlign="center">
                  <IconButton
                    aria-label="콘텐츠 액션"
                    variant="ghost"
                    size="xs"
                    color="#9CA3AF"
                    _hover={{ bg: '#F9FAFB', color: '#6B7280' }}
                  >
                    <MoreVerticalIcon />
                  </IconButton>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTableRoot>
      </AdminTable>

      <Flex align="center" justify="space-between" gap="16px">
        <Flex flexWrap="wrap" align="center" gap="8px">
          <AdminButton type="button" variantStyle="outline" size="sm">
            <Text as="span">선택 항목 보관</Text>
          </AdminButton>
          <AdminButton type="button" variantStyle="outline" size="sm">
            <Text as="span">선택 항목 삭제</Text>
          </AdminButton>
        </Flex>

        <Text fontSize="13px" fontWeight="500" color="#4B5563">
          항목 수 : {contentRows.length}개
        </Text>
      </Flex>

      <Flex justify="flex-end" mt="4px">
        <AdminTablePagination items={paginationItems} />
      </Flex>
    </PageContainer>
  );
}
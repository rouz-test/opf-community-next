'use client';
import { LuTrash2, LuArchive, LuCalendar } from 'react-icons/lu';
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Icon,
  IconButton,
  Input,
  Table,
  Text,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import AdminButton from '@/app/admin/components/ui/button';
import AdminBadge from '@/app/admin/components/ui/badge';
import AdminSwitch from '@/app/admin/components/ui/switch';
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
    tags: ['디자인', 'UX/UI'],
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
    tags: ['개발'],
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
    tags: ['운영'],
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
    tags: ['개발', '공지'],
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
    tags: ['UX/UI'],
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
    tags: ['개발'],
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
    tags: ['공지'],
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
    tags: ['디자인'],
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
    tags: ['운영', 'UX/UI'],
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
    tags: ['개발'],
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
    tags: ['디자인', '개발'],
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

const tagOptions = ['디자인', '개발', 'UX/UI', '운영', '공지'];

function formatDateDisplay(value: string) {
  if (!value) return 'YYYY.MM.DD';
  return value.replaceAll('-', '.');
}

function parsePublishedAtDate(value: string) {
  const [datePart] = value.split(' ');
  const normalized = datePart.replaceAll('.', '-');
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getStatusTone(status: string) {
  if (status === '보관') {
    return 'gray';
  }

  if (status === '노출') {
    return 'black';
  }

  if (status === '고정') {
    return 'orange';
  }

  if (status === '임시') {
    return 'yellow';
  }

  return 'gray';
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
  const [isPromotedOnly, setIsPromotedOnly] = useState(false);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const startDateInputRef = useRef<HTMLInputElement | null>(null);
  const endDateInputRef = useRef<HTMLInputElement | null>(null);

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
  };

  const filteredRows = contentRows.filter((row) => {
    const publishedAt = parsePublishedAtDate(row.publishedAt);
    if (!publishedAt) return true;

    if (appliedStartDate) {
      const start = new Date(appliedStartDate);
      start.setHours(0, 0, 0, 0);
      if (publishedAt < start) return false;
    }

    if (appliedEndDate) {
      const end = new Date(appliedEndDate);
      end.setHours(23, 59, 59, 999);
      if (publishedAt > end) return false;
    }

    return true;
  });

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
                    variant="ghost"
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

                <Box position="relative">
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
                    onClick={() => setIsTagFilterOpen((prev) => !prev)}
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
                        onValueChange={(values) => setSelectedTags([...values])}
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

                <Flex ml="auto" align="center" gap="8px">
                  <Text fontSize="13px" fontWeight="500" color="#6B7280">
                    홍보글만 보기
                  </Text>
                  <AdminSwitch
                    size="sm"
                    checked={isPromotedOnly}
                    onCheckedChange={setIsPromotedOnly}
                  />
                </Flex>
              </Flex>

            </Flex>

          </Flex>
        }
        right={null}
      />

      <Flex align="center" justify="space-between" gap="12px" mb="4px">
        <Flex
          flex="1"
          minW="320px"
          maxW="420px"
          h="40px"
          align="center"
          gap="8px"
          borderWidth="1px"
          borderColor="#E5E7EB"
          borderRadius="8px"
          bg="#FFFFFF"
          px="12px"
        >
          <Box color="#9CA3AF" flexShrink={0}>
            <SearchIcon />
          </Box>
          <Input
            h="100%"
            border="0"
            bg="transparent"
            px="0"
            fontSize="13px"
            color="#111827"
            placeholder="제목 / 내용 / 작성자 프로필 명"
            _placeholder={{ color: '#9CA3AF' }}
            _hover={{ borderColor: 'transparent' }}
            _focus={{
              borderColor: 'transparent',
              boxShadow: 'none',
              outline: 'none',
            }}
          />
        </Flex>

        <Flex align="center" gap="8px">
          <Button
            type="button"
            variant="outline"
            h="40px"
            px="12px"
            borderRadius="8px"
            borderColor="#F59E42"
            bg="#FFFFFF"
            color="#F59E42"
            fontSize="13px"
            fontWeight="600"
            _hover={{ bg: '#FFF7ED' }}
          >
            <Flex align="center" gap="4px">
              <Text as="span">13</Text>
              <ChevronDownIcon />
            </Flex>
          </Button>

          <AdminButton type="button" variantStyle="outline" size="sm">
            <Flex align="center" gap="6px">
              <Icon as={LuArchive} boxSize="14px" />
              <Text as="span">선택 항목 보관</Text>
            </Flex>
          </AdminButton>

          <AdminButton type="button" variantStyle="outline" size="sm">
            <Flex align="center" gap="6px">
              <Icon as={LuTrash2} boxSize="14px" />
              <Text as="span">선택 항목 삭제</Text>
            </Flex>
          </AdminButton>

          <AdminButton type="button" variantStyle="primary" size="sm">
            글 작성
          </AdminButton>
        </Flex>
      </Flex>

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
            {filteredRows.map((row, index) => (
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
                  <Flex align="center" gap="6px" minW="0" wrap="nowrap">
                    {row.tags.slice(0, 1).map((tag) => (
                      <AdminBadge
                        key={tag}
                        tone="orange"
                        h="24px"
                        px="10px"
                        fontSize="12px"
                        fontWeight="500"
                        flexShrink={0}
                      >
                        {tag}
                      </AdminBadge>
                    ))}
                    {row.tags.length > 1 ? (
                      <Text fontSize="12px" fontWeight="600" color="#6B7280" flexShrink={0}>
                        +{row.tags.length - 1}
                      </Text>
                    ) : null}
                  </Flex>
                </AdminTableCell>
                <AdminTableCell>
                  <Flex align="center" gap="8px" minW="0">
                    {row.isNotice ? (
                      <AdminBadge
                        tone="black"
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
                <AdminTableCell textAlign="center" fontWeight="500" color="#374151">{row.viewCount}</AdminTableCell>
                <AdminTableCell textAlign="center">
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
                  <IconButton
                    aria-label="콘텐츠 액션"
                    size="xs"
                    color="#9CA3AF"
                    bg="transparent"
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

      <Flex justify="space-between" align="center" mt="4px">
        <Text fontSize="13px" fontWeight="500" color="#4B5563">
          항목 수 : {filteredRows.length}개
        </Text>

        <AdminTablePagination items={paginationItems} />
      </Flex>
    </PageContainer>
  );
}
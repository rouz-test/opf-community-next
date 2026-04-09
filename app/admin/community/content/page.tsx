import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import AdminCard from '@/app/admin/components/ui/card';
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

      <AdminCard as="section" overflow="hidden" borderRadius="16px" p="0">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] text-left text-[12px] font-medium text-[#6B7280]">
                <th className="w-[44px] px-4 py-4">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#D1D5DB]" />
                </th>
                <th className="px-3 py-4">번호</th>
                <th className="px-3 py-4">구분</th>
                <th className="min-w-[260px] px-3 py-4">제목</th>
                <th className="px-3 py-4">작성자</th>
                <th className="px-3 py-4">발행일시</th>
                <th className="px-3 py-4 text-center">댓글 수</th>
                <th className="px-3 py-4 text-center">좋아요 수</th>
                <th className="px-3 py-4 text-center">저장 수</th>
                <th className="px-3 py-4 text-center">조회수</th>
                <th className="px-3 py-4 text-center">상태</th>
                <th className="w-[56px] px-3 py-4 text-center">액션</th>
              </tr>
            </thead>
            <tbody>
              {contentRows.map((row, index) => (
                <tr key={`${row.id}-${row.author}-${index}`} className="border-t border-[#F3F4F6] text-[13px] text-[#111827]">
                  <td className="px-4 py-4 align-middle">
                    <input type="checkbox" className="h-4 w-4 rounded border-[#D1D5DB]" />
                  </td>
                  <td className="px-3 py-4 font-semibold text-[#374151]">{row.id}</td>
                  <td className="px-3 py-4 text-[#4B5563]">{row.type}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      {row.isNotice ? (
                        <span className="inline-flex h-5 items-center rounded-md bg-[#111827] px-1.5 text-[10px] font-semibold text-white">
                          공지
                        </span>
                      ) : null}
                      <span className="max-w-[220px] truncate font-medium text-[#111827]">{row.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 font-medium text-[#4B5563]">{row.author}</td>
                  <td className="px-3 py-4 text-[#6B7280]">{row.publishedAt}</td>
                  <td className="px-3 py-4 text-center font-medium text-[#374151]">{row.commentCount}</td>
                  <td className="px-3 py-4 text-center font-medium text-[#374151]">{row.likeCount}</td>
                  <td className="px-3 py-4 text-center font-medium text-[#374151]">{row.exposureCount}</td>
                  <td className="px-3 py-4 text-center font-medium text-[#374151]">{row.viewCount}</td>
                  <td className="px-3 py-4 text-center">
                    <span
                      className={`inline-flex h-6 items-center rounded-full px-3 text-[11px] font-semibold ${getStatusClassName(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-[#F9FAFB]">
                      <MoreVerticalIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#F3F4F6] px-6 py-4">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#9CA3AF]"
          >
            ‹
          </button>
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#F59E42] text-[13px] font-semibold text-white">
            1
          </button>
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[13px] font-medium text-[#4B5563]">
            2
          </button>
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[13px] font-medium text-[#4B5563]">
            3
          </button>
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[13px] font-medium text-[#4B5563]">
            4
          </button>
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[13px] font-medium text-[#4B5563]">
            5
          </button>
          <span className="px-1 text-[13px] text-[#9CA3AF]">…</span>
          <button type="button" className="inline-flex h-8 items-center justify-center rounded-md border border-[#E5E7EB] px-3 text-[13px] font-medium text-[#4B5563]">
            163
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280]"
          >
            ›
          </button>
        </div>
      </AdminCard>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#374151]"
          >
            <span className="text-[#9CA3AF]">☷</span>
            <span>선택 항목 보관</span>
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#374151]"
          >
            <span className="text-[#9CA3AF]">☷</span>
            <span>선택 항목 삭제</span>
          </button>
        </div>

        <div className="text-[13px] font-medium text-[#4B5563]">항목 수 : 1,324,234개</div>
      </div>
    </PageContainer>
  );
}
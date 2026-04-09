export const adminSidebarSections = [
  {
    title: '회원',
    items: [{ label: '회원 목록', href: '/admin/users' }],
  },
  {
    title: '관리자',
    items: [
      { label: '관리자 목록', href: '/admin/admin/list' },
      { label: '권한 관리', href: '/admin/admin/roles' },
      { label: '관리자 접속기록', href: '/admin/admin/audit-access' },
      { label: '접근 권한 관리 기록', href: '/admin/admin/audit-permission' },
    ],
  },
  {
    title: '캠퍼스',
    items: [
      { label: '프로그램 개설/관리', href: '/admin/campus/programs' },
      { label: '신청서 다운로드', href: '/admin/campus/request-downloads' },
      { label: '회차별 교육 관리', href: '/admin/campus/courses' },
      { label: '팀빌딩 공고 관리', href: '/admin/campus/teams' },
      { label: '활동 게시판', href: '/admin/campus/submissions' },
      { label: '팀원관리', href: '/admin/campus/requests' },
    ],
  },
  {
    title: '아티클',
    items: [
      { label: '글 작성/관리', href: '/admin/articles/list' },
      { label: '임시 저장', href: '/admin/articles/revisions' },
      { label: '카테고리', href: '/admin/articles/category' },
    ],
  },
  {
    title: '커뮤니티',
    items: [
      { label: '통계', href: '/admin/community/analytics' },
      { label: '콘텐츠 관리', href: '/admin/community/content' },
      { label: '태그 관리', href: '/admin/community/tags' },
      { label: '금지 키워드', href: '/admin/community/blocked-words' },
    ],
  },
] as const;

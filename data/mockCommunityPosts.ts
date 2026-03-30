export type CommunityProfileMode = 'real' | 'nickname';

export interface CommunityIdentity {
  id: string;
  accountId?: string;
  profileId?: string;
  mode?: CommunityProfileMode;
}

export interface CommunityProfile extends CommunityIdentity {
  name: string;
  nickname: string;
  avatar: string;
  position?: string;
}

export interface CommunityAuthor extends CommunityProfile {}

export interface CommunityInteractionAuthor extends CommunityProfile {
  isFollowing?: boolean;
}

export interface HighlightedComment {
  id: string;
  author: CommunityInteractionAuthor;
  content: string;
  createdAt: string;
  likes: number;
  replyCount: number;
}

export interface CommunityPost {
  id: string;
  type: 'study' | 'community' | 'notice';
  
  studyId?: string;
  studyTitle?: string;
  title: string;
  content: string;
  author: CommunityAuthor;
  createdAt: string;
  updatedAt?: string;
  views: number;
  likes: number;
  commentCount: number;
  isLikedByMe: boolean;
  tags?: string[];
  images?: string[];
  isHighlight?: boolean;
  isPromotion?: boolean;
  isRealName?: boolean;
  highlightedComment?: HighlightedComment;
}


// 오렌지픽 아티클
export interface OrangePickArticle {
  id: string;
  title: string;
  thumbnail: string;
  excerpt: string;
  author: string;
  createdAt: string;
}

export const orangePickArticles: OrangePickArticle[] = [
  {
    id: 'article-1',
    title: '2026년 주목해야 할 스타트업 트렌드 5가지',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    excerpt: 'AI 기반 자동화부터 지속가능성까지, 올해 스타트업 생태계를 이끌 핵심 트렌드를 정리했습니다.',
    author: 'Orange Park 에디터',
    createdAt: '2026-03-15T10:00:00'
  },
  {
    id: 'article-2',
    title: '성공적인 피칭을 위한 IR 자료 작성법',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop',
    excerpt: '투자자의 마음을 사로잡는 IR 자료를 만드는 실전 노하우를 공개합니다.',
    author: 'Orange Park 에디터',
    createdAt: '2026-03-10T14:00:00'
  },
  {
    id: 'article-3',
    title: '초기 스타트업의 첫 채용, 이것만은 꼭!',
    thumbnail: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=250&fit=crop',
    excerpt: '첫 팀원을 영입할 때 놓치기 쉬운 중요한 포인트들을 살펴봅니다.',
    author: 'Orange Park 에디터',
    createdAt: '2026-03-05T09:00:00'
  }
];



// 공지사항 목 데이터
export const mockNotices: CommunityPost[] = [
  {
    id: 'notice-1',
    type: 'notice',
    title: '[공지] Orange Park 커뮤니티 오픈 안내',
    content: '안녕하세요. Orange Park 커뮤니티가 정식 오픈했습니다. 자유롭게 소통하며 성장해요!',
    author: {
      id: 'admin',
      name: '관리자',
      nickname: 'Orange Park',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    createdAt: '2026-01-20T10:00:00',
    views: 1234,
    likes: 89,
    commentCount: 0,
    isLikedByMe: false,
    isHighlight: true,
  },
  {
    id: 'notice-2',
    type: 'notice',
    title: '[이벤트] 첫 게시글 작성하고 포인트 받자!',
    content: '커뮤니티 오픈 기념 이벤트! 첫 게시글 작성하시는 분들께 500포인트를 드립니다.',
    author: {
      id: 'admin',
      name: '관리자',
      nickname: 'Orange Park',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    createdAt: '2026-01-22T14:00:00',
    views: 892,
    likes: 156,
    commentCount: 0,
    isLikedByMe: false,
  },
];

// 커뮤니티 게시글 목 데이터
export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post-1',
    type: 'community',
   
    title: '초기 스타트업 MVP 개발 시 우선순위 정하는 팁 있나요?',
    content: '안녕하세요. 처음 창업을 준비 중인데요, MVP를 만들 때 어떤 기능을 우선적으로 개발해야 할지 고민입니다. 예산과 시간이 제한적이라 선택과 집중이 필요한데, 혹시 경험 있으신 분들의 조언 부탁드립니다!',
    author: {
      id: 'profile-user-1-nickname',
      accountId: 'account-user-1',
      profileId: 'profile-user-1-nickname',
      mode: 'nickname',
      name: '김창업',
      nickname: 'StartupDreamer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      position: '스타트업 대표',
    },
    createdAt: '2026-03-19T09:30:00',
    views: 342,
    likes: 24,
    commentCount: 18,
    isLikedByMe: false,
    tags: ['MVP', '스타트업', '개발'],
    isPromotion: true,
  },
  {
    id: 'post-1-with-images',
    type: 'community',
    
    title: '우리 팀 오피스 구하기 성공! 공유 오피스 vs 독립 오피스 비교',
    content: '드디어 우리 팀만의 오피스를 구했습니다! 🎉 지난 3개월간 공유 오피스와 독립 오피스를 비교 분석하면서 얻은 인사이트를 공유해요. 초기 스타트업이라면 꼭 고려해야 할 포인트들을 정리했습니다. 위치, 비용, 네트워킹 기회, 확장성 등 다양한 측면에서 비교해봤어요!',
    author: {
      id: 'user-7',
      name: '이성공',
      nickname: 'SpaceHunter',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      position: 'CEO, 스타트업코리아',
    },
    createdAt: '2026-03-18T14:20:00',
    views: 1245,
    likes: 89,
    commentCount: 34,
    isLikedByMe: true,
    tags: ['본 발견', 'BM 개발', '오피스'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
    ],
    isHighlight: true,
    isRealName: true,
  },
  {
    id: 'post-2-with-images',
    type: 'community',
    
    title: '제품 디자인 스프린트 5일간의 기록 (feat. 실제 결과물)',
    content: '구글 벤처스의 디자인 스프린트 방법론을 우리 팀에 적용해봤습니다. 월요일부터 금요일까지 5일간 진행한 전 과정을 사진과 함께 공유합니다. 프로토타입 제작부터 사용자 테스트까지, 정말 밀도 높은 일주일이었어요. 결과적으로 우리 제품의 핵심 기능을 3개에서 1개로 축소하는 중요한 결정을 내릴 수 있었습니다.',
    author: {
      id: 'user-8',
      name: '박디자인',
      nickname: 'DesignSprinter',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
      position: 'Product Designer',
    },
    createdAt: '2026-03-17T16:30:00',
    views: 892,
    likes: 67,
    commentCount: 28,
    isLikedByMe: false,
    tags: ['디자인스프린트', '프로토타입', 'UX'],
    images: [
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
    ],
  },
  {
    id: 'post-with-following-comment',
    type: 'community',
 
    title: '초기 스타트업 투자 유치 경험 공유합니다',
    content: '작년에 시드 투자 3곳을 유치한 경험을 바탕으로 IR 자료 작성법, 투자자 미팅 준비, 밸류에이션 협상 등 실전에서 정말 중요했던 부분들을 정리해봤습니다. 특히 우리가 받았던 질문들과 그에 대한 답변 전략을 공유하면 도움이 될 것 같아서요.',
    author: {
      id: 'user-12',
      name: '최서연',
      nickname: 'FundingMaster',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      position: '마케터',
    },
    createdAt: '2026-03-18T10:00:00',
    views: 1234,
    likes: 89,
    commentCount: 34,
    isLikedByMe: false,
    tags: ['자금 조달', 'BM 개발'],
    isPromotion: true,
    highlightedComment: {
      id: 'highlighted-comment-1',
      author: {
        id: 'profile-user-13-nickname',
        accountId: 'account-user-13',
        profileId: 'profile-user-13-nickname',
        mode: 'nickname',
        name: '김개발',
        nickname: 'DevExpert',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        isFollowing: true,
      },
      content: '혹시 백엔드 스택이 구체적으로 어떻게 되나요? NestJS 사용하시나요?',
      createdAt: '2026-03-17T14:30:00',
      likes: 2,
      replyCount: 0,
    },
  },
  {
    id: 'post-3-with-images',
    type: 'community',
    
    title: '스타트업 박람회 다녀왔어요! 부스 세팅 꿀팁 공유',
    content: '어제 코엑스에서 열린 스타트업 박람회에 참가했습니다. 처음 부스를 운영해봤는데, 준비 과정에서 배운 점이 많아서 공유해요. 부스 디자인, 홍보물 제작, 방문객 응대 노하우까지! 특히 QR코드를 활용한 명함 교환이 정말 효과적이었어요.',
    author: {
      id: 'user-9',
      name: '최마케팅',
      nickname: 'EventMaster',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      position: '마케팅 팀장',
    },
    createdAt: '2026-03-16T10:15:00',
    views: 567,
    likes: 45,
    commentCount: 19,
    isLikedByMe: false,
    tags: ['박람회', '마케팅', '네트워킹'],
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    ],
    isPromotion: true,
  },
  {
    id: 'post-2',
    type: 'community',
   
    title: '린 캔버스 작성할 때 자주 하는 실수 5가지',
    content: `많은 분들이 린 캔버스를 작성하실 때 이런 실수를 하시더라고요:\n\n1. 고객 세그먼트를 너무 넓게 잡는다\n2. 문제보다 솔루션에 집착한다\n3. 핵심 지표를 정량화하지 않는다\n4. 비용 구조를 과소평가한다\n5. 경쟁사 분석을 건너뛴다\n\n저도 처음에 많이 헤맸는데, 이 부분들만 주의하셔도 훨씬 나은 비즈니스 모델을 만들 수 있습니다!`,
    author: {
      id: 'user-2',
      name: '박멘토',
      nickname: 'BizModelPro',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      position: '비즈니스 컨설턴트',
    },
    createdAt: '2026-03-15T15:20:00',
    views: 1456,
    likes: 189,
    commentCount: 42,
    isLikedByMe: true,
    tags: ['린캔버스', '비즈니스모델', '팁'],
    isHighlight: true,
    isRealName: true,
  },
  {
    id: 'post-3',
    type: 'study',
    studyId: '1',
    studyTitle: '린 스타트업 실전 프로젝트',
    title: '1주차 과제 공유: 우리 팀의 고객 인터뷰 결과',
    content: `안녕하세요! 린 스타트업 스터디 참여 중인 이창업입니다.

이번 주 고객 인터뷰를 총 15명과 진행했는데요, 예상과 다른 인사이트를 많이 얻었습니다.

주요 발견사항:
- 우리가 생각한 '핵심 문제'가 실제로는 부차적인 문제였음
- 타겟 고객층이 우리 예상보다 10년 이상 어림
- 지불 의사가 있는 가격대가 예상의 2배

다음 주에는 피벗 방향을 논의해볼 예정입니다. 다른 팀원분들은 어떤 결과가 나오셨나요?`,
    author: {
      id: 'user-3',
      name: '이창업',
      nickname: 'LeanStartuper',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      position: 'Product Manager',
    },
    createdAt: '2026-01-26T11:00:00',
    views: 234,
    likes: 31,
    commentCount: 12,
    isLikedByMe: false,
    tags: ['고객인터뷰', '린스타트업', '인사이트'],
  },
  {
    id: 'post-4',
    type: 'community',
    
    title: '오늘 첫 투자 미팅 다녀왔습니다 (후기)',
    content: `떨리는 마음으로 첫 VC 미팅을 다녀왔어요. 

결과는... 거절당했습니다 😅

하지만 정말 값진 피드백을 받았어요:
- IR 자료가 너무 기술 중심적이었다
- 시장 크기 근거가 약했다
- 수익 모델이 불명확하다

다음 미팅 전에 자료를 완전히 수정해야겠어요. 비록 거절당했지만 배운 게 많은 하루였습니다!`,
    author: {
      id: 'user-4',
      name: '정도전',
      nickname: 'FundingHunter',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      position: 'COO',
    },
    createdAt: '2026-01-25T18:45:00',
    views: 892,
    likes: 67,
    commentCount: 28,
    isLikedByMe: false,
    tags: ['투자유치', '후기', 'IR'],
  },
  {
    id: 'post-5',
    type: 'community',
  
    title: '[모집] B2B SaaS 스타트업 공동창업자를 찾습니다',
    content: `안녕하세요. 중소기업 HR 솔루션을 개발 중입니다.

현재 상황:
- MVP 개발 90% 완료
- 파일럿 고객 3곳 확보
- 시드 투자 논의 중

찾는 분:
- 마케팅/세일즈 경험 3년 이상
- B2B 영업 경험 필수
- 책임감과 실행력을 갖춘 분

관심 있으신 분은 DM 주세요!`,
    author: {
      id: 'user-5',
      name: '최기술',
      nickname: 'TechFounder',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
      position: 'CTO',
    },
    createdAt: '2026-01-25T10:00:00',
    views: 567,
    likes: 23,
    commentCount: 15,
    isLikedByMe: false,
    tags: ['공동창업자', '모집', 'B2B'],
  },
  {
    id: 'post-6',
    type: 'study',
    studyId: '2',
    studyTitle: '그로스 해킹 마케팅 스터디',
    title: '실습 과제 공유: 우리 서비스 AARRR 지표 분석',
    content: `이번 주 과제로 AARRR 프레임워크로 우리 서비스를 분석해봤습니다.

Acquisition (획득): 주 20명
Activation (활성화): 60%
Retention (재방문): 30%
Revenue (수익): 전환율 5%
Referral (추천): 거의 없음 😭

가장 큰 문제는 Retention과 Referral인 것 같아요. 다음 주에는 이 부분 개선 전략을 논의해봐야겠습니다!`,
    author: {
      id: 'user-6',
      name: '강성장',
      nickname: 'GrowthHacker',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      position: 'Growth Manager',
    },
    createdAt: '2026-01-24T16:30:00',
    views: 445,
    likes: 38,
    commentCount: 21,
    isLikedByMe: true,
    tags: ['그로스해킹', 'AARRR', '지표분석'],
  },
  {
    id: 'post-7',
    type: 'community',
    
    title: 'Orange Park 스터디 3개월 참여 후기',
    content: `작년 10월부터 3개월간 린 스타트업 스터디에 참여했어요.

좋았던 점:
✅ 실무 경험 풍부한 멘토님의 피드백
✅ 매주 과제로 실전 감각 유지
✅ 다양한 업계 사람들과의 네트워킹
✅ MVP 실제로 만들어보는 경험

아쉬웠던 점:
- 온라인이라 집중력 유지가 어려웠음
- 과제량이 생각보다 많았음

전반적으로 정말 만족스러운 경험이었고, 덕분에 지금은 실제 창업 준비 중입니다! 추천합니다 👍`,
    author: {
      id: 'user-7',
      name: '송만족',
      nickname: 'HappyLearner',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      position: '창업 준비생',
    },
    createdAt: '2026-01-24T09:15:00',
    views: 1123,
    likes: 94,
    commentCount: 31,
    isLikedByMe: false,
    tags: ['후기', '스터디', '추천'],
    isHighlight: true,
  },
  {
    id: 'post-8',
    type: 'community',
   
    title: '법인 설립 시기, 언제가 적절할까요?',
    content: `사업자등록은 했는데 법인 전환을 언제 해야 할지 고민입니다.

현재 상황:
- 월 매출 1000만원 수준
- 팀원 2명 (정규직 아님)
- 투자 유치 계획 있음

법인 설립 비용도 만만치 않고, 관리도 복잡해진다고 들었는데... 경험자분들의 조언 부탁드립니다!`,
    author: {
      id: 'user-8',
      name: '윤초보',
      nickname: 'NewbieFounder',
      avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop',
      position: '1인 창업자',
    },
    createdAt: '2026-01-23T14:20:00',
    views: 678,
    likes: 45,
    commentCount: 34,
    isLikedByMe: false,
    tags: ['법인설립', '창업', '세무'],
  },
  {
    id: 'post-9',
    type: 'community',
   
    title: '시드 투자 유치 성공! 우리가 준비한 3가지',
    content: `6개월간의 긴 여정 끝에 드디어 시드 투자를 유치했습니다! 🎉

성공 요인 3가지를 공유합니다:

1️⃣ 명확한 문제 정의와 검증
- 100명 이상 고객 인터뷰
- 실제 페인포인트 데이터 수집

2️⃣ 실행 가능한 비즈니스 모델
- MVP로 실제 매출 발생
- 유닛 이코노믹스 계산

3️⃣ 탄탄한 팀 구성
- 상호 보완적인 공동창업자
- 관련 분야 경험 5년 이상

다들 힘내세요! 포기하지 마세요!`,
    author: {
      id: 'user-10',
      name: '한성공',
      nickname: 'SeriesASoon',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop',
      position: 'Founder & CEO',
    },
    createdAt: '2026-03-18T16:00:00',
    views: 2341,
    likes: 287,
    commentCount: 78,
    isLikedByMe: false,
    tags: ['시드투자', '성공사례', '팁'],
    isHighlight: true,
  },
  {
    id: 'post-10',
    type: 'community',
    
    title: '피칭 덱 10장으로 줄이기: 투자자가 원하는 핵심만',
    content: `많은 창업가분들이 피칭 덱을 너무 길게 만드는 경향이 있어요.

제가 30번 이상의 피칭 끝에 찾은 최적의 구성:

1. 문제 (1장)
2. 솔루션 (1장)
3. 시장 크기 (1장)
4. 제품 (2장)
5. 비즈니스 모델 (1장)
6. 경쟁사 (1장)
7. 트랙션 (1장)
8. 팀 (1장)
9. 재무 계획 (1장)
10. Ask (1장)

각 슬라이드에 핵심 메시지 1개만 담으세요!`,
    author: {
      id: 'user-11',
      name: '조피칭',
      nickname: 'PitchMaster',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      position: 'Investment Lead',
    },
    createdAt: '2026-03-17T11:30:00',
    views: 1876,
    likes: 234,
    commentCount: 56,
    isLikedByMe: true,
    tags: ['피칭덱', 'IR', '투자유치'],
    isHighlight: true,
  },
];

// 인기 게시글 (좋아요 순)
export const getPopularPosts = (
  type?: 'study' | 'community',
  limit: number = 5,
): CommunityPost[] => {
  let posts = mockCommunityPosts;

  if (type) {
    posts = posts.filter((post) => post.type === type);
  }

  return [...posts].sort((a, b) => b.likes - a.likes).slice(0, limit);
};

export interface CommentAuthor extends CommunityInteractionAuthor {}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  author: CommentAuthor;
  content: string;
  createdAt: string;
  likes: number;
  isLikedByMe: boolean;
  replies?: Comment[];
}
// 댓글 목 데이터
export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    author: {
      id: 'profile-user-9-nickname',
      accountId: 'account-user-9',
      profileId: 'profile-user-9-nickname',
      mode: 'nickname',
      name: '황선배',
      nickname: 'MVPExpert',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    content: '제 경험상 가장 중요한 건 "고객이 돈을 낼 만한 핵심 가치"를 먼저 구현하는 거예요. 나머지는 나중에 추가해도 됩니다.',
    createdAt: '2026-01-27T10:15:00',
    likes: 12,
    isLikedByMe: false,
    replies: [
      {
        id: 'reply-1',
        postId: 'post-1',
        parentId: 'comment-1',
        author: {
          id: 'profile-user-1-nickname',
          accountId: 'account-user-1',
          profileId: 'profile-user-1-nickname',
          mode: 'nickname',
          name: '김창업',
          nickname: 'StartupDreamer',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        },
        content: '아 그렇군요! 그럼 고객 인터뷰를 먼저 더 해봐야겠네요. 감사합니다!',
        createdAt: '2026-01-27T10:30:00',
        likes: 3,
        isLikedByMe: false,
      },
    ],
  },
  {
    id: 'comment-post-1-devexpert',
    postId: 'post-1',
    author: {
      id: 'profile-user-13-nickname',
      accountId: 'account-user-13',
      profileId: 'profile-user-13-nickname',
      mode: 'nickname',
      name: '김개발',
      nickname: 'DevExpert',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      isFollowing: true,
    },
    content: 'MVP는 반드시 결제나 신청처럼 핵심 전환 액션부터 검증하는 게 좋습니다. 부가 기능은 최대한 뒤로 미루세요.',
    createdAt: '2026-03-19T11:10:00',
    likes: 5,
    isLikedByMe: false,
  },
  {
    id: 'comment-post-1-bizmodel',
    postId: 'post-1',
    author: {
      id: 'user-2',
      name: '박멘토',
      nickname: 'BizModelPro',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      isFollowing: false,
    },
    content: '고객 인터뷰 결과를 기준으로 우선순위를 자르는 방식이 가장 안전합니다.',
    createdAt: '2026-03-19T12:00:00',
    likes: 3,
    isLikedByMe: false,
  },
  {
    id: 'comment-post-2-devexpert',
    postId: 'post-2',
    author: {
      id: 'profile-user-13-nickname',
      accountId: 'account-user-13',
      profileId: 'profile-user-13-nickname',
      mode: 'nickname',
      name: '김개발',
      nickname: 'DevExpert',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      isFollowing: true,
    },
    content: '특히 고객 세그먼트를 넓게 잡는 실수 정말 공감합니다. 저희도 그 부분 때문에 초반에 메시지가 많이 흐려졌어요.',
    createdAt: '2026-03-15T18:40:00',
    likes: 7,
    isLikedByMe: false,
  },
  {
    id: 'comment-post-9-devexpert',
    postId: 'post-9',
    author: {
      id: 'profile-user-13-nickname',
      accountId: 'account-user-13',
      profileId: 'profile-user-13-nickname',
      mode: 'nickname',
      name: '김개발',
      nickname: 'DevExpert',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      isFollowing: true,
    },
    content: '실제 매출을 만든 상태에서 투자자를 만난 점이 인상적이네요. 초기 트랙션 설계에 정말 도움이 됩니다.',
    createdAt: '2026-03-18T19:15:00',
    likes: 4,
    isLikedByMe: false,
  },
  {
    id: 'comment-post-9-growth',
    postId: 'post-9',
    author: {
      id: 'user-6',
      name: '강성장',
      nickname: 'GrowthHacker',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      isFollowing: false,
    },
    content: '고객 인터뷰 100명 이상 진행한 부분이 특히 인상 깊습니다.',
    createdAt: '2026-03-18T20:05:00',
    likes: 2,
    isLikedByMe: false,
  },
];
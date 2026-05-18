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
    createdAt: '2026-03-15T10:00:00',
  },
  {
    id: 'article-2',
    title: '성공적인 피칭을 위한 IR 자료 작성법',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop',
    excerpt: '투자자의 마음을 사로잡는 IR 자료를 만드는 실전 노하우를 공개합니다.',
    author: 'Orange Park 에디터',
    createdAt: '2026-03-10T14:00:00',
  },
  {
    id: 'article-3',
    title: '초기 스타트업의 첫 채용, 이것만은 꼭!',
    thumbnail: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=250&fit=crop',
    excerpt: '첫 팀원을 영입할 때 놓치기 쉬운 중요한 포인트들을 살펴봅니다.',
    author: 'Orange Park 에디터',
    createdAt: '2026-03-05T09:00:00',
  },
];

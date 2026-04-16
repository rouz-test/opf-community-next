

export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
};

export type TiptapDoc = {
  type: 'doc';
  content?: TiptapNode[];
};

export type ContentPublicationStatus = 'draft' | 'published' | 'archived';

export interface ContentStats {
  viewCount: number;
  likeCount: number;
  saveCount: number;
  commentCount: number;
  replyCount: number;
}

export interface ContentFlags {
  isPinned: boolean;
  isNotice: boolean;
  isPromoted: boolean;
}

export interface ContentTimestamps {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Content {
  id: string;
  title: string;
  body: TiptapDoc;
  authorId: string;
  isAnonymous: boolean;
  tagIds: string[];
  publicationStatus: ContentPublicationStatus;
  flags: ContentFlags;
  timestamps: ContentTimestamps;
  stats: ContentStats;
}
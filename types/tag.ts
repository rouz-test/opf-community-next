

export type TagStatus = 'active' | 'inactive';

export interface TagStyle {
  color: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  status: TagStatus;
  isDefault: boolean;
  sortOrder: number;
  style: TagStyle;
  createdAt: string;
  updatedAt: string;
}

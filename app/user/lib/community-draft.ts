import type { CommunityContentBody } from '@/types/community-content';

const COMMUNITY_POST_DRAFT_STORAGE_KEY = 'opf-community-user-post-draft';

export type CommunityPostDraft = {
  title: string;
  content: CommunityContentBody;
  selectedTags: string[];
  isPromotion: boolean;
  profileModeOverride: 'real' | 'anonymous' | null;
  savedAt: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isContentBody(value: unknown): value is CommunityContentBody {
  return isObject(value) && typeof value.type === 'string';
}

export function loadCommunityPostDraft(): CommunityPostDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawValue = window.localStorage.getItem(COMMUNITY_POST_DRAFT_STORAGE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<CommunityPostDraft>;

    if (
      typeof parsed.title !== 'string' ||
      !isContentBody(parsed.content) ||
      !Array.isArray(parsed.selectedTags) ||
      !parsed.selectedTags.every((tag) => typeof tag === 'string') ||
      typeof parsed.isPromotion !== 'boolean'
    ) {
      return null;
    }

    return {
      title: parsed.title,
      content: parsed.content,
      selectedTags: parsed.selectedTags,
      isPromotion: parsed.isPromotion,
      profileModeOverride:
        parsed.profileModeOverride === 'real' || parsed.profileModeOverride === 'anonymous'
          ? parsed.profileModeOverride
          : null,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveCommunityPostDraft(draft: CommunityPostDraft) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(COMMUNITY_POST_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function clearCommunityPostDraft() {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(COMMUNITY_POST_DRAFT_STORAGE_KEY);
}

import type { BlockedWord } from '@/types/blocked-word';
import type { CommunityContentBody } from '@/types/community-content';

export type BlockedWordMatchResult = {
  hasBlockedWords: boolean;
  matchedKeywords: string[];
};

function normalizeKeyword(value: string) {
  return value.trim().toLowerCase();
}

export function extractTextFromContentBody(node?: CommunityContentBody | null): string {
  if (!node) return '';

  const parts: string[] = [];

  const visit = (currentNode?: CommunityContentBody | null) => {
    if (!currentNode) return;

    if (typeof currentNode.text === 'string' && currentNode.text.trim()) {
      parts.push(currentNode.text);
    }

    currentNode.content?.forEach((childNode) => visit(childNode));
  };

  visit(node);

  return parts.join(' ').trim();
}

export function findMatchedBlockedWords(
  text: string,
  blockedWords: BlockedWord[],
): BlockedWordMatchResult {
  const normalizedText = text.trim().toLowerCase();

  if (!normalizedText) {
    return {
      hasBlockedWords: false,
      matchedKeywords: [],
    };
  }

  const matchedKeywords = blockedWords
    .map((item) => item.keyword.trim())
    .filter((keyword) => keyword.length > 0)
    .filter((keyword) => normalizedText.includes(normalizeKeyword(keyword)))
    .filter((keyword, index, source) => source.indexOf(keyword) === index)
    .sort((a, b) => b.length - a.length);

  return {
    hasBlockedWords: matchedKeywords.length > 0,
    matchedKeywords,
  };
}

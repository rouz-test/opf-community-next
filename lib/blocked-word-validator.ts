import type { BlockedWord } from '@/types/blocked-word';
import type { CommunityContentBody } from '@/types/community-content';

export type BlockedWordMatchResult = {
  hasBlockedWords: boolean;
  matchedKeywords: string[];
};

function normalizeKeyword(value: string) {
  return value.trim().toLowerCase();
}

const BLOCK_TEXT_NODE_TYPES = new Set(['paragraph', 'heading', 'blockquote', 'codeBlock']);

function normalizeLine(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function collectInlineText(node?: CommunityContentBody | null): string {
  if (!node) return '';

  if (node.type === 'hardBreak') {
    return '\n';
  }

  if (typeof node.text === 'string') {
    return node.text;
  }

  return (node.content ?? []).map((childNode) => collectInlineText(childNode)).join('');
}

function extractLinesFromContentBody(node?: CommunityContentBody | null): string[] {
  if (!node) return [];

  if (BLOCK_TEXT_NODE_TYPES.has(node.type)) {
    return collectInlineText(node)
      .split(/\r?\n/)
      .map((line) => normalizeLine(line))
      .filter(Boolean);
  }

  return (node.content ?? []).flatMap((childNode) => extractLinesFromContentBody(childNode));
}

export function extractTextFromContentBody(node?: CommunityContentBody | null): string {
  if (!node) return '';

  return extractLinesFromContentBody(node).join('\n');
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

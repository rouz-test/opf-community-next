'use client';

import { Box, Flex, Text } from '@chakra-ui/react';

import AdminButton from '@/app/admin/components/ui/button';
import BaseModal from '@/app/admin/components/modal/base-modal';

type BlockedWordAlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  matchedKeywords: string[];
  sourceText?: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function splitTextIntoSegments(sourceText: string) {
  const normalizedText = normalizeWhitespace(sourceText);
  if (!normalizedText) return [];

  const sentenceMatches = normalizedText.match(/[^.!?。！？\n]+[.!?。！？]?/g);
  return sentenceMatches?.map((sentence) => sentence.trim()).filter(Boolean) ?? [normalizedText];
}

function createMatchedSegments(sourceText: string | undefined, matchedKeywords: string[]) {
  if (!sourceText?.trim()) return [];

  const normalizedKeywords = matchedKeywords.map((keyword) => keyword.trim()).filter(Boolean);
  if (normalizedKeywords.length === 0) return [];

  const segments = splitTextIntoSegments(sourceText);

  return segments
    .map((segment) => {
      const matchedInSegment = normalizedKeywords.filter((keyword) =>
        segment.toLowerCase().includes(keyword.toLowerCase()),
      );

      if (matchedInSegment.length === 0) return null;

      return {
        text: segment,
        matchedKeywords: matchedInSegment,
      };
    })
    .filter((segment): segment is { text: string; matchedKeywords: string[] } => Boolean(segment));
}

function renderHighlightedSegment(segmentText: string, matchedKeywords: string[]) {
  const normalizedKeywords = matchedKeywords
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (normalizedKeywords.length === 0) return segmentText;

  const pattern = new RegExp(`(${normalizedKeywords.map(escapeRegExp).join('|')})`, 'gi');
  const parts = segmentText.split(pattern);

  return parts.map((part, index) => {
    const isMatched = normalizedKeywords.some((keyword) => part.toLowerCase() === keyword.toLowerCase());

    if (!isMatched) return part;

    return (
      <Text key={`${part}-${index}`} as="span" color="#DC2626" fontWeight="700">
        {part}
      </Text>
    );
  });
}

export default function BlockedWordAlertModal({
  isOpen,
  onClose,
  title = '금지 키워드가 포함되어 진행할 수 없습니다.',
  description = '아래 금지 키워드를 수정한 뒤 다시 시도해주세요.',
  matchedKeywords,
  sourceText,
}: BlockedWordAlertModalProps) {
  const matchedSegments = createMatchedSegments(sourceText, matchedKeywords);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <Flex w="100%">
          <AdminButton type="button" variantStyle="primary" size="md" onClick={onClose} flex={1}>
            확인
          </AdminButton>
        </Flex>
      }
    >
      <Flex direction="column" gap="12px">
        <Text fontSize="13px" color="#4B5563" lineHeight="1.7">
          {description}
        </Text>

        <Box
          borderWidth="1px"
          borderColor="#F3E7C7"
          bg="#FFFCF5"
          borderRadius="12px"
          px="14px"
          py="12px"
        >
          <Text fontSize="12px" fontWeight="700" color="#92400E" mb="8px">
            감지된 문맥
          </Text>

          {matchedSegments.length > 0 ? (
            <Flex direction="column" gap="6px">
              {matchedSegments.map((segment, index) => (
                <Text key={`${segment.text}-${index}`} fontSize="13px" color="#374151" lineHeight="1.7">
                  {renderHighlightedSegment(segment.text, segment.matchedKeywords)}
                </Text>
              ))}
            </Flex>
          ) : (
            <Text fontSize="13px" color="#374151" lineHeight="1.7">
              {matchedKeywords.join(', ')}
            </Text>
          )}
        </Box>
      </Flex>
    </BaseModal>
  );
}

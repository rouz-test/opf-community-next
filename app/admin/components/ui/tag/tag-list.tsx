import { Flex, Text } from '@chakra-ui/react';

import type { ResolvedTag } from '@/lib/tags';

import AdminTagBadge from './tag-badge';

type AdminTagListProps = {
  tags: ResolvedTag[];
  maxVisible?: number;
  emptyLabel?: string;
};

export default function AdminTagList({
  tags,
  maxVisible = 2,
  emptyLabel = '-',
}: AdminTagListProps) {
  if (tags.length === 0) {
    return (
      <Text fontSize="12px" color="#9CA3AF">
        {emptyLabel}
      </Text>
    );
  }

  const visibleTags = tags.slice(0, maxVisible);
  const hiddenCount = Math.max(0, tags.length - visibleTags.length);

  return (
    <Flex align="center" gap="6px" minW="0" wrap="nowrap">
      {visibleTags.map((tag) => (
        <AdminTagBadge key={tag.id} tag={tag} />
      ))}
      {hiddenCount > 0 ? (
        <Text fontSize="12px" fontWeight="600" color="#6B7280" whiteSpace="nowrap">
          +{hiddenCount}
        </Text>
      ) : null}
    </Flex>
  );
}

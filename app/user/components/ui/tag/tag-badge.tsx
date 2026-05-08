import { Text } from '@chakra-ui/react';

import type { ResolvedTag } from '@/lib/tags';

type UserTagBadgeProps = {
  tag: ResolvedTag;
};

export default function UserTagBadge({ tag }: UserTagBadgeProps) {
  return (
    <Text
      as="span"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      px="10px"
      h="20px"
      borderRadius="5px"
      fontSize="11px"
      fontWeight="600"
      lineHeight="1"
      color="#FFFFFF"
      bg={tag.color}
      whiteSpace="nowrap"
    >
      {tag.name}
    </Text>
  );
}

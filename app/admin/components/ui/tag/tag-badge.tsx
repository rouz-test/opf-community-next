import { Text } from '@chakra-ui/react';

import type { ResolvedTag } from '@/lib/tags';

function withAlpha(hex: string, alphaHex: string = '66') {
  if (!hex) return hex;
  if (hex.startsWith('#') && hex.length === 7) {
    return `${hex}${alphaHex}`;
  }
  return hex;
}

type AdminTagBadgeProps = {
  tag: ResolvedTag;
};

export default function AdminTagBadge({ tag }: AdminTagBadgeProps) {
  return (
    <Text
      as="span"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      px="10px"
      py="4px"
      borderRadius="9999px"
      fontSize="11px"
      fontWeight="600"
      lineHeight="1"
      color={tag.textColor}
      bg={tag.bgColor}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={withAlpha(tag.textColor)}
      whiteSpace="nowrap"
    >
      {tag.name}
    </Text>
  );
}
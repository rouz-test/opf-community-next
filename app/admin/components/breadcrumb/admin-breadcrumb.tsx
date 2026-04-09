'use client';

import { Flex, Text } from '@chakra-ui/react';

type AdminBreadcrumbProps = {
  items: string[];
};

export default function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <Flex minW="0" align="center" fontSize="14px" fontWeight="500" color="#6B7280">
      {items.map((item, index) => (
        <Flex key={`${item}-${index}`} minW="0" align="center">
          {index > 0 ? (
            <Text mx="12px" color="#9CA3AF">
              &gt;
            </Text>
          ) : null}
          <Text minW="0" truncate>
            {item}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}

'use client';

import { Button, IconButton } from '@chakra-ui/react';
import { SquarePen } from 'lucide-react';

export type CommunityWriteActionProps = {
  onClick: () => void;
  variant?: 'floating' | 'sidebar';
};

export function CommunityWriteAction({
  onClick,
  variant = 'floating',
}: CommunityWriteActionProps) {
  if (variant === 'sidebar') {
    return (
      <Button
        type="button"
        onClick={onClick}
        mt="4"
        w="full"
        gap="2"
        rounded="lg"
        bg="#F97316"
        px="4"
        py="3"
        fontSize="sm"
        fontWeight="600"
        color="white"
        _hover={{ bg: '#EA580C' }}
      >
        <SquarePen size={16} />
        글쓰기
      </Button>
    );
  }

  return (
    <IconButton
      type="button"
      onClick={onClick}
      aria-label="글쓰기"
      title="글쓰기"
      variant="plain"
      position="fixed"
      right="4"
      bottom="6"
      zIndex="30"
      display={{ base: 'inline-flex', lg: 'none' }}
      h="14"
      w="14"
      minW="14"
      rounded="full"
      bg="#FF6900"
      color="white"
      boxShadow="0 12px 30px rgba(255, 105, 0, 0.32)"
      border="0"
      transition="all 0.2s"
      _hover={{
        bg: '#F25F00',
        transform: 'scale(1.05)',
        boxShadow: '0 16px 36px rgba(255, 105, 0, 0.38)',
      }}
      _active={{
        bg: '#E85A00',
        transform: 'translateY(1px) scale(0.95)',
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(255, 105, 0, 0.24), 0 12px 30px rgba(255, 105, 0, 0.32)',
      }}
    >
      <SquarePen size={20} />
    </IconButton>
  );
}

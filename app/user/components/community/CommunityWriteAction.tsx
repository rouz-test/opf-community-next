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
      position="fixed"
      right="4"
      bottom="6"
      zIndex="30"
      display={{ base: 'inline-flex', lg: 'none' }}
      h="14"
      w="14"
      rounded="full"
      bgGradient="linear(to-br, orange.400, orange.500)"
      color="white"
      boxShadow="0 12px 30px rgba(0,0,0,0.25)"
      borderWidth="1px"
      borderColor="blackAlpha.50"
      transition="all 0.2s"
      _hover={{
        transform: 'scale(1.05)',
        boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
      }}
      _active={{
        transform: 'translateY(1px) scale(0.95)',
      }}
    >
      <SquarePen size={20} />
    </IconButton>
  );
}

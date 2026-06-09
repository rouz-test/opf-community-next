'use client';

import type { ReactNode } from 'react';
import { Box, Button, Flex, Portal, Text } from '@chakra-ui/react';
import CloseIcon from '@/app/user/components/icons/CloseIcon';

type BaseModalProps = {
  isOpen: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxW?: string;
};

export default function BaseModal({
  isOpen,
  title,
  onClose,
  children,
  footer,
  maxW = '430px',
}: BaseModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <Flex position="fixed" inset="0" zIndex="120" align="center" justify="center" bg="rgba(0,0,0,0.35)" px="16px">
        <Box
          w="100%"
          maxW={maxW}
          borderRadius="16px"
          bg="#FFFFFF"
          p="24px"
          boxShadow="0 20px 40px rgba(17,24,39,0.18)"
        >
          <Flex align="flex-start" justify="space-between" gap="16px">
            <Text fontSize="15px" fontWeight="600" color="#4B5563">
              {title}
            </Text>
            <Button
              type="button"
              unstyled
              onClick={onClose}
              display="inline-flex"
              h="24px"
              w="24px"
              alignItems="center"
              justifyContent="center"
              color="#9CA3AF"
            aria-label="모달 닫기"
          >
              <CloseIcon size={20} />
            </Button>
          </Flex>

          <Box mt="12px" borderTop="1px solid" borderColor="#F3F4F6" />
          <Box mt="16px">{children}</Box>
          {footer ? <Box mt="28px">{footer}</Box> : null}
        </Box>
      </Flex>
    </Portal>
  );
}

'use client';

import { Box, Flex, Portal, Text } from '@chakra-ui/react';

import { Button } from '@/app/user/components/ui/button';

type ActionConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ActionConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = '취소',
  isLoading = false,
  onConfirm,
  onCancel,
}: ActionConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <Flex position="fixed" inset="0" zIndex="90" align="center" justify="center" bg="blackAlpha.500" px="4">
        <Box w="full" maxW="sm" rounded="24px" bg="white" p="6" boxShadow="0 20px 60px rgba(15, 23, 42, 0.18)">
          <Text textAlign="center" fontSize="16px" fontWeight="700" color="gray.900">
            {title}
          </Text>
          <Text mt="2" textAlign="center" fontSize="14px" lineHeight="1.7" color="gray.500">
            {description}
          </Text>

          <Flex mt="5" gap="3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              flex="1"
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={onConfirm}
              flex="1"
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : confirmLabel}
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Portal>
  );
}

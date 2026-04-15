'use client';

import {
  Flex,
  Icon,
  Input,
  InputGroup,
  Text,
} from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';
import BaseModal from '@/app/admin/components/modal/base-modal';
import AdminButton from '@/app/admin/components/ui/button';

type BlockedWordCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  errorMessage?: string;
  isSubmitting?: boolean;
};

export default function BlockedWordCreateModal({
  isOpen,
  onClose,
  value,
  onChange,
  onSubmit,
  errorMessage,
  isSubmitting = false,
}: BlockedWordCreateModalProps) {
  const trimmedValue = value.trim();
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="금지 키워드 등록"
      footer={
        <Flex gap="8px" w="100%">
          <AdminButton
            type="button"
            variantStyle="outline"
            size="md"
            onClick={onClose}
            flex={1}
          >
            취소
          </AdminButton>
          <AdminButton
            type="button"
            variantStyle="primary"
            size="md"
            onClick={onSubmit}
            flex={1}
            disabled={!trimmedValue || isSubmitting}
          >
            등록하기
          </AdminButton>
        </Flex>
      }
    >
      <Flex direction="column" gap="8px">
        <Text fontSize="12px" fontWeight="600" color="#4B5563">
          금지어 입력
        </Text>
        <InputGroup startElement={<Icon as={LuSearch} color="#9CA3AF" boxSize="14px" />}>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && trimmedValue && !isSubmitting) {
                onSubmit?.();
              }
            }}
            h="40px"
            borderRadius="8px"
            borderColor="#D1D5DB"
            placeholder="등록할 단어를 입력하세요. (예: 불법도박)"
            fontSize="13px"
            color="#111827"
            _placeholder={{ color: '#9CA3AF' }}
            _focus={{
              borderColor: '#D1D5DB',
              boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.05)',
              outline: 'none',
            }}
          />
        </InputGroup>
        {errorMessage && (
          <Text fontSize="12px" color="#DC2626">
            {errorMessage}
          </Text>
        )}
      </Flex>
    </BaseModal>
  );
}
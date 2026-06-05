'use client';

import { Box, Flex, Text, Textarea } from '@chakra-ui/react';
import { useEffect, useMemo, useState, type Ref } from 'react';

import { Button as UserButton } from '@/app/user/components/ui/button';
import UserSwitch from '@/app/user/components/ui/switch';

type CommentEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  identity?: 'real' | 'anonymous';
  onChangeIdentity?: (value: 'real' | 'anonymous') => void;
  displayName?: string;
  profileImageUrl?: string;
  textareaRef?: Ref<HTMLTextAreaElement>;
};

const MAX_COMMENT_LENGTH = 1000;

export default function CommentEditor({
  value,
  onChange,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  onCancel,
  placeholder = '댓글을 입력하세요.',
  autoFocus = false,
  identity = 'real',
  onChangeIdentity,
  textareaRef,
}: CommentEditorProps) {
  const trimmedLength = value.trim().length;
  const isTooLong = value.length > MAX_COMMENT_LENGTH;
  const isDisabled = trimmedLength === 0 || isTooLong || isSubmitting;

  const [internalIdentity, setInternalIdentity] = useState<'real' | 'anonymous'>(identity);
  const selectedIdentity = onChangeIdentity ? identity : internalIdentity;

  useEffect(() => {
    setInternalIdentity(identity);
  }, [identity]);

  const handleChangeIdentity = (nextIdentity: 'real' | 'anonymous') => {
    setInternalIdentity(nextIdentity);
    onChangeIdentity?.(nextIdentity);
  };

  const helperText = useMemo(() => {
    if (isTooLong) {
      return `댓글은 ${MAX_COMMENT_LENGTH}자 이하로 입력해주세요.`;
    }

    return `${value.length}/${MAX_COMMENT_LENGTH}`;
  }, [isTooLong, value.length]);

  return (
    <Box>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        minH="88px"
        resize="vertical"
        placeholder={placeholder}
        autoFocus={autoFocus}
        borderRadius="10px"
        borderColor="#E5E7EB"
        bg="#FFFFFF"
        fontSize="13px"
        color="#111827"
        _placeholder={{ color: '#9CA3AF' }}
        _focus={{
          outline: 'none',
          borderColor: '#F59E42',
          boxShadow: '0 0 0 2px rgba(245, 158, 66, 0.15)',
        }}
        _focusVisible={{
          outline: 'none',
          borderColor: '#F59E42',
          boxShadow: '0 0 0 2px rgba(245, 158, 66, 0.15)',
        }}
      />

      <Flex mt="10px" align="center" justify="space-between" gap="12px">
        <Flex as="label" align="center" cursor="pointer">
          <Text as="span" fontSize="13px" fontWeight="600" color="#6B7280">
            익명으로 작성하기
          </Text>
          <Box ml="10px">
            <UserSwitch
              checked={selectedIdentity === 'anonymous'}
              onCheckedChange={(checked) => {
                handleChangeIdentity(checked ? 'anonymous' : 'real');
              }}
              size="lg"
            />
          </Box>
        </Flex>

        <UserButton
          type="button"
          variant="default"
          h="32px"
          px="12px"
          minW="auto"
          onClick={onSubmit}
          disabled={isDisabled}
        >
          {submitLabel}
        </UserButton>
      </Flex>

      <Flex mt="6px" justify="space-between">
        <Text fontSize="11px" color={isTooLong ? '#DC2626' : '#9CA3AF'}>
          {helperText}
        </Text>

        {onCancel ? (
          <UserButton
            type="button"
            variant="outline"
            h="32px"
            px="12px"
            minW="auto"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </UserButton>
        ) : null}
      </Flex>
    </Box>
  );
}

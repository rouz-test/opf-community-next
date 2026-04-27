'use client';

import { Box, Flex, Image, Portal, Select, Text, Textarea, createListCollection } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';

import AdminButton from '@/app/admin/components/ui/button';

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
  displayName = '사용자',
  profileImageUrl,
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

  const profileInitial = displayName.trim().slice(0, 1).toUpperCase() || 'U';

  const identityOptions = useMemo(
    () => [
      { label: `${displayName}으로 작성`, value: 'real' as const },
      { label: '익명으로 작성', value: 'anonymous' as const },
    ],
    [displayName],
  );
  const identityCollection = useMemo(() => createListCollection({ items: identityOptions }), [identityOptions]);

  const helperText = useMemo(() => {
    if (isTooLong) {
      return `댓글은 ${MAX_COMMENT_LENGTH}자 이하로 입력해주세요.`;
    }

    return `${value.length}/${MAX_COMMENT_LENGTH}`;
  }, [isTooLong, value.length]);

  return (
    <Box>
      <Textarea
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
          borderColor: '#F59E42',
          boxShadow: '0 0 0 2px rgba(245, 158, 66, 0.15)',
        }}
      />

      <Flex mt="10px" align="center" justify="space-between">
        <Flex
          align="center"
          gap="8px"
          h="40px"
          minW="280px"
          px="10px"
          borderWidth="1px"
          borderColor="#E5E7EB"
          borderRadius="10px"
          bg="#FFFFFF"
        >
          <Box
            w="24px"
            h="24px"
            borderRadius="9999px"
            overflow="hidden"
            bg="#FB923C"
            color="#FFFFFF"
            fontSize="10px"
            fontWeight="700"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={displayName}
                w="100%"
                h="100%"
                objectFit="cover"
              />
            ) : (
              profileInitial
            )}
          </Box>

          <Select.Root
            size="sm"
            variant="ghost"
            flex="1"
            collection={identityCollection}
            value={[selectedIdentity]}
            onValueChange={(details) => {
              const nextValue = details.value[0];
              if (nextValue === 'real' || nextValue === 'anonymous') {
                handleChangeIdentity(nextValue);
              }
            }}
            positioning={{ sameWidth: false }}
            css={{
              '--select-trigger-padding-x': 'spacing.0',
            }}
          >
            <Select.Trigger
              h="38px"
              minH="38px"
              w="100%"
              px="0"
              border="none"
              bg="transparent"
              fontSize="13px"
              fontWeight="600"
              color="#374151"
              _hover={{ bg: 'transparent' }}
              _focus={{ boxShadow: 'none' }}
              _focusVisible={{ boxShadow: 'none' }}
            >
              <Select.ValueText flex="1" />
              <Select.Indicator color="#6B7280" />
            </Select.Trigger>

            <Portal>
              <Select.Positioner>
                <Select.Content borderRadius="10px" borderColor="#E5E7EB" boxShadow="0 12px 24px rgba(15, 23, 42, 0.12)" py="6px">
                  {identityOptions.map((opt) => (
                    <Select.Item
                      key={opt.value}
                      item={opt.value}
                      borderRadius="8px"
                      mx="6px"
                      px="10px"
                      py="8px"
                      fontSize="13px"
                      fontWeight="500"
                      color="#374151"
                      _hover={{ bg: '#F9FAFB' }}
                    >
                      <Select.ItemText>{opt.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Flex>

        <AdminButton
          type="button"
          variantStyle="primary"
          size="xs"
          minW="auto"
          onClick={onSubmit}
          disabled={isDisabled}
        >
          {submitLabel}
        </AdminButton>
      </Flex>

      <Flex mt="6px" justify="space-between">
        <Text fontSize="11px" color={isTooLong ? '#DC2626' : '#9CA3AF'}>
          {helperText}
        </Text>

        {onCancel ? (
          <AdminButton
            type="button"
            variantStyle="ghost"
            size="xs"
            minW="auto"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </AdminButton>
        ) : null}
      </Flex>
    </Box>
  );
}

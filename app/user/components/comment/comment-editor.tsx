'use client';

import { Box, Flex, Text, Textarea } from '@chakra-ui/react';
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref, type ReactNode } from 'react';

import MentionSuggestionLayer, {
  type MentionSuggestionItem,
} from '@/app/user/components/mention/MentionSuggestionLayer';
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
  mentionViewerAccountId?: string;
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
  mentionViewerAccountId = 'account-user-1',
}: CommentEditorProps) {
  const trimmedLength = value.trim().length;
  const isTooLong = value.length > MAX_COMMENT_LENGTH;
  const isDisabled = trimmedLength === 0 || isTooLong || isSubmitting;

  const [internalIdentity, setInternalIdentity] = useState<'real' | 'anonymous'>(identity);
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionRange, setMentionRange] = useState<{ start: number; end: number } | null>(null);
  const [mentionFloatingRect, setMentionFloatingRect] = useState<DOMRect | null>(null);
  const mentionAnchorRef = useRef<HTMLDivElement | null>(null);
  const textareaElementRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightLayerRef = useRef<HTMLDivElement | null>(null);
  const selectedIdentity = onChangeIdentity ? identity : internalIdentity;

  useEffect(() => {
    setInternalIdentity(identity);
  }, [identity]);

  useImperativeHandle(textareaRef, () => textareaElementRef.current as HTMLTextAreaElement);

  useEffect(() => {
    if (!isMentionOpen) return;

    const updateFloatingRect = () => {
      setMentionFloatingRect(mentionAnchorRef.current?.getBoundingClientRect() ?? null);
    };

    window.addEventListener('resize', updateFloatingRect);
    window.addEventListener('scroll', updateFloatingRect, true);

    return () => {
      window.removeEventListener('resize', updateFloatingRect);
      window.removeEventListener('scroll', updateFloatingRect, true);
    };
  }, [isMentionOpen]);

  const handleChangeIdentity = (nextIdentity: 'real' | 'anonymous') => {
    setInternalIdentity(nextIdentity);
    onChangeIdentity?.(nextIdentity);
  };

  const updateMentionState = (nextValue: string, selectionStart: number | null) => {
    const cursorIndex = selectionStart ?? nextValue.length;
    const beforeCursor = nextValue.slice(0, cursorIndex);
    const match = /(^|\s)@([^\s@]*)$/.exec(beforeCursor);

    if (!match) {
      setIsMentionOpen(false);
      setMentionQuery('');
      setMentionRange(null);
      setMentionFloatingRect(null);
      return;
    }

    const query = match[2] ?? '';
    const triggerStart = beforeCursor.length - query.length - 1;
    const rect = mentionAnchorRef.current?.getBoundingClientRect() ?? null;

    setMentionQuery(query);
    setMentionRange({ start: triggerStart, end: cursorIndex });
    setMentionFloatingRect(rect);
    setIsMentionOpen(query.length === 0 || query.length >= 1);
  };

  const insertMention = (item: MentionSuggestionItem) => {
    if (!mentionRange) return;

    const mentionText = `@${item.name} `;
    const nextValue = `${value.slice(0, mentionRange.start)}${mentionText}${value.slice(mentionRange.end)}`;

    onChange(nextValue);
    setIsMentionOpen(false);
    setMentionQuery('');
    setMentionRange(null);
    setMentionFloatingRect(null);
  };

  const renderHighlightedValue = () => {
    if (!value) return null;

    const mentionPattern = /@([가-힣A-Za-z0-9_]+)/g;
    const fragments: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mentionPattern.exec(value)) !== null) {
      if (match.index > lastIndex) {
        fragments.push(value.slice(lastIndex, match.index));
      }

      fragments.push(
        <Text as="span" key={`${match[0]}-${match.index}`} color="#11B3E9" fontWeight="700">
          {match[0]}
        </Text>,
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < value.length) {
      fragments.push(value.slice(lastIndex));
    }

    return fragments;
  };

  const helperText = useMemo(() => {
    if (isTooLong) {
      return `댓글은 ${MAX_COMMENT_LENGTH}자 이하로 입력해주세요.`;
    }

    return `${value.length}/${MAX_COMMENT_LENGTH}`;
  }, [isTooLong, value.length]);

  return (
    <Box>
      <Box ref={mentionAnchorRef} position="relative">
        <Box
          ref={highlightLayerRef}
          position="absolute"
          inset="1px"
          zIndex="0"
          overflow="hidden"
          pointerEvents="none"
          borderRadius="9px"
          bg="#FFFFFF"
          p="12px"
          fontSize="13px"
          lineHeight="1.5"
          color="#111827"
          whiteSpace="pre-wrap"
          wordBreak="break-word"
        >
          {renderHighlightedValue()}
        </Box>
        <Textarea
          ref={textareaElementRef}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            updateMentionState(event.target.value, event.target.selectionStart);
          }}
          onScroll={(event) => {
            if (!highlightLayerRef.current) return;

            highlightLayerRef.current.scrollTop = event.currentTarget.scrollTop;
            highlightLayerRef.current.scrollLeft = event.currentTarget.scrollLeft;
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsMentionOpen(false);
              setMentionFloatingRect(null);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setIsMentionOpen(false);
              setMentionFloatingRect(null);
            }, 120);
          }}
          minH="88px"
          resize="vertical"
          placeholder={placeholder}
          autoFocus={autoFocus}
          position="relative"
          zIndex="1"
          borderRadius="10px"
          borderColor="#E5E7EB"
          bg="transparent"
          p="12px"
          lineHeight="1.5"
          fontSize="13px"
          color={value ? 'transparent' : '#111827'}
          caretColor="#111827"
          _placeholder={{ color: '#9CA3AF' }}
          css={{
            WebkitTextFillColor: value ? 'transparent' : '#111827',
          }}
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
        <MentionSuggestionLayer
          open={isMentionOpen}
          query={mentionQuery}
          viewerAccountId={mentionViewerAccountId}
          onSelect={insertMention}
          floatingRect={mentionFloatingRect}
        />
      </Box>

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

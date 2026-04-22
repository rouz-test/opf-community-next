'use client';

import {
  Box,
  ColorPicker,
  Flex,
  IconButton,
  Input,
  Menu,
  Popover,
  Portal,
  Text,
  parseColor,
} from '@chakra-ui/react';
import type { Editor } from '@tiptap/react';
import Blockquote from '@tiptap/extension-blockquote';
import {
  LuAlignCenter,
  LuAlignJustify,
  LuAlignLeft,
  LuAlignRight,
  LuHighlighter,
  LuLink,
  LuLink2,
  LuPalette,
  LuQuote,
  LuUnlink,
} from 'react-icons/lu';
import { useEffect, useRef, useState } from 'react';

// =============================
// 공통 유틸 함수
// =============================
function getSafeColor(value: string, fallback: string) {
  try {
    return parseColor(value || fallback);
  } catch {
    return parseColor(fallback);
  }
}

// =============================
// 커스텀 Blockquote 확장
// =============================
export const StyledBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      quoteStyle: {
        default: 'line',
        parseHTML: (element) => element.getAttribute('data-quote-style') || 'line',
        renderHTML: (attributes) => ({
          'data-quote-style': attributes.quoteStyle || 'line',
        }),
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['blockquote', HTMLAttributes, 0];
  },
});

// =============================
// 커스텀 인용구 스타일
// =============================
export const contentEditorCustomStyles = {
  '& .ProseMirror blockquote': {
    marginTop: '16px',
    marginBottom: '16px',
    color: '#111827',
  },

  // =============================
  // 버티컬 라인 인용구
  // =============================
  "& .ProseMirror blockquote[data-quote-style='line']": {
    borderLeft: '4px solid #D1D5DB',
    paddingLeft: '12px',
    textAlign: 'left',
  },

  // =============================
  // 따옴표형 인용구
  // =============================
  "& .ProseMirror blockquote[data-quote-style='quote']": {
    textAlign: 'center',
    paddingTop: '24px',
    paddingBottom: '24px',
    position: 'relative',
    borderLeft: 'none',
  },
  "& .ProseMirror blockquote[data-quote-style='quote']::before": {
    content: '"❝"',
    display: 'block',
    fontSize: '48px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  "& .ProseMirror blockquote[data-quote-style='quote']::after": {
    content: '"❞"',
    display: 'block',
    fontSize: '48px',
    fontWeight: '700',
    marginTop: '8px',
  },

  // =============================
  // 프레임형 인용구
  // =============================
  "& .ProseMirror blockquote[data-quote-style='frame']": {
    border: '1px solid #D1D5DB',
    borderRadius: '12px',
    padding: '12px 16px',
    textAlign: 'left',
    borderLeft: 'none',
  },
};

// =============================
// 내부 전용 컴포넌트 (외부 export 안함)
// =============================
type EditorColorPickerProps = {
  label: string;
  value: string;
  fallback: string;
  icon: React.ElementType;
  onChange: (value: string) => void;
};

function EditorColorPicker({
  label,
  value,
  fallback,
  icon: Icon,
  onChange,
}: EditorColorPickerProps) {
  return (
    <ColorPicker.Root
      value={getSafeColor(value, fallback)}
      onValueChange={(details) => onChange(details.value.toString('hex'))}
      positioning={{ placement: 'bottom-start' }}
      lazyMount
      size="xs"
      variant="outline"
    >
      <ColorPicker.HiddenInput />
      <ColorPicker.Control>
        <ColorPicker.Trigger asChild>
          <IconButton
            aria-label={label}
            variant="ghost"
            size="sm"
            position="relative"
          >
            <Icon />
            <Box
              position="absolute"
              left="7px"
              right="7px"
              bottom="4px"
              h="3px"
              borderRadius="999px"
              bg={value || fallback}
            />
          </IconButton>
        </ColorPicker.Trigger>
      </ColorPicker.Control>
      <ColorPicker.Positioner>
        <ColorPicker.Content>
          <Flex direction="column" gap="10px" p="3">
            <Text fontSize="12px" fontWeight="600" color="#4B5563">
              {label}
            </Text>
            <ColorPicker.Area />
            <ColorPicker.ChannelSlider channel="hue" />
          </Flex>
        </ColorPicker.Content>
      </ColorPicker.Positioner>
    </ColorPicker.Root>
  );
}

// =============================
// 텍스트 색상 컨트롤
// =============================
export type EditorTextColorControlProps = {
  editor: Editor;
};

export function EditorTextColorControl({ editor }: EditorTextColorControlProps) {
  const currentTextColor = editor.getAttributes('textStyle')?.color || '#111827';

  return (
    <EditorColorPicker
      label="텍스트 색상"
      value={currentTextColor}
      fallback="#111827"
      icon={LuPalette}
      onChange={(nextColor) => {
        editor.chain().focus().setColor(nextColor).run();
      }}
    />
  );
}

// =============================
// 배경(하이라이트) 색상 컨트롤
// =============================
export type EditorHighlightColorControlProps = {
  editor: Editor;
};

export function EditorHighlightColorControl({ editor }: EditorHighlightColorControlProps) {
  const currentHighlightColor = editor.getAttributes('highlight')?.color || '#FEF08A';

  return (
    <EditorColorPicker
      label="배경 색상"
      value={currentHighlightColor}
      fallback="#FEF08A"
      icon={LuHighlighter}
      onChange={(nextColor) => {
        editor.chain().focus().unsetHighlight().toggleHighlight({ color: nextColor }).run();
      }}
    />
  );
}

// =============================
// 정렬 메뉴 컨트롤
// =============================
export type EditorAlignMenuProps = {
  editor: Editor;
};

export function EditorAlignMenu({ editor }: EditorAlignMenuProps) {
  const currentTextAlign = editor.isActive({ textAlign: 'center' })
    ? 'center'
    : editor.isActive({ textAlign: 'right' })
      ? 'right'
      : editor.isActive({ textAlign: 'justify' })
        ? 'justify'
        : 'left';

  const CurrentAlignIcon =
    currentTextAlign === 'center'
      ? LuAlignCenter
      : currentTextAlign === 'right'
        ? LuAlignRight
        : currentTextAlign === 'justify'
          ? LuAlignJustify
          : LuAlignLeft;

  return (
    <Menu.Root positioning={{ placement: 'bottom-start' }}>
      <Menu.Trigger asChild>
        <IconButton aria-label="정렬 방식 선택" variant="ghost" size="sm">
          <CurrentAlignIcon />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="160px">
            <Menu.Item
              value="left"
              onClick={() => {
                editor.chain().focus().setTextAlign('left').run();
              }}
            >
              <LuAlignLeft />
              왼쪽 정렬
            </Menu.Item>
            <Menu.Item
              value="center"
              onClick={() => {
                editor.chain().focus().setTextAlign('center').run();
              }}
            >
              <LuAlignCenter />
              가운데 정렬
            </Menu.Item>
            <Menu.Item
              value="right"
              onClick={() => {
                editor.chain().focus().setTextAlign('right').run();
              }}
            >
              <LuAlignRight />
              오른쪽 정렬
            </Menu.Item>
            <Menu.Item
              value="justify"
              onClick={() => {
                editor.chain().focus().setTextAlign('justify').run();
              }}
            >
              <LuAlignJustify />
              양쪽 정렬
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

// =============================
// 링크 메뉴 컨트롤
// =============================
export type EditorLinkMenuProps = {
  editor: Editor;
};

export function EditorLinkMenu({ editor }: EditorLinkMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState(editor.getAttributes('link')?.href || '');
  const shouldApplyOnCloseRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!menuOpen && !popoverOpen) {
      setInputValue(editor.getAttributes('link')?.href || '');
    }
  }, [editor, menuOpen, popoverOpen]);

  useEffect(() => {
    if (!popoverOpen) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [popoverOpen]);

  const applyLink = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const href = /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  return (
    <Popover.Root
      open={popoverOpen}
      onOpenChange={(details) => {
        if (!details.open && shouldApplyOnCloseRef.current) {
          applyLink();
        }
        if (!details.open) {
          shouldApplyOnCloseRef.current = false;
        }
        setPopoverOpen(details.open);
      }}
      positioning={{
        placement: 'bottom-start',
        getAnchorRect: () => triggerRef.current?.getBoundingClientRect() ?? new DOMRect(),
      }}
      lazyMount
    >
      <Menu.Root
        open={menuOpen}
        onOpenChange={(details) => setMenuOpen(details.open)}
        positioning={{ placement: 'bottom-start' }}
      >
        <Menu.Trigger asChild>
          <IconButton
            ref={triggerRef}
            aria-label="링크 메뉴"
            variant={editor.isActive('link') ? 'subtle' : 'ghost'}
            size="sm"
          >
            <LuLink2 />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="140px">
              <Menu.Item
                value="link"
                onClick={() => {
                  shouldApplyOnCloseRef.current = true;
                  setMenuOpen(false);
                  setPopoverOpen(true);
                }}
              >
                <LuLink />
                링크 추가
              </Menu.Item>
              <Menu.Item
                value="unlink"
                onClick={() => {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  setMenuOpen(false);
                }}
              >
                <LuUnlink />
                링크 제거
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <Popover.Positioner>
        <Popover.Content maxW="280px">
          <Popover.Body>
            <Flex direction="column" gap="3">
              <Text fontSize="12px" fontWeight="600" color="#4B5563">
                링크 입력
              </Text>
              <Input
                ref={inputRef}
                size="sm"
                placeholder="https://example.com"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    const trimmed = inputValue.trim();
                    if (!trimmed) return;
                    const href = /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
                    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
                    shouldApplyOnCloseRef.current = false;
                    setPopoverOpen(false);
                  }
                }}
              />
            </Flex>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}

// =============================
// 인용구 스타일 컨트롤
// =============================
export type EditorQuoteMenuProps = {
  editor: Editor;
};

export function EditorQuoteMenu({ editor }: EditorQuoteMenuProps) {
  const isActive = editor.isActive('blockquote');
  const currentStyle = editor.getAttributes('blockquote')?.quoteStyle || 'line';

  return (
    <Menu.Root positioning={{ placement: 'bottom-start' }}>
      <Menu.Trigger asChild>
        <IconButton
          aria-label="인용구 스타일"
          variant={isActive ? 'subtle' : 'ghost'}
          size="sm"
        >
          <LuQuote />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="180px">
            <Menu.Item value="quote-line" onClick={() => {
              const chain = editor.chain().focus();
              if (!editor.isActive('blockquote')) {
                chain.toggleBlockquote();
              }
              chain.updateAttributes('blockquote', { quoteStyle: 'line' }).run();
            }}>
              <LuQuote />
              버티컬 라인
              {currentStyle === 'line' ? ' ✓' : ''}
            </Menu.Item>
            <Menu.Item value="quote-quote" onClick={() => {
              const chain = editor.chain().focus();
              if (!editor.isActive('blockquote')) {
                chain.toggleBlockquote();
              }
              chain.updateAttributes('blockquote', { quoteStyle: 'quote' }).run();
            }}>
              <LuQuote />
              따옴표형
              {currentStyle === 'quote' ? ' ✓' : ''}
            </Menu.Item>
            <Menu.Item value="quote-frame" onClick={() => {
              const chain = editor.chain().focus();
              if (!editor.isActive('blockquote')) {
                chain.toggleBlockquote();
              }
              chain.updateAttributes('blockquote', { quoteStyle: 'frame' }).run();
            }}>
              <LuQuote />
              프레임형
              {currentStyle === 'frame' ? ' ✓' : ''}
            </Menu.Item>
            <Menu.Item onClick={() => {
              if (editor.isActive('blockquote')) {
                editor.chain().focus().toggleBlockquote().run();
              }
            }} value="quote-remove">
              인용구 해제
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
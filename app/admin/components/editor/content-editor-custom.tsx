'use client';

import {
  Box,
  Button,
  ColorPicker,
  Flex,
  IconButton,
  Input,
  Link,
  Menu,
  Popover,
  Portal,
  Text,
  useBreakpointValue,
  parseColor,
} from '@chakra-ui/react';
import Blockquote from '@tiptap/extension-blockquote';
import TiptapImage from '@tiptap/extension-image';
import type { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  LuAlignCenter,
  LuAlignJustify,
  LuAlignLeft,
  LuAlignRight,
  LuHighlighter,
  LuImage,
  LuPalette,
  LuQuote,
  LuMinus,
  LuSquare,
  LuYoutube,
  LuLink,
  LuUnlink,
} from 'react-icons/lu';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ElementType,
  type RefObject,
} from 'react';

// ============================================
// 파일 목차
// 1. 공통 상수
// 2. 공통 유틸 / 헬퍼
// 3. 커스텀 확장 / 스타일
// 4. 공통 UI 조각
// 5. 툴바 컨트롤
// 6. 링크 버블 메뉴
// ============================================

// =============================
// 공통 상수
// =============================
const DEFAULT_TEXT_COLOR = '#111827';
const DEFAULT_HIGHLIGHT_COLOR = '#FEF08A';
const IMAGE_WIDTH_OPTIONS = [
  { label: '25%', value: '25%' },
  { label: '50%', value: '50%' },
  { label: '75%', value: '75%' },
  { label: '100%', value: '100%' },
] as const;
const POPOVER_INPUT_FOCUS_STYLES = {
  borderColor: '#D1D5DB',
  boxShadow: '0 0 0 4px rgba(107, 114, 128, 0.12)',
  outline: 'none',
};

// =============================
// 공통 유틸 / 헬퍼
// =============================
function getSafeColor(value: string, fallback: string) {
  try {
    return parseColor(value || fallback);
  } catch {
    return parseColor(fallback);
  }
}

function getPopoverContentLayout(isMobile: boolean) {
  return {
    w: isMobile ? 'calc(100vw - 32px)' : undefined,
    left: isMobile ? '50% !important' : undefined,
    transform: isMobile ? 'translateX(-50%)' : undefined,
  };
}

function usePopoverInputFocus(
  open: boolean,
  inputRef: RefObject<HTMLInputElement | null>
) {
  useEffect(() => {
    if (!open) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [open, inputRef]);
}

function normalizeExternalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  return /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function insertYoutubeVideo(editor: Editor, src: string) {
  editor
    .chain()
    .focus()
    .setYoutubeVideo({
      src,
      width: 640,
      height: 360,
    })
    .run();
}

type QuoteStyle = 'line' | 'quote' | 'frame';

const LINE_HEIGHT_OPTIONS = [
  { label: '기본', value: '' },
  { label: '150%', value: '1.5' },
  { label: '160%', value: '1.6' },
  { label: '170%', value: '1.7' },
  { label: '180%', value: '1.8' },
  { label: '190%', value: '1.9' },
  { label: '200%', value: '2.0' },
  { label: '240%', value: '2.4' },
  { label: '300%', value: '3.0' },
  { label: '360%', value: '3.6' },
  { label: '400%', value: '4.0' },
] as const;

export type EditorImageUploadResult = {
  url: string;
  alt?: string;
};

export type EditorImageUploadHandler = (file: File) => Promise<EditorImageUploadResult>;

function applyQuoteStyle(editor: Editor, quoteStyle: QuoteStyle) {
  const chain = editor.chain().focus();

  if (!editor.isActive('blockquote')) {
    chain.toggleBlockquote();
  }

  chain.updateAttributes('blockquote', { quoteStyle }).run();
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
// 커스텀 이미지 확장
// =============================
export const StyledImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: (element) =>
          element.getAttribute('data-width') || (element as HTMLElement).style.width || '100%',
        renderHTML: (attributes) => {
          const width = attributes.width || '100%';
          return {
            'data-width': width,
            style: `width: ${width}; max-width: 100%; height: auto;`,
          };
        },
      },
      align: {
        default: 'left',
        parseHTML: (element) => element.getAttribute('data-align') || 'left',
        renderHTML: (attributes) => {
          const align = attributes.align || 'left';
          return {
            'data-align': align,
            style:
              align === 'center'
                ? 'margin-left: auto; margin-right: auto;'
                : align === 'right'
                  ? 'margin-left: auto; margin-right: 0;'
                  : 'margin-left: 0; margin-right: auto;',
          };
        },
      },
    };
  },
});

// =============================
// 이미지 버블 메뉴
// =============================
export type EditorImageBubbleMenuProps = {
  editor: Editor;
};

export function EditorImageBubbleMenu({ editor }: EditorImageBubbleMenuProps) {
  const currentWidth = editor.getAttributes('image')?.width || '100%';
  const currentAlign = editor.getAttributes('image')?.align || 'left';

  const shouldShowImageBubble = useCallback(({ editor }: { editor: Editor }) => {
    return editor.isActive('image');
  }, []);

  const bubbleMenuOptions = useMemo(
    () => ({
      placement: 'bottom-start' as const,
    }),
    []
  );

  const applyImageWidth = (width: string) => {
    editor.chain().focus().updateAttributes('image', { width }).run();
  };

  const applyImageAlign = (align: 'left' | 'center' | 'right') => {
    editor.chain().focus().updateAttributes('image', { align }).run();
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShowImageBubble}
      options={bubbleMenuOptions}
    >
      <Box
        onMouseDown={(event) => event.preventDefault()}
        bg="white"
        border="1px solid #E5E7EB"
        borderRadius="14px"
        boxShadow="0 8px 24px rgba(15, 23, 42, 0.12)"
        px="3"
        py="2.5"
      >
        <Flex direction="column" gap="2.5">
          <Flex align="center" gap="2">
            <Text fontSize="12px" fontWeight="600" color="#4B5563" mr="1">
              이미지 크기
            </Text>
            {IMAGE_WIDTH_OPTIONS.map((option) => {
              const isSelected = currentWidth === option.value;

              return (
                <Button
                  key={option.value}
                  size="xs"
                  variant={isSelected ? 'solid' : 'outline'}
                  colorPalette={isSelected ? 'orange' : 'gray'}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applyImageWidth(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </Flex>

          <Flex align="center" gap="2">
            <Text fontSize="12px" fontWeight="600" color="#4B5563" mr="1">
              정렬
            </Text>
            <IconButton
              aria-label="이미지 왼쪽 정렬"
              size="xs"
              variant={currentAlign === 'left' ? 'solid' : 'outline'}
              colorPalette={currentAlign === 'left' ? 'orange' : 'gray'}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyImageAlign('left')}
            >
              <LuAlignLeft />
            </IconButton>
            <IconButton
              aria-label="이미지 가운데 정렬"
              size="xs"
              variant={currentAlign === 'center' ? 'solid' : 'outline'}
              colorPalette={currentAlign === 'center' ? 'orange' : 'gray'}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyImageAlign('center')}
            >
              <LuAlignCenter />
            </IconButton>
            <IconButton
              aria-label="이미지 오른쪽 정렬"
              size="xs"
              variant={currentAlign === 'right' ? 'solid' : 'outline'}
              colorPalette={currentAlign === 'right' ? 'orange' : 'gray'}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyImageAlign('right')}
            >
              <LuAlignRight />
            </IconButton>
          </Flex>
        </Flex>
      </Box>
    </BubbleMenu>
  );
}

// =============================
// 커스텀 인용구 스타일
// =============================
export const contentEditorCustomStyles = {
  '& .ProseMirror img': {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
  },
  '& .ProseMirror img[data-align="left"]': {
    marginLeft: '0',
    marginRight: 'auto',
  },
  '& .ProseMirror img[data-align="center"]': {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  '& .ProseMirror img[data-align="right"]': {
    marginLeft: 'auto',
    marginRight: '0',
  },
  '& .ProseMirror img.ProseMirror-selectednode': {
    outline: '2px solid #93C5FD',
    outlineOffset: '2px',
  },
  '& .ProseMirror blockquote': {
    marginTop: '16px',
    marginBottom: '16px',
    color: DEFAULT_TEXT_COLOR,
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
// 공통 UI 조각
// =============================
type EditorColorPickerProps = {
  label: string;
  value: string;
  fallback: string;
  icon: ElementType;
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
  const currentTextColor = editor.getAttributes('textStyle')?.color || DEFAULT_TEXT_COLOR;

  return (
    <EditorColorPicker
      label="텍스트 색상"
      value={currentTextColor}
      fallback={DEFAULT_TEXT_COLOR}
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
  const currentHighlightColor =
    editor.getAttributes('highlight')?.color || DEFAULT_HIGHLIGHT_COLOR;

  return (
    <EditorColorPicker
      label="배경 색상"
      value={currentHighlightColor}
      fallback={DEFAULT_HIGHLIGHT_COLOR}
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
// 줄간격 메뉴 컨트롤
// =============================
export type EditorLineHeightMenuProps = {
  editor: Editor;
};

export function EditorLineHeightMenu({ editor }: EditorLineHeightMenuProps) {
  const currentLineHeight = editor.getAttributes('textStyle')?.lineHeight || '';
  const currentOption =
    LINE_HEIGHT_OPTIONS.find((option) => option.value === currentLineHeight) ||
    LINE_HEIGHT_OPTIONS[0];

  return (
    <Menu.Root positioning={{ placement: 'bottom-start' }}>
      <Menu.Trigger asChild>
        <IconButton
          aria-label={`줄간격 ${currentOption.label || '기본'}`}
          title={`줄간격 ${currentOption.label || '기본'}`}
          variant="ghost"
          size="sm"
        >
          <Flex direction="column" align="center" justify="center" gap="0.5" w="4" h="4">
            <Flex align="center" justify="center" gap="1" w="full">
              <Box w="3" h="0.5" bg="currentColor" borderRadius="full" />
              <Text fontSize="10px" lineHeight="1" color="currentColor">
                ↕
              </Text>
            </Flex>
            <Box w="full" h="0.5" bg="currentColor" borderRadius="full" />
          </Flex>
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="132px">
            {LINE_HEIGHT_OPTIONS.map((option) => {
              const isSelected =
                currentLineHeight === option.value || (!currentLineHeight && !option.value);

              return (
                <Menu.Item
                  key={option.label}
                  value={`line-height-${option.label}`}
                  fontWeight={isSelected ? '700' : '400'}
                  color={isSelected ? '#EA580C' : undefined}
                  onClick={() => {
                    if (!option.value) {
                      editor.chain().focus().unsetLineHeight().run();
                      return;
                    }

                    editor.chain().focus().setLineHeight(option.value).run();
                  }}
                >
                  {option.label}
                </Menu.Item>
              );
            })}
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
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState(editor.getAttributes('link')?.href || '');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverContentLayout = getPopoverContentLayout(isMobile);

  usePopoverInputFocus(popoverOpen, inputRef);

  const applyLink = () => {
    const href = normalizeExternalUrl(inputValue);
    if (!href) return;

    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    setPopoverOpen(false);
  };

  return (
    <Popover.Root
      open={popoverOpen}
      onOpenChange={(details) => {
        setPopoverOpen(details.open);
        if (details.open) {
          setInputValue(editor.getAttributes('link')?.href || '');
        }
      }}
      positioning={
        isMobile
          ? { placement: 'bottom', strategy: 'fixed' }
          : {
              placement: 'bottom-start',
              getAnchorRect: () => triggerRef.current?.getBoundingClientRect() ?? new DOMRect(),
            }
      }
      lazyMount
    >
      <Popover.Trigger asChild>
        <IconButton
          ref={triggerRef}
          aria-label="링크 삽입"
          variant={editor.isActive('link') ? 'subtle' : 'ghost'}
          size="sm"
        >
          <LuLink />
        </IconButton>
      </Popover.Trigger>

      <Popover.Positioner>
        <Popover.Content
          maxW="280px"
          {...popoverContentLayout}
        >
          <Popover.Body>
            <Flex direction="column" gap="3">
              <Text fontSize="12px" fontWeight="600" color="#4B5563">
                링크 입력
              </Text>
              <Input
                ref={inputRef}
                size="sm"
                placeholder="https://example.com"
                borderColor="#D1D5DB"
                outline="none"
                _focus={POPOVER_INPUT_FOCUS_STYLES}
                _focusVisible={POPOVER_INPUT_FOCUS_STYLES}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    applyLink();
                  }
                }}
              />
              <Button size="sm" colorPalette="orange" onClick={applyLink}>
                링크 삽입
              </Button>
            </Flex>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}

// =============================
// 이미지 첨부 컨트롤
// =============================
export type EditorImageMenuProps = {
  editor: Editor;
  onImageUpload: EditorImageUploadHandler;
};

export function EditorImageMenu({ editor, onImageUpload }: EditorImageMenuProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');

  const handleOpenFilePicker = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadErrorMessage('');
    setIsUploading(true);

    try {
      const uploadedImage = await onImageUpload(file);

      if (!uploadedImage.url) {
        throw new Error('이미지 URL이 반환되지 않았습니다.');
      }

      editor.chain().focus().setImage({
        src: uploadedImage.url,
        alt: uploadedImage.alt || file.name,
      }).run();
    } catch (error) {
      console.error(error);
      setUploadErrorMessage('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <>
      <IconButton
        aria-label={isUploading ? '이미지 업로드 중' : '이미지 첨부'}
        title={uploadErrorMessage || undefined}
        variant={uploadErrorMessage ? 'subtle' : 'ghost'}
        size="sm"
        loading={isUploading}
        disabled={isUploading}
        onClick={handleOpenFilePicker}
      >
        <LuImage />
      </IconButton>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}

// =============================
// 유튜브 임베드 컨트롤
// =============================
export type EditorYoutubeMenuProps = {
  editor: Editor;
};

export function EditorYoutubeMenu({ editor }: EditorYoutubeMenuProps) {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverContentLayout = getPopoverContentLayout(isMobile);

  usePopoverInputFocus(popoverOpen, inputRef);

  const applyYoutube = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    insertYoutubeVideo(editor, trimmed);
    setPopoverOpen(false);
    setInputValue('');
  };

  return (
    <Popover.Root
      open={popoverOpen}
      onOpenChange={(details) => {
        setPopoverOpen(details.open);
        if (!details.open) {
          setInputValue('');
        }
      }}
      positioning={
        isMobile
          ? { placement: 'bottom', strategy: 'fixed' }
          : {
              placement: 'bottom-start',
              getAnchorRect: () => triggerRef.current?.getBoundingClientRect() ?? new DOMRect(),
            }
      }
      lazyMount
    >
      <Popover.Trigger asChild>
        <IconButton
          ref={triggerRef}
          aria-label="유튜브 삽입"
          variant="ghost"
          size="sm"
        >
          <LuYoutube />
        </IconButton>
      </Popover.Trigger>

      <Popover.Positioner>
        <Popover.Content
          maxW="320px"
          {...popoverContentLayout}
        >
          <Popover.Body>
            <Flex direction="column" gap="3">
              <Text fontSize="12px" fontWeight="600" color="#4B5563">
                유튜브 링크 입력
              </Text>
              <Input
                ref={inputRef}
                size="sm"
                placeholder="https://www.youtube.com/watch?v=..."
                borderColor="#D1D5DB"
                outline="none"
                _focus={POPOVER_INPUT_FOCUS_STYLES}
                _focusVisible={POPOVER_INPUT_FOCUS_STYLES}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    const trimmed = inputValue.trim();
                    if (!trimmed) return;
                    insertYoutubeVideo(editor, trimmed);
                    setPopoverOpen(false);
                    setInputValue('');
                  }
                }}
              />
              <Button size="sm" colorPalette="orange" onClick={applyYoutube}>
                유튜브 삽입
              </Button>
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
            <Menu.Item value="quote-line" onClick={() => applyQuoteStyle(editor, 'line')}>
              <LuMinus />
              버티컬 라인
              {currentStyle === 'line' ? ' ✓' : ''}
            </Menu.Item>
            <Menu.Item value="quote-quote" onClick={() => applyQuoteStyle(editor, 'quote')}>
              <LuQuote />
              따옴표형
              {currentStyle === 'quote' ? ' ✓' : ''}
            </Menu.Item>
            <Menu.Item value="quote-frame" onClick={() => applyQuoteStyle(editor, 'frame')}>
              <LuSquare />
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
// =============================
// 링크 버블 메뉴
// =============================
export type EditorLinkBubbleMenuProps = {
  editor: Editor;
};

export function EditorLinkBubbleMenu({ editor }: EditorLinkBubbleMenuProps) {
  const currentHref = editor.getAttributes('link')?.href || '';

  const shouldShowLinkBubble = useCallback(({ editor }: { editor: Editor }) => {
    const { selection, schema } = editor.state;
    const linkMark = schema.marks.link;
    if (!linkMark) return false;

    if (!selection.empty) {
      let hasLink = false;

      editor.state.doc.nodesBetween(selection.from, selection.to, (node) => {
        if (hasLink) return false;
        if (!node.isText) return;

        hasLink = node.marks.some((mark) => mark.type === linkMark);
      });

      return hasLink;
    }

    return selection.$from.marks().some((mark) => mark.type === linkMark);
  }, []);

  const bubbleMenuOptions = useMemo(
    () => ({
      placement: 'bottom-start' as const,
    }),
    []
  );

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShowLinkBubble}
      options={bubbleMenuOptions}
    >
      <Box
        onMouseDown={(event) => event.preventDefault()}
        bg="white"
        border="1px solid #E5E7EB"
        borderRadius="14px"
        boxShadow="0 8px 24px rgba(15, 23, 42, 0.12)"
        px="3"
        py="2.5"
        minW="auto"
      >
        <Flex align="center" gap="3">
          <Link
            href={currentHref}
            target="_blank"
            rel="noopener noreferrer"
            color="#2563EB"
            fontWeight="500"
            textDecoration="none"
            maxW="320px"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            _hover={{ textDecoration: 'underline' }}
            onMouseDown={(event) => event.preventDefault()}
          >
            {currentHref}
          </Link>

          <Box color="#D1D5DB">|</Box>

          <Button
            variant="ghost"
            size="sm"
            color="#374151"
            px="1"
            minW="auto"
            h="auto"
            onMouseDown={(event) => event.preventDefault()}
            onClick={removeLink}
          >
            
            <LuUnlink size={14} />
          </Button>
        </Flex>
      </Box>
    </BubbleMenu>
  );
}

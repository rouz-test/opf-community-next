'use client';

import { Box, ColorPicker, Flex, IconButton, Menu, Portal, Text, parseColor } from '@chakra-ui/react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyleKit } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import {
  LuAlignCenter,
  LuAlignJustify,
  LuAlignLeft,
  LuAlignRight,
  LuHighlighter,
  LuPalette,
} from 'react-icons/lu';
import { useEffect, useMemo } from 'react';

import { Control, RichTextEditor } from '@/app/admin/components/editor/rich-text-editor';

type ContentEditorProps = {
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
  placeholder?: string;
};

function getSafeColor(value: string, fallback: string) {
  try {
    return parseColor(value || fallback);
  } catch {
    return parseColor(fallback);
  }
}

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

export default function ContentEditor({
  value,
  onChange,
  minHeight = '500px',
  placeholder = '내용을 작성해 주세요.',
}: ContentEditorProps) {
  const editorExtensions = useMemo(
    () => [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyleKit,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Image,
      Youtube,
    ],
    []
  );

  const editor = useEditor({
    extensions: editorExtensions,
    content: value || '<p></p>',
    shouldRerenderOnTransaction: true,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        'data-placeholder': placeholder,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentValue = editor.getHTML();

    if (value !== currentValue) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }
  }, [editor, value]);

  const currentTextAlign = editor?.isActive({ textAlign: 'center' })
    ? 'center'
    : editor?.isActive({ textAlign: 'right' })
      ? 'right'
      : editor?.isActive({ textAlign: 'justify' })
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

  
  if (!editor) return null;

  const currentTextColor = editor.getAttributes('textStyle')?.color || '#111827';
  const currentHighlightColor = editor.getAttributes('highlight')?.color || '#FEF08A';

  return (
    <Box>
      <RichTextEditor.Root
        editor={editor}
        style={{ ['--content-min-height' as string]: minHeight }}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlGroup>
            <Control.FontFamily />
            <Control.FontSize />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.Bold />
            <Control.Italic />
            <Control.Underline />
            <Control.Strikethrough />
            <EditorColorPicker
              label="텍스트 색상"
              value={currentTextColor}
              fallback="#111827"
              icon={LuPalette}
              onChange={(nextColor) => {
                editor.chain().focus().setColor(nextColor).run();
              }}
            />
            <EditorColorPicker
              label="배경 색상"
              value={currentHighlightColor}
              fallback="#FEF08A"
              icon={LuHighlighter}
              onChange={(nextColor) => {
                editor.chain().focus().unsetHighlight().toggleHighlight({ color: nextColor }).run();
              }}
            />
          </RichTextEditor.ControlGroup>

        
          <RichTextEditor.ControlGroup>
            <Menu.Root positioning={{ placement: 'bottom-start' }}>
              <Menu.Trigger asChild>
                <IconButton
                  aria-label="정렬 방식 선택"
                  variant="ghost"
                  size="sm"
                >
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
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.BulletList />
            <Control.OrderedList />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.Hr />
          </RichTextEditor.ControlGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Box>
  );
}

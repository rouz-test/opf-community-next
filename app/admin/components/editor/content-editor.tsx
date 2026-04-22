'use client';

import { Box } from '@chakra-ui/react';
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
import { useEffect, useMemo } from 'react';

import {
  contentEditorCustomStyles,
  EditorAlignMenu,
  EditorHighlightColorControl,
  EditorImageMenu,
  EditorLinkMenu,
  EditorQuoteMenu,
  EditorTextColorControl,
  StyledBlockquote,
} from '@/app/admin/components/editor/content-editor-custom';

import { Control, RichTextEditor } from '@/app/admin/components/editor/rich-text-editor';

type ContentEditorProps = {
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
  placeholder?: string;
};


export default function ContentEditor({
  value,
  onChange,
  minHeight = '500px',
  placeholder = '내용을 작성해 주세요.',
}: ContentEditorProps) {
  const editorExtensions = useMemo(
    () => [
      StarterKit.configure({
        blockquote: false,
        link: {
          openOnClick: false,
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        },
      }),
      Underline,
      StyledBlockquote,
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

  
  if (!editor) return null;

  return (
    <Box>
      <RichTextEditor.Root
        editor={editor}
        style={{ ['--content-min-height' as string]: minHeight }}
        css={contentEditorCustomStyles}
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
            <EditorTextColorControl editor={editor} />
            <EditorHighlightColorControl editor={editor} />
          </RichTextEditor.ControlGroup>

        
          <RichTextEditor.ControlGroup>
            <EditorAlignMenu editor={editor} />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.BulletList />
            <Control.OrderedList />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <EditorQuoteMenu editor={editor} />
            <Control.Hr />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <EditorImageMenu editor={editor} />
            <EditorLinkMenu editor={editor} />
          </RichTextEditor.ControlGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Box>
  );
}

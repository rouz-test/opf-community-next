'use client';

import { Box } from '@chakra-ui/react';
import { useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { LineHeight, TextStyleKit } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';

import {
  contentEditorCustomStyles,
  EditorAlignMenu,
  EditorHighlightColorControl,
  EditorImageMenu,
  type EditorImageUploadHandler,
  type EditorImageUploadResult,
  EditorLineHeightMenu,
  EditorLinkBubbleMenu,
  EditorImageBubbleMenu,
  EditorLinkMenu,
  EditorQuoteMenu,
  EditorTextColorControl,
  EditorYoutubeMenu,
  StyledBlockquote,
  StyledImage,
} from '@/app/admin/components/editor/content-editor-custom';

import { Control, RichTextEditor } from '@/app/admin/components/editor/rich-text-editor';

type ContentEditorJsonValue = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: ContentEditorJsonValue[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
  text?: string;
};

const EMPTY_DOC: ContentEditorJsonValue = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

type ContentEditorSharedProps = {
  format?: 'html';
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
  placeholder?: string;
  onImageUpload?: EditorImageUploadHandler;
};

type ContentEditorJsonProps = {
  format: 'json';
  value: ContentEditorJsonValue;
  onChange: (value: ContentEditorJsonValue) => void;
  minHeight?: string;
  placeholder?: string;
  onImageUpload?: EditorImageUploadHandler;
};

type ContentEditorProps = ContentEditorSharedProps | ContentEditorJsonProps;

type EditorRerenderBoundaryProps = {
  editor: NonNullable<ReturnType<typeof useEditor>>;
  children: ReactNode;
};

function EditorRerenderBoundary({ editor, children }: EditorRerenderBoundaryProps) {
  useEditorState({
    editor,
    selector: ({ transactionNumber }) => transactionNumber,
  });

  return <>{children}</>;
}

export default function ContentEditor({
  value,
  onChange,
  format = 'html',
  minHeight = '500px',
  placeholder = '내용을 작성해 주세요.',
  onImageUpload,
}: ContentEditorProps) {
  const temporaryObjectUrlsRef = useRef<Set<string>>(new Set());

  const revokeUnusedTemporaryUrls = useCallback((html: string) => {
    temporaryObjectUrlsRef.current.forEach((url) => {
      if (!html.includes(url)) {
        URL.revokeObjectURL(url);
        temporaryObjectUrlsRef.current.delete(url);
      }
    });
  }, []);

  const defaultImageUpload = useCallback(async (file: File): Promise<EditorImageUploadResult> => {
    const objectUrl = URL.createObjectURL(file);
    temporaryObjectUrlsRef.current.add(objectUrl);

    return {
      url: objectUrl,
      alt: file.name,
    };
  }, []);

  const resolvedImageUpload = onImageUpload ?? defaultImageUpload;

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
      LineHeight.configure({
        types: ['textStyle'],
      }),
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      StyledImage,
      Youtube,
    ],
    []
  );

  const editor = useEditor({
    extensions: editorExtensions,
    content: format === 'json' ? value || EMPTY_DOC : value || '<p></p>',
    shouldRerenderOnTransaction: false,
    immediatelyRender: false,
    onUpdate({ editor }) {
      const html = editor.getHTML();

      if (format === 'json') {
        (onChange as ContentEditorJsonProps['onChange'])(editor.getJSON());
      } else {
        (onChange as ContentEditorSharedProps['onChange'])(html);
      }

      revokeUnusedTemporaryUrls(html);
    },
    editorProps: {
      attributes: {
        'data-placeholder': placeholder,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (format === 'json') {
      const nextValue = value || EMPTY_DOC;
      const currentValue = editor.getJSON();

      if (JSON.stringify(currentValue) !== JSON.stringify(nextValue)) {
        editor.commands.setContent(nextValue, { emitUpdate: false });
      }

      revokeUnusedTemporaryUrls(editor.getHTML());
      return;
    }

    const currentValue = editor.getHTML();

    if (value !== currentValue) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }

    revokeUnusedTemporaryUrls(editor.getHTML());
  }, [editor, format, revokeUnusedTemporaryUrls, value]);

  useEffect(() => {
    const temporaryObjectUrls = temporaryObjectUrlsRef.current;

    return () => {
      temporaryObjectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      temporaryObjectUrls.clear();
    };
  }, []);

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
            <EditorRerenderBoundary editor={editor}>
              <Control.FontFamily />
            </EditorRerenderBoundary>
            <EditorRerenderBoundary editor={editor}>
              <Control.FontSize />
            </EditorRerenderBoundary>
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <EditorRerenderBoundary editor={editor}>
              <Control.Bold />
            </EditorRerenderBoundary>
            <EditorRerenderBoundary editor={editor}>
              <Control.Italic />
            </EditorRerenderBoundary>
            <EditorRerenderBoundary editor={editor}>
              <Control.Underline />
            </EditorRerenderBoundary>
            <EditorRerenderBoundary editor={editor}>
              <Control.Strikethrough />
            </EditorRerenderBoundary>
            <EditorRerenderBoundary editor={editor}>
              <EditorTextColorControl editor={editor} />
            </EditorRerenderBoundary>
            <EditorRerenderBoundary editor={editor}>
              <EditorHighlightColorControl editor={editor} />
            </EditorRerenderBoundary>
          </RichTextEditor.ControlGroup>

        
          <RichTextEditor.ControlGroup>
            <EditorRerenderBoundary editor={editor}>
              <EditorAlignMenu editor={editor} />
            </EditorRerenderBoundary>
            <EditorRerenderBoundary editor={editor}>
              <EditorLineHeightMenu editor={editor} />
            </EditorRerenderBoundary>
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <EditorRerenderBoundary editor={editor}>
              <Control.BulletList />
            </EditorRerenderBoundary>
            <EditorRerenderBoundary editor={editor}>
              <Control.OrderedList />
            </EditorRerenderBoundary>
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <EditorRerenderBoundary editor={editor}>
              <EditorQuoteMenu editor={editor} />
            </EditorRerenderBoundary>
            <EditorRerenderBoundary editor={editor}>
              <Control.Hr />
            </EditorRerenderBoundary>
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <EditorRerenderBoundary editor={editor}>
              <EditorImageMenu editor={editor} onImageUpload={resolvedImageUpload} />
            </EditorRerenderBoundary>
            <EditorRerenderBoundary editor={editor}>
              <EditorLinkMenu editor={editor} />
            </EditorRerenderBoundary>
            <EditorRerenderBoundary editor={editor}>
              <EditorYoutubeMenu editor={editor} />
            </EditorRerenderBoundary>
          </RichTextEditor.ControlGroup>
        </RichTextEditor.Toolbar>

        <EditorRerenderBoundary editor={editor}>
          <EditorImageBubbleMenu editor={editor} />
          <EditorLinkBubbleMenu editor={editor} />
        </EditorRerenderBoundary>
        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Box>
  );
}

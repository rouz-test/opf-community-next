'use client';

import { Box, useBreakpointValue } from '@chakra-ui/react';
import { type Editor, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { LineHeight, TextStyleKit } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import usersData from '@/data/mock/users.json';
import {
  contentEditorCustomStyles,
  EditorAlignMenu,
  EditorFontFamilyMenu,
  EditorFontSizeMenu,
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

import MentionSuggestionLayer, {
  type MentionSuggestionItem,
} from '@/app/admin/components/mention/MentionSuggestionLayer';
import { Control, RichTextEditor } from '@/app/admin/components/editor/rich-text-editor';
import type { UserAccount } from '@/types/user';

export type ContentEditorJsonValue = {
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

const mentionUserByAccountId = new Map(
  (usersData as UserAccount[]).map((user) => [user.accountId, user]),
);

type ContentEditorSharedProps = {
  format?: 'html';
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
  maxHeight?: string;
  placeholder?: string;
  onImageUpload?: EditorImageUploadHandler;
  mentionViewerAccountId?: string;
};

type ContentEditorJsonProps = {
  format: 'json';
  value: ContentEditorJsonValue;
  onChange: (value: ContentEditorJsonValue) => void;
  minHeight?: string;
  maxHeight?: string;
  placeholder?: string;
  onImageUpload?: EditorImageUploadHandler;
  mentionViewerAccountId?: string;
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

function getMentionAccountIdFromHref(href: unknown) {
  if (typeof href !== 'string') return '';

  const match = /^\/user\/community\/author\/([^/?#]+)/.exec(href);

  return match?.[1] ?? '';
}

function cleanupBrokenMentionMarks(editor: Editor) {
  const linkMarkType = editor.state.schema.marks.link;
  const highlightMarkType = editor.state.schema.marks.highlight;

  if (!linkMarkType || !highlightMarkType) return false;

  const transaction = editor.state.tr;

  editor.state.doc.descendants((node, position) => {
    if (!node.isText || !node.text) return;

    const linkMark = node.marks.find((mark) => mark.type === linkMarkType);
    const accountId = getMentionAccountIdFromHref(linkMark?.attrs.href);

    if (!accountId) return;

    const expectedMentionText = `@${mentionUserByAccountId.get(accountId)?.verification.realName ?? ''}`;

    if (node.text === expectedMentionText) return;

    const from = position;
    const to = position + node.nodeSize;

    transaction.removeMark(from, to, linkMarkType);
    transaction.removeMark(from, to, highlightMarkType);
  });

  if (!transaction.docChanged) return false;

  editor.view.dispatch(transaction);
  return true;
}

export default function ContentEditor({
  value,
  onChange,
  format = 'html',
  minHeight = '500px',
  maxHeight = minHeight,
  placeholder = '내용을 작성해 주세요.',
  onImageUpload,
  mentionViewerAccountId = 'account-user-1',
}: ContentEditorProps) {
  const defaultImageUpload = useCallback(async (file: File): Promise<EditorImageUploadResult> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('이미지 데이터를 읽지 못했습니다.'));
      };

      reader.onerror = () => {
        reject(reader.error ?? new Error('이미지 업로드에 실패했습니다.'));
      };

      reader.readAsDataURL(file);
    });

    return {
      url: dataUrl,
      alt: file.name,
    };
  }, []);

  const resolvedImageUpload = onImageUpload ?? defaultImageUpload;
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionRange, setMentionRange] = useState<{ from: number; to: number } | null>(null);
  const [mentionFloatingRect, setMentionFloatingRect] = useState<DOMRect | null>(null);
  const editorRootRef = useRef<HTMLDivElement | null>(null);
  const isCleaningMentionMarksRef = useRef(false);

  const getMentionFloatingRect = useCallback((activeEditor: Editor, position: number) => {
    const coords = activeEditor.view.coordsAtPos(position);
    const layerWidth = 320;
    const safeLeft =
      typeof window === 'undefined'
        ? coords.left
        : Math.min(Math.max(16, coords.left), Math.max(16, window.innerWidth - layerWidth - 16));

    return new DOMRect(safeLeft, coords.top, layerWidth, Math.max(1, coords.bottom - coords.top));
  }, []);

  const updateEditorMentionState = useCallback((activeEditor: Editor) => {
    const { from } = activeEditor.state.selection;
    const blockStart = activeEditor.state.selection.$from.start();
    const beforeCursor = activeEditor.state.doc.textBetween(blockStart, from, '\n', '\n');
    const match = /(^|\s)@([^\s@]*)$/.exec(beforeCursor);

    if (!match) {
      setIsMentionOpen(false);
      setMentionQuery('');
      setMentionRange(null);
      setMentionFloatingRect(null);
      return;
    }

    const query = match[2] ?? '';
    const triggerFrom = from - query.length - 1;

    setMentionQuery(query);
    setMentionRange({ from: triggerFrom, to: from });
    setMentionFloatingRect(getMentionFloatingRect(activeEditor, from));
    setIsMentionOpen(query.length === 0 || query.length >= 1);
  }, [getMentionFloatingRect]);

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
      if (!isCleaningMentionMarksRef.current) {
        isCleaningMentionMarksRef.current = true;
        const didCleanMentionMarks = cleanupBrokenMentionMarks(editor);
        isCleaningMentionMarksRef.current = false;

        if (didCleanMentionMarks) return;
      }

      updateEditorMentionState(editor);

      if (format === 'json') {
        (onChange as ContentEditorJsonProps['onChange'])(editor.getJSON());
      } else {
        (onChange as ContentEditorSharedProps['onChange'])(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        'data-placeholder': placeholder,
      },
      handleTextInput() {
        return false;
      },
      handleKeyDown(_view, event) {
        if (event.key === 'Escape' || event.key === ' ' || event.key === 'Enter') {
          setIsMentionOpen(false);
          setMentionFloatingRect(null);
        }

        return false;
      },
      handleDOMEvents: {
        blur() {
          window.setTimeout(() => {
            setIsMentionOpen(false);
            setMentionFloatingRect(null);
          }, 120);
          return false;
        },
      },
    },
  });

  const updateMentionFloatingRect = useCallback(() => {
    if (!editor || !mentionRange) {
      setMentionFloatingRect(editorRootRef.current?.getBoundingClientRect() ?? null);
      return;
    }

    setMentionFloatingRect(getMentionFloatingRect(editor, mentionRange.to));
  }, [editor, getMentionFloatingRect, mentionRange]);

  const insertMention = (item: MentionSuggestionItem) => {
    if (!editor || !mentionRange) return;

    editor
      .chain()
      .focus()
      .deleteRange(mentionRange)
      .insertContent([
        {
          type: 'text',
          text: `@${item.name}`,
          marks: [
            {
              type: 'link',
              attrs: {
                href: `/user/community/author/${item.accountId}`,
                target: null,
                rel: null,
              },
            },
            {
              type: 'highlight',
              attrs: {
                color: '#E0F2FE',
              },
            },
          ],
        },
        {
          type: 'text',
          text: ' ',
        },
      ])
      .run();

    setIsMentionOpen(false);
    setMentionQuery('');
    setMentionRange(null);
    setMentionFloatingRect(null);
  };

  useEffect(() => {
    if (!isMentionOpen || !isMobile) return;

    window.addEventListener('resize', updateMentionFloatingRect);
    window.addEventListener('scroll', updateMentionFloatingRect, true);

    return () => {
      window.removeEventListener('resize', updateMentionFloatingRect);
      window.removeEventListener('scroll', updateMentionFloatingRect, true);
    };
  }, [isMentionOpen, isMobile, updateMentionFloatingRect]);

  useEffect(() => {
    if (!editor) return;

    if (format === 'json') {
      const nextValue = value || EMPTY_DOC;
      const currentValue = editor.getJSON();

      if (JSON.stringify(currentValue) !== JSON.stringify(nextValue)) {
        editor.commands.setContent(nextValue, { emitUpdate: false });
      }
      return;
    }

    const currentValue = editor.getHTML();

    if (value !== currentValue) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }
  }, [editor, format, value]);

  if (!editor) return null;

  return (
    <Box ref={editorRootRef} position="relative">
      <RichTextEditor.Root
        editor={editor}
        style={{
          ['--content-min-height' as string]: minHeight,
          ['--content-max-height' as string]: maxHeight,
        }}
        css={contentEditorCustomStyles}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlGroup>
            <EditorRerenderBoundary editor={editor}>
              <EditorFontFamilyMenu editor={editor} />
            </EditorRerenderBoundary>
            <EditorRerenderBoundary editor={editor}>
              <EditorFontSizeMenu editor={editor} />
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
        <RichTextEditor.Content maxH="var(--content-max-height)" overflowY="auto" />
      </RichTextEditor.Root>
      <MentionSuggestionLayer
        open={isMentionOpen}
        query={mentionQuery}
        viewerAccountId={mentionViewerAccountId}
        onSelect={insertMention}
        floatingRect={mentionFloatingRect}
      />
    </Box>
  );
}

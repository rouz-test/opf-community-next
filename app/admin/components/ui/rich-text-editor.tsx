'use client';

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react';
import type { Editor } from '@tiptap/react';
import { EditorContent } from '@tiptap/react';
import { Bold, Heading1, Heading2, Heading3, Italic, List, ListOrdered, Pilcrow, Redo2, Undo2 } from 'lucide-react';
import { createContext, useContext } from 'react';

const RichTextEditorContext = createContext<Editor | null>(null);

function useRichTextEditor() {
  const editor = useContext(RichTextEditorContext);

  if (!editor) {
    throw new Error('RichTextEditor components must be used within RichTextEditor.Root');
  }

  return editor;
}

type RootProps = {
  editor: Editor | null;
  children: React.ReactNode;
};

function Root({ editor, children }: RootProps) {
  if (!editor) {
    return null;
  }

  return (
    <RichTextEditorContext.Provider value={editor}>
      <Box bg="#FFFFFF">{children}</Box>
    </RichTextEditorContext.Provider>
  );
}

type ToolbarButtonProps = {
  label: string;
  isActive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolbarButton({ label, isActive = false, onClick, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      minW="32px"
      h="32px"
      px="8px"
      borderRadius="8px"
      bg={isActive ? '#FFF7ED' : 'transparent'}
      color={isActive ? '#F59E42' : '#4B5563'}
      _hover={{ bg: '#F9FAFB' }}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function Toolbar() {
  const editor = useRichTextEditor();

  const currentBlock = editor.isActive('heading', { level: 1 })
    ? 'heading-1'
    : editor.isActive('heading', { level: 2 })
      ? 'heading-2'
      : editor.isActive('heading', { level: 3 })
        ? 'heading-3'
        : 'paragraph';

  return (
    <Flex
      align="center"
      gap="10px"
      px="14px"
      py="10px"
      borderBottomWidth="1px"
      borderBottomColor="#E5E7EB"
      bg="#FFFFFF"
      wrap="wrap"
    >
      <HStack gap="4px">
        <ToolbarButton label="되돌리기" onClick={() => editor.chain().focus().undo().run()}>
          <Icon as={Undo2} boxSize="14px" />
        </ToolbarButton>
        <ToolbarButton label="다시하기" onClick={() => editor.chain().focus().redo().run()}>
          <Icon as={Redo2} boxSize="14px" />
        </ToolbarButton>
      </HStack>

      <Box
        h="32px"
        minW="120px"
        px="0"
        borderWidth="1px"
        borderColor="#E5E7EB"
        borderRadius="8px"
        bg="#FFFFFF"
        overflow="hidden"
      >
        <select
          value={currentBlock}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'paragraph') {
              editor.chain().focus().setParagraph().run();
              return;
            }
            if (value === 'heading-1') {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
              return;
            }
            if (value === 'heading-2') {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              return;
            }
            if (value === 'heading-3') {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            padding: '0 10px',
            border: 'none',
            outline: 'none',
            background: '#FFFFFF',
            color: '#374151',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <option value="paragraph">본문</option>
          <option value="heading-1">Heading 1</option>
          <option value="heading-2">Heading 2</option>
          <option value="heading-3">Heading 3</option>
        </select>
      </Box>

      <HStack gap="4px">
        <ToolbarButton
          label="본문"
          isActive={editor.isActive('paragraph')}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Icon as={Pilcrow} boxSize="14px" />
        </ToolbarButton>
        <ToolbarButton
          label="제목 1"
          isActive={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Icon as={Heading1} boxSize="14px" />
        </ToolbarButton>
        <ToolbarButton
          label="제목 2"
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Icon as={Heading2} boxSize="14px" />
        </ToolbarButton>
        <ToolbarButton
          label="제목 3"
          isActive={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Icon as={Heading3} boxSize="14px" />
        </ToolbarButton>
      </HStack>

      <HStack gap="4px">
        <ToolbarButton
          label="굵게"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Icon as={Bold} boxSize="14px" />
        </ToolbarButton>
        <ToolbarButton
          label="기울임"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Icon as={Italic} boxSize="14px" />
        </ToolbarButton>
        <ToolbarButton
          label="불릿 리스트"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <Icon as={List} boxSize="14px" />
        </ToolbarButton>
        <ToolbarButton
          label="번호 리스트"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <Icon as={ListOrdered} boxSize="14px" />
        </ToolbarButton>
      </HStack>
    </Flex>
  );
}

type ContentProps = {
  minH?: string | number;
  px?: string | number;
  py?: string | number;
};

function Content({ minH = '500px', px = '18px', py = '18px' }: ContentProps) {
  const editor = useRichTextEditor();

  return (
    <Box px={px} py={py} minH={minH} h={minH} bg="#FFFFFF" display="flex" flexDirection="column">
      <Box
        flex="1"
        minH="0"
        h="100%"
        overflowY="auto"
        cursor="text"
        position="relative"
        onClick={() => editor.chain().focus().run()}
        css={{
          '& .tiptap, & .ProseMirror, & [contenteditable="true"], & .ProseMirror-focused, & .tiptap:focus, & .ProseMirror:focus, & [contenteditable="true"]:focus, & [contenteditable="true"]:focus-visible': {
            outline: 'none !important',
            border: 'none !important',
            boxShadow: 'none !important',
            background: 'transparent',
            WebkitTapHighlightColor: 'transparent',
            WebkitAppearance: 'none',
            appearance: 'none',
          },
          '.ProseMirror': {
            minHeight: '100%',
            color: '#111827',
            fontSize: '15px',
            lineHeight: '1.9',
            whiteSpace: 'pre-wrap',
          },
          '.tiptap': {
            minHeight: '100%',
          },
          '& .ProseMirror > *:first-of-type': {
            marginTop: 0,
          },
          '.ProseMirror p': {
            margin: 0,
            color: '#374151',
          },
          '.ProseMirror h1': {
            fontSize: '34px',
            fontWeight: 700,
            lineHeight: 1.2,
            margin: 0,
          },
          '.ProseMirror h2': {
            fontSize: '25px',
            fontWeight: 700,
            lineHeight: 1.25,
            margin: 0,
          },
          '.ProseMirror h3': {
            fontSize: '18px',
            fontWeight: 700,
            lineHeight: 1.3,
            margin: 0,
          },
          '.ProseMirror ul, .ProseMirror ol': {
            paddingLeft: '20px',
          },
          '.ProseMirror li': {
            color: '#374151',
          },
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#D1D5DB',
            borderRadius: '9999px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
        }}
      >
        <Box
          position="absolute"
          inset="0"
          overflow="hidden"
          css={{
            '& > div': {
              height: '100%',
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>
    </Box>
  );
}

export const RichTextEditor = {
  Root,
  Toolbar,
  Content,
};

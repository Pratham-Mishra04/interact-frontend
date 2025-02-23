'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import Text from '@tiptap/extension-text';
import Paragraph from '@tiptap/extension-paragraph';
import Document from '@tiptap/extension-document';
import Blockquote from '@tiptap/extension-blockquote';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import CodeBlock from '@tiptap/extension-code-block';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Code from '@tiptap/extension-code';
import Highlight from '@tiptap/extension-highlight';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import Typography from '@tiptap/extension-typography';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import History from '@tiptap/extension-history';
import Link from '@tiptap/extension-link';
import { SmilieReplacer } from './extensions/smilie-replacer';
import CountWidget from './widgets/count-widget';
import LinkDialog from './widgets/link-dialog';
import Toaster from '@/utils/toaster';
import InteractMentions from '@/components/editor/mentions/mention-extension';
import { BubbleMenu } from '@tiptap/react';
import {
  CodeSimple,
  HighlighterCircle,
  ListChecks,
  Quotes,
  TextB,
  TextHOne,
  TextHThree,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
  TextSubscript,
  TextSuperscript,
  TextUnderline,
} from '@phosphor-icons/react';
import { Ellipsis } from 'lucide-react';

type EditorProps =
  | {
  editable: true;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  content?: string;
  placeholder?: string;
  limit?: number | null;
  className?: string;
  enableMentions?: boolean;
  truncate?: never;
  maxHeight?: never;
}
  | {
  editable: false;
  content: string;
  setContent?: never;
  placeholder?: never;
  limit?: number | null;
  className?: string;
  enableMentions?: never;
  truncate?: boolean
  maxHeight?: number;
};

const Editor = ({
  content = '',
  setContent = () => {},
  editable,
  limit = null,
  placeholder,
  className,
  enableMentions = true,
  truncate = false,
  maxHeight = 80,
}: EditorProps) => {
  let extensions = [
    // StarterKit.configure({}),
    Document,
    Paragraph,
    Text,
    Blockquote, // >
    ListItem,
    BulletList, // +, *, +
    OrderedList, // 1.
    Heading.configure({
      // #, ##, ###
      levels: [1, 2, 3],
    }),
    HorizontalRule, // ---
    CodeBlock, // ```
    TaskItem, // - [ ]
    TaskList,
    Bold, // **Bold** __bold__ ctrl+b
    Italic, // *Italic* _italic_ ctrl+i
    Highlight, // ==Highlight==
    Strike.configure({
      // ~~Strike~~
      HTMLAttributes: {
        class: 'line-through decoration-neutral-700',
      },
    }),
    Underline, // ctrl+u
    Code, // `code`
    Subscript, // ctrl+,
    Superscript, // ctrl+.
    Typography,
    // ColorHighlighter,
    SmilieReplacer,
    CharacterCount.configure({
      limit,
    }),
    Placeholder.configure({
      placeholder: placeholder || 'Type something...',
    }),
    History, // ctrl+z, ctrl+y
    Link.configure({
      openOnClick: true,
      linkOnPaste: true,
      defaultProtocol: 'https',
      protocols: ['http', 'https'],
      //TODO: Configure allowed and disallowed URIs, domains, protocols, etc.
      isAllowedUri: (url, ctx) => ctx.defaultValidate(url) && !url.startsWith('./'),
      shouldAutoLink: url => url.startsWith('https://'),
      HTMLAttributes: {
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
        class: '',
      },
    }),
  ];

  if (enableMentions) extensions = [...extensions, InteractMentions];

  const editor = useEditor({
    content: content,
    extensions: extensions,
    autofocus: editable,
    editable: editable,
    editorProps: {
      attributes: {
        class: `py-0.5 ring-0 h-full outline-none z-0 ${className}`,
      },
    },
    onUpdate({ editor }) {
      setContent(editor.getHTML());
    },
  });

  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [URL, setURL] = useState<string>('');
  const [expanded, setExpanded] = useState(!truncate);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  const onSubmitURL = () => {
    if (!editor) return;

    if (!URL) {
      Toaster.error('Link cannot be empty', 'error_toaster');
      return;
    } else if (!URL.startsWith('http')) {
      Toaster.error('List must start with https://', 'error_toaster');
      return;
    }

    try {
      editor.chain().focus().extendMarkRange('link').setLink({ href: URL }).run();
      setOpenLinkDialog(false);
    } catch (e) {
      Toaster.error((e as Error).message, 'error_toaster');
    }
  };

  useEffect(() => {
    if (!editor) return;
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        setOpenLinkDialog(true);
      }
    };
    document.addEventListener('keydown', handleKeydown);

    return () => document.removeEventListener('keydown', handleKeydown);
  }, [editor]);

  useEffect(()=>{
    if (!editorContainerRef.current) return;
    const updateOverflow = () => setIsOverflowing(editorContainerRef.current!.scrollHeight >= maxHeight);
    updateOverflow();
    window.addEventListener('resize', updateOverflow);
    return () => window.removeEventListener('resize', updateOverflow);
  }, [editorContainerRef.current])

  if (!editor) {
    return null;
  }

  const charCount = editor ? editor.storage.characterCount.characters() : 0;

  type BubbleMenuButtonConfig = {
    action?: () => void;
    activeCheck?: string;
    icon?: React.ReactNode;
    separator?: boolean;
  };

  const bubbleMenuButtons: BubbleMenuButtonConfig[] = [
    { action: () => editor.chain().focus().toggleBold().run(), activeCheck: 'bold', icon: <TextB /> },
    { action: () => editor.chain().focus().toggleItalic().run(), activeCheck: 'italic', icon: <TextItalic /> },
    { action: () => editor.chain().focus().toggleUnderline().run(), activeCheck: 'underline', icon: <TextUnderline /> },
    { action: () => editor.chain().focus().toggleStrike().run(), activeCheck: 'strike', icon: <TextStrikethrough /> },
    { action: () => editor.chain().focus().toggleSubscript().run(), activeCheck: 'subscript', icon: <TextSubscript /> },
    {
      action: () => editor.chain().focus().toggleSuperscript().run(),
      activeCheck: 'superscript',
      icon: <TextSuperscript />,
    },
    { separator: true },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      activeCheck: 'heading1',
      icon: <TextHOne />,
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      activeCheck: 'heading2',
      icon: <TextHTwo />,
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      activeCheck: 'heading3',
      icon: <TextHThree />,
    },
    { separator: true },
    { action: () => editor.chain().focus().toggleBlockquote().run(), activeCheck: 'blockquote', icon: <Quotes /> },
    { action: () => editor.chain().focus().toggleCode().run(), activeCheck: 'code', icon: <CodeSimple /> },
    {
      action: () => editor.chain().focus().toggleHighlight().run(),
      activeCheck: 'highlight',
      icon: <HighlighterCircle />,
    },
    { action: () => editor.chain().focus().toggleTaskList().run(), activeCheck: 'taskList', icon: <ListChecks /> },
  ];

  const Separator = () => (
    <div className="w-[1px] h-[18px] border-r-[1px] rounded-lg border-primary_black dark:border-gray-500" />
  );

  return (
    <div className="flex flex-col justify-stretch">
      {editor && editable && (
        <BubbleMenu
          className="w-fit h-fit flex-center gap-1 editor-bubble-menu bg-gray-200 dark:bg-neutral-800 rounded-sm shadow-md p-1"
          editor={editor}
          tippyOptions={{ duration: 200 }}
        >
          {bubbleMenuButtons.map((button, index) =>
            button.separator ? (
              <Separator key={`separator-${index}`} />
            ) : (
              <BubbleMenuIcon
                key={`button-${index}`}
                onClick={button.action}
                isActive={!!(button.activeCheck && editor.isActive(button.activeCheck))}
                icon={button.icon}
              />
            )
          )}
        </BubbleMenu>
      )}
      <div 
        className='relative'
        style={{
          maxHeight: expanded ? "" : maxHeight,
          overflow: expanded ? "visible" : "hidden",
        }}
        ref={editorContainerRef}
      >
        <EditorContent editor={editor} />
        {editor && editable && limit && <CountWidget charCount={charCount} limit={limit} className="m-1 ml-2" />}
        {!expanded && isOverflowing && (<div
          className='absolute bottom-0 w-full bg-gradient-to-t from-white dark:from-dark_primary_comp to-transparent dark:to-neutral-700/10 h-10'
        ></div>)}
      </div>
      {!expanded && isOverflowing && (
        <div className='flex justify-start text-sm mb-2 items-start'>
          <button
            onClick={() => setExpanded(true)}
            className='mt-2 bg-neutral-200 hover:bg-slate-200 bg-neutral-700 hover:bg-slate-700 px-1.5 rounded-xl'
            title="Read More"
            >
            <Ellipsis className='size-5' />
          </button>
        </div>
      )}
      {editor && editable && (
        <LinkDialog open={openLinkDialog} setOpen={setOpenLinkDialog} setURL={setURL} onSubmit={onSubmitURL} />
      )}
    </div>
  );
};

const BubbleMenuIcon = ({ icon, isActive, onClick }: { icon: ReactNode; isActive: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={isActive ? 'is-active' : ''}>
    {React.cloneElement(icon as React.ReactElement, {
      weight: isActive ? 'bold' : 'regular',
    })}
  </button>
);

export default Editor;

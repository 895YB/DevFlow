import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Link,
  Image,
  Quote,
  Minus,
  Eye,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateDocument } from '../hooks/use-documents';
import type { Document } from '@devflow/shared';

interface DocumentEditorProps {
  document: Document;
  workspaceId: string;
}

const SAVE_DELAY = 1500;

interface ToolbarAction {
  icon: React.ElementType;
  label: string;
  prefix: string;
  suffix?: string;
}

const toolbarActions: ToolbarAction[] = [
  { icon: Bold, label: 'Bold', prefix: '**', suffix: '**' },
  { icon: Italic, label: 'Italic', prefix: '_', suffix: '_' },
  { icon: Heading1, label: 'Heading 1', prefix: '# ' },
  { icon: Heading2, label: 'Heading 2', prefix: '## ' },
  { icon: Heading3, label: 'Heading 3', prefix: '### ' },
  { icon: Code, label: 'Code', prefix: '`', suffix: '`' },
  { icon: Quote, label: 'Quote', prefix: '> ' },
  { icon: List, label: 'Bullet list', prefix: '- ' },
  { icon: ListOrdered, label: 'Numbered list', prefix: '1. ' },
  { icon: Link, label: 'Link', prefix: '[', suffix: '](url)' },
  { icon: Image, label: 'Image', prefix: '![alt](', suffix: ')' },
  { icon: Minus, label: 'Divider', prefix: '\n---\n' },
];

export function DocumentEditor({ document, workspaceId }: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content);
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const updateDoc = useUpdateDocument(workspaceId, document._id);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lastSavedTitle = useRef(document.title);
  const lastSavedContent = useRef(document.content);

  useEffect(() => {
    setTitle(document.title);
    setContent(document.content);
    lastSavedTitle.current = document.title;
    lastSavedContent.current = document.content;
    setDirty(false);
  }, [document._id, document.title, document.content]);

  const scheduleSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setDirty(true);
    saveTimer.current = setTimeout(() => {
      flushSave();
    }, SAVE_DELAY);
  };

  const flushSave = () => {
    setTitle((currentTitle) => {
      setContent((currentContent) => {
        const updates: Record<string, string> = {};
        if (currentTitle !== lastSavedTitle.current) {
          updates['title'] = currentTitle;
        }
        if (currentContent !== lastSavedContent.current) {
          updates['content'] = currentContent;
        }
        if (Object.keys(updates).length > 0) {
          updateDoc.mutate(updates, {
            onSuccess: () => {
              lastSavedTitle.current = currentTitle;
              lastSavedContent.current = currentContent;
              setDirty(false);
            },
          });
        } else {
          setDirty(false);
        }
        return currentContent;
      });
      return currentTitle;
    });
  };

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [document._id]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    scheduleSave();
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    scheduleSave();
  };

  const insertMarkdown = (action: ToolbarAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = `${action.prefix}${selected}${action.suffix ?? ''}`;

    const newContent = content.slice(0, start) + replacement + content.slice(end);
    setContent(newContent);
    scheduleSave();

    requestAnimationFrame(() => {
      const cursorPos = start + action.prefix.length + selected.length;
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const lastEditor =
    typeof document.lastEditedBy === 'object'
      ? document.lastEditedBy.displayName
      : '';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex flex-wrap items-center gap-0.5">
          {toolbarActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => insertMarkdown(action)}
              title={action.label}
              aria-label={action.label}
              disabled={preview}
            >
              <action.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPreview(!preview)}
          className="gap-1.5"
          aria-label={preview ? 'Switch to edit mode' : 'Switch to preview mode'}
        >
          {preview ? (
            <>
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              Preview
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="border-none text-3xl font-bold shadow-none focus-visible:ring-0 px-0 h-auto"
            placeholder="Untitled"
            aria-label="Document title"
          />

          <Separator className="my-4" />

          {preview ? (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {content || (
                <p className="text-muted-foreground">Nothing to preview.</p>
              )}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className={cn(
                'w-full resize-none bg-transparent font-mono text-sm leading-relaxed',
                'placeholder:text-muted-foreground focus:outline-none',
                'min-h-[500px]',
              )}
              placeholder="Start writing..."
              aria-label="Document content"
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <span>
          {updateDoc.isPending ? 'Saving...' : dirty ? 'Unsaved changes' : 'Saved'}
        </span>
        {lastEditor && <span>Last edited by {lastEditor}</span>}
      </div>
    </div>
  );
}

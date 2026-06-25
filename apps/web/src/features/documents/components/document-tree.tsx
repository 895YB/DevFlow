import { useState, useRef, useCallback } from 'react';
import { ChevronRight, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DocumentTreeNode } from '@devflow/shared';

interface DocumentTreeProps {
  nodes: DocumentTreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateChild: (parentId: string | null) => void;
}

interface TreeNodeProps {
  node: DocumentTreeNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  onNavigate: (direction: 'up' | 'down', currentId: string) => void;
}

function TreeNode({ node, depth, selectedId, onSelect, onCreateChild, onNavigate }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = node._id === selectedId;
  const rowRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(node._id);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (hasChildren && !expanded) {
          setExpanded(true);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (hasChildren && expanded) {
          setExpanded(false);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        onNavigate('down', node._id);
        break;
      case 'ArrowUp':
        e.preventDefault();
        onNavigate('up', node._id);
        break;
    }
  };

  return (
    <div>
      <div
        ref={rowRef}
        className={cn(
          'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer',
          isSelected
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(node._id)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? expanded : undefined}
        data-tree-id={node._id}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="shrink-0 rounded p-0.5 hover:bg-accent"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            tabIndex={-1}
          >
            <ChevronRight
              className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')}
            />
          </button>
        ) : (
          <span className="w-[18px] shrink-0" />
        )}

        <span className="shrink-0">
          {node.icon || <FileText className="h-4 w-4" />}
        </span>

        <span className="min-w-0 flex-1 truncate">{node.title}</span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateChild(node._id);
          }}
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 rounded p-0.5 hover:bg-accent"
          aria-label={`Add page inside ${node.title}`}
          tabIndex={-1}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {hasChildren && expanded && (
        <div role="group">
          {node.children.map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function flattenVisibleIds(nodes: DocumentTreeNode[]): string[] {
  const result: string[] = [];
  for (const node of nodes) {
    result.push(node._id);
    if (node.children.length > 0) {
      result.push(...flattenVisibleIds(node.children));
    }
  }
  return result;
}

export function DocumentTree({ nodes, selectedId, onSelect, onCreateChild }: DocumentTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNavigate = useCallback(
    (direction: 'up' | 'down', currentId: string) => {
      const visibleIds = flattenVisibleIds(nodes);
      const currentIndex = visibleIds.indexOf(currentId);
      if (currentIndex === -1) return;

      const nextIndex = direction === 'down' ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex < 0 || nextIndex >= visibleIds.length) return;

      const nextId = visibleIds[nextIndex];
      if (!nextId) return;

      const nextEl = containerRef.current?.querySelector(
        `[data-tree-id="${nextId}"]`,
      ) as HTMLElement | null;
      nextEl?.focus();
    },
    [nodes],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pages
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onCreateChild(null)}
          aria-label="Add new page"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-1"
        role="tree"
        aria-label="Document pages"
      >
        {nodes.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">
            No pages yet. Create your first page.
          </p>
        ) : (
          nodes.map((node) => (
            <TreeNode
              key={node._id}
              node={node}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              onNavigate={handleNavigate}
            />
          ))
        )}
      </div>
    </div>
  );
}

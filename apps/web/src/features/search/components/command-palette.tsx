import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Code2,
  GitBranch,
  BarChart3,
  Zap,
  Timer,
  MessagesSquare,
  Bell,
  Settings,
  FolderOpen,
  CheckSquare,
  FileCode,
  Loader2,
} from 'lucide-react';
import { useSearch } from '../hooks/use-search';
import type { SearchResult } from '@devflow/shared';

// ── Static navigation items ──────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, url: '/dashboard' },
  { label: 'Projects', icon: FolderKanban, url: '/projects' },
  { label: 'Documents', icon: FileText, url: '/documents' },
  { label: 'Snippets', icon: Code2, url: '/snippets' },
  { label: 'GitHub', icon: GitBranch, url: '/github' },
  { label: 'LeetCode', icon: BarChart3, url: '/leetcode' },
  { label: 'API Tester', icon: Zap, url: '/api-tester' },
  { label: 'Productivity', icon: Timer, url: '/productivity' },
  { label: 'Chat', icon: MessagesSquare, url: '/chat' },
  { label: 'Notifications', icon: Bell, url: '/notifications' },
  { label: 'Settings', icon: Settings, url: '/settings' },
];

const TYPE_ICONS: Record<SearchResult['type'], React.ElementType> = {
  project: FolderOpen,
  task: CheckSquare,
  document: FileText,
  snippet: FileCode,
};

const TYPE_LABELS: Record<SearchResult['type'], string> = {
  project: 'Projects',
  task: 'Tasks',
  document: 'Documents',
  snippet: 'Snippets',
};

// ── Component ─────────────────────────────────────────────────────────────────

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const { data: results = [], isFetching } = useSearch(query);

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type]!.push(r);
    return acc;
  }, {});

  const handleSelect = useCallback(
    (url: string) => {
      navigate(url);
      onOpenChange(false);
      setQuery('');
    },
    [navigate, onOpenChange],
  );

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const showNav = query.trim().length < 2;
  const showResults = query.trim().length >= 2;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search or jump to..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {/* Navigation section (when not searching) */}
        {showNav && (
          <CommandGroup heading="Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.url}
                  value={item.label}
                  onSelect={() => handleSelect(item.url)}
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {item.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Search results */}
        {showResults && (
          <>
            {isFetching && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isFetching && results.length === 0 && (
              <CommandEmpty>No results found for &ldquo;{query}&rdquo;</CommandEmpty>
            )}

            {!isFetching &&
              results.length > 0 &&
              (Object.entries(grouped) as [SearchResult['type'], SearchResult[]][]).map(
                ([type, items], i) => {
                  const Icon = TYPE_ICONS[type];
                  return (
                    <div key={type}>
                      {i > 0 && <CommandSeparator />}
                      <CommandGroup heading={TYPE_LABELS[type]}>
                        {items.map((result) => (
                          <CommandItem
                            key={result._id}
                            value={`${result.type}-${result._id}`}
                            onSelect={() => handleSelect(result.url)}
                          >
                            <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span>{result.title}</span>
                              {result.subtitle && (
                                <span className="text-xs text-muted-foreground">
                                  {result.subtitle}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </div>
                  );
                },
              )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

// ── Keyboard shortcut hook ────────────────────────────────────────────────────

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return { open, setOpen };
}

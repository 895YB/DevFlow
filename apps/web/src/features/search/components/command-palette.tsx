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
  Zap as ApiIcon,
  Timer,
  MessagesSquare,
  Bell,
  Settings,
  FolderOpen,
  CheckSquare,
  FileCode,
  Loader2,
  TrendingUp,
  Plus,
  Zap,
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
  { label: 'API Tester', icon: ApiIcon, url: '/api-tester' },
  { label: 'Productivity', icon: Timer, url: '/productivity' },
  { label: 'Analytics', icon: TrendingUp, url: '/analytics' },
  { label: 'Chat', icon: MessagesSquare, url: '/chat' },
  { label: 'Notifications', icon: Bell, url: '/notifications' },
  { label: 'Settings', icon: Settings, url: '/settings' },
];

// ── Quick actions ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'New Project', icon: Plus, url: '/projects', hint: 'Create' },
  { label: 'New Document', icon: FileText, url: '/documents', hint: 'Create' },
  { label: 'New Snippet', icon: Code2, url: '/snippets', hint: 'Create' },
  { label: 'Start Pomodoro', icon: Timer, url: '/productivity', hint: 'Productivity' },
  { label: 'Open API Tester', icon: Zap, url: '/api-tester', hint: 'Tools' },
];

// ── Search result icon/label mapping ─────────────────────────────────────────

const TYPE_ICONS: Record<SearchResult['type'], React.ElementType> = {
  project: FolderOpen,
  task: CheckSquare,
  document: FileText,
  snippet: FileCode,
  api_collection: ApiIcon,
  notification: Bell,
};

const TYPE_LABELS: Record<SearchResult['type'], string> = {
  project: 'Projects',
  task: 'Tasks',
  document: 'Documents',
  snippet: 'Snippets',
  api_collection: 'API Collections',
  notification: 'Notifications',
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

  // Group results by type preserving insertion order
  const grouped = results.reduce<Partial<Record<SearchResult['type'], SearchResult[]>>>(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = [];
      acc[r.type]!.push(r);
      return acc;
    },
    {},
  );

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
        placeholder="Search or jump to... (⌘K)"
        value={query}
        onValueChange={setQuery}
        aria-label="Command palette search"
      />
      <CommandList>
        {/* Navigation section (when not searching) */}
        {showNav && (
          <>
            <CommandGroup heading="Quick Actions">
              {QUICK_ACTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.label}
                    value={`action-${item.label}`}
                    onSelect={() => handleSelect(item.url)}
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.hint}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Navigate">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.url}
                    value={`nav-${item.label}`}
                    onSelect={() => handleSelect(item.url)}
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

        {/* Search results */}
        {showResults && (
          <>
            {isFetching && (
              <div className="flex items-center justify-center py-6" role="status" aria-label="Searching">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isFetching && results.length === 0 && (
              <CommandEmpty>No results found for &ldquo;{query}&rdquo;</CommandEmpty>
            )}

            {!isFetching && results.length > 0 && (
              <>
                {(Object.entries(grouped) as [SearchResult['type'], SearchResult[]][]).map(
                  ([type, items], i) => {
                    const Icon = TYPE_ICONS[type];
                    return (
                      <div key={type}>
                        {i > 0 && <CommandSeparator />}
                        <CommandGroup heading={TYPE_LABELS[type]}>
                          {items.map((result) => (
                            <CommandItem
                              key={result._id}
                              value={`${result.type}-${result._id}-${result.title}`}
                              onSelect={() => handleSelect(result.url)}
                            >
                              <Icon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate">{result.title}</span>
                                {result.subtitle && (
                                  <span className="truncate text-xs text-muted-foreground">
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

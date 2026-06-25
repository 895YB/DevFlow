import { useState, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useWorkspace } from '@/app/providers/workspace-provider';
import { useSnippets, useSnippetFolders, useToggleFavorite } from '../hooks/use-snippets';
import { SnippetCard } from './snippet-card';
import { SnippetDetailSheet } from './snippet-detail-sheet';
import { CreateSnippetDialog } from './create-snippet-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Code2, FolderOpen, Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORTED_LANGUAGES } from '@devflow/shared';
import type { Snippet } from '@devflow/shared';

export function SnippetsPage() {
  const { activeWorkspaceId } = useWorkspace();
  const { user } = useUser();

  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState<string>('');
  const [visibility, setVisibility] = useState<string>('');
  const [folderId, setFolderId] = useState<string>('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (search) p['search'] = search;
    if (language) p['language'] = language;
    if (visibility) p['visibility'] = visibility;
    if (folderId) p['folder'] = folderId;
    if (favoritesOnly) p['favorites'] = 'true';
    return p;
  }, [search, language, visibility, folderId, favoritesOnly]);

  const { data: snippetsData, isLoading } = useSnippets(activeWorkspaceId, params);
  const { data: folders } = useSnippetFolders(activeWorkspaceId);
  const toggleFavorite = useToggleFavorite(activeWorkspaceId!);

  const snippets = snippetsData?.snippets ?? [];
  const userId = user?.id ?? '';

  const hasFilters = !!language || !!visibility || !!folderId || favoritesOnly;

  const clearFilters = () => {
    setLanguage('');
    setVisibility('');
    setFolderId('');
    setFavoritesOnly(false);
    setSearch('');
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Snippets</h1>
        {activeWorkspaceId && <CreateSnippetDialog workspaceId={activeWorkspaceId} />}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search snippets"
          />
        </div>

        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-36" aria-label="Filter by language">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Languages</SelectItem>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang} className="capitalize">
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger className="w-32" aria-label="Filter by visibility">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>

        {folders && folders.length > 0 && (
          <Select value={folderId} onValueChange={setFolderId}>
            <SelectTrigger className="w-36" aria-label="Filter by folder">
              <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue placeholder="Folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Folders</SelectItem>
              {folders.map((f) => (
                <SelectItem key={f._id} value={f._id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          variant={favoritesOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className="gap-1.5"
          aria-pressed={favoritesOnly}
        >
          <Heart className={cn('h-3.5 w-3.5', favoritesOnly && 'fill-current')} />
          Favorites
        </Button>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {hasFilters && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {language && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {language}
              <button onClick={() => setLanguage('')} aria-label={`Remove ${language} filter`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {visibility && (
            <Badge variant="secondary" className="gap-1 text-xs capitalize">
              {visibility}
              <button onClick={() => setVisibility('')} aria-label="Remove visibility filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg border border-border bg-muted/50" />
          ))}
        </div>
      ) : !snippets.length ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12">
          <Code2 className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">
            {hasFilters ? 'No snippets match your filters' : 'No snippets yet'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters
              ? 'Try adjusting your filters or search query.'
              : 'Create your first code snippet to get started.'}
          </p>
          {hasFilters ? (
            <Button className="mt-4" variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          ) : (
            activeWorkspaceId && (
              <div className="mt-4">
                <CreateSnippetDialog workspaceId={activeWorkspaceId} />
              </div>
            )
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snippets.map((snippet) => (
            <SnippetCard
              key={snippet._id}
              snippet={snippet}
              userId={userId}
              onClick={() => setSelectedSnippet(snippet)}
              onToggleFavorite={() => toggleFavorite.mutate(snippet._id)}
            />
          ))}
        </div>
      )}

      {selectedSnippet && (
        <SnippetDetailSheet
          snippet={selectedSnippet}
          onClose={() => setSelectedSnippet(null)}
        />
      )}
    </div>
  );
}

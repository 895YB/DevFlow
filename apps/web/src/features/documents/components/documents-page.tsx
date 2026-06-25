import { useState } from 'react';
import { useWorkspace } from '@/app/providers/workspace-provider';
import { useDocumentTree, useDocument, useCreateDocument } from '../hooks/use-documents';
import { DocumentTree } from './document-tree';
import { DocumentEditor } from './document-editor';
import { VersionHistory } from './version-history';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, History, FileText } from 'lucide-react';
import { useSearchDocuments } from '../hooks/use-documents';

export function DocumentsPage() {
  const { activeWorkspaceId } = useWorkspace();
  const { data: tree, isLoading: treeLoading } = useDocumentTree(activeWorkspaceId);

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const { data: selectedDoc } = useDocument(activeWorkspaceId, selectedDocId);

  const [createOpen, setCreateOpen] = useState(false);
  const [createParent, setCreateParent] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const createDoc = useCreateDocument(activeWorkspaceId!);

  const [versionOpen, setVersionOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults } = useSearchDocuments(activeWorkspaceId, searchQuery);
  const showSearch = searchQuery.trim().length >= 2;

  const handleCreateChild = (parentId: string | null) => {
    setCreateParent(parentId);
    setNewTitle('');
    setCreateOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createDoc.mutate(
      { title: newTitle.trim(), parent: createParent },
      {
        onSuccess: (doc) => {
          setCreateOpen(false);
          setSelectedDocId(doc._id);
        },
      },
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 -m-4 lg:-m-6">
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-border bg-sidebar/50 flex flex-col">
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              className="h-8 pl-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search documents"
            />
          </div>
        </div>

        {showSearch && searchResults ? (
          <div className="flex-1 overflow-y-auto px-2">
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Results ({searchResults.length})
            </p>
            {searchResults.map((result) => (
              <button
                key={result._id}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => {
                  setSelectedDocId(result._id);
                  setSearchQuery('');
                }}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{result.title}</span>
              </button>
            ))}
          </div>
        ) : treeLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-7 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : (
          <DocumentTree
            nodes={tree ?? []}
            selectedId={selectedDocId}
            onSelect={setSelectedDocId}
            onCreateChild={handleCreateChild}
          />
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedDoc ? (
          <>
            <div className="flex items-center justify-end gap-2 border-b border-border px-4 py-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setVersionOpen(true)}
              >
                <History className="h-3.5 w-3.5" />
                History
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              <DocumentEditor
                key={selectedDoc._id}
                document={selectedDoc}
                workspaceId={activeWorkspaceId!}
              />
            </div>
            <VersionHistory
              workspaceId={activeWorkspaceId!}
              documentId={selectedDoc._id}
              open={versionOpen}
              onClose={() => setVersionOpen(false)}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-medium">Select a page</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a page from the sidebar or create a new one.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => handleCreateChild(null)}
              >
                Create Page
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Page</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-title">Title</Label>
              <Input
                id="page-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Page title"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!newTitle.trim() || createDoc.isPending}>
                {createDoc.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { History, RotateCcw } from 'lucide-react';
import { useDocumentVersions, useRestoreVersion } from '../hooks/use-documents';
import type { DocumentVersion } from '@devflow/shared';

interface VersionHistoryProps {
  workspaceId: string;
  documentId: string;
  open: boolean;
  onClose: () => void;
}

export function VersionHistory({ workspaceId, documentId, open, onClose }: VersionHistoryProps) {
  const { data: versions, isLoading } = useDocumentVersions(
    open ? workspaceId : null,
    open ? documentId : null,
  );
  const restore = useRestoreVersion(workspaceId, documentId);

  const handleRestore = (versionId: string) => {
    restore.mutate(versionId, { onSuccess: onClose });
  };

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-1">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : !versions?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No previous versions. Versions are created automatically when you edit.
            </p>
          ) : (
            versions.map((version: DocumentVersion, index: number) => {
              const editor =
                typeof version.editedBy === 'object'
                  ? version.editedBy.displayName
                  : 'Unknown';

              return (
                <div key={version._id}>
                  <div className="flex items-start justify-between rounded-lg p-3 hover:bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{version.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {editor} &middot;{' '}
                        {format(new Date(version.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {version.content.slice(0, 150)}
                        {version.content.length > 150 ? '...' : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestore(version._id)}
                      disabled={restore.isPending}
                      className="shrink-0 gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore
                    </Button>
                  </div>
                  {index < versions.length - 1 && <Separator />}
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { CodeBlock } from './code-block';
import type { Snippet } from '@devflow/shared';

interface SnippetDetailSheetProps {
  snippet: Snippet;
  onClose: () => void;
}

export function SnippetDetailSheet({ snippet, onClose }: SnippetDetailSheetProps) {
  const author =
    typeof snippet.createdBy === 'object' ? snippet.createdBy.displayName : '';

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{snippet.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {snippet.description && (
            <p className="text-sm text-muted-foreground">{snippet.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{snippet.language}</Badge>
            <Badge variant="outline" className="capitalize">
              {snippet.visibility}
            </Badge>
            {snippet.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <Separator />

          <CodeBlock code={snippet.code} language={snippet.language} />

          <Separator />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {author && <span>Created by {author}</span>}
            <span>{format(new Date(snippet.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

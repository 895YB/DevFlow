import { Heart, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Snippet } from '@devflow/shared';

interface SnippetCardProps {
  snippet: Snippet;
  userId: string;
  onClick: () => void;
  onToggleFavorite: () => void;
}

export function SnippetCard({ snippet, userId, onClick, onToggleFavorite }: SnippetCardProps) {
  const [copied, setCopied] = useState(false);
  const isFavorited = snippet.favoritedBy.includes(userId);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick();
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-sm">{snippet.title}</CardTitle>
            {snippet.description && (
              <CardDescription className="mt-1 line-clamp-2 text-xs">
                {snippet.description}
              </CardDescription>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleFavorite}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={cn(
                  'h-3.5 w-3.5',
                  isFavorited && 'fill-red-500 text-red-500',
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy code'}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        <pre className="mt-2 max-h-24 overflow-hidden rounded-md bg-muted/50 p-2 text-xs font-mono text-muted-foreground">
          {snippet.code.slice(0, 200)}
          {snippet.code.length > 200 ? '...' : ''}
        </pre>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="text-[10px]">
            {snippet.language}
          </Badge>
          {snippet.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
          {snippet.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{snippet.tags.length - 3}
            </span>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}

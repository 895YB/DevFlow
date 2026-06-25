import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@devflow/shared';
import { useCreateSnippet } from '../hooks/use-snippets';

interface CreateSnippetDialogProps {
  workspaceId: string;
}

export function CreateSnippetDialog({ workspaceId }: CreateSnippetDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState<'personal' | 'team'>('personal');
  const createSnippet = useCreateSnippet(workspaceId);

  const reset = () => {
    setTitle('');
    setLanguage('javascript');
    setCode('');
    setDescription('');
    setTags('');
    setVisibility('personal');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    createSnippet.mutate(
      {
        title: title.trim(),
        language,
        code,
        description: description.trim(),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        visibility,
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Snippet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Snippet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="snippet-title">Title</Label>
              <Input
                id="snippet-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Snippet title"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="snippet-lang">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="snippet-lang">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang} className="capitalize">
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="snippet-desc">Description</Label>
            <Input
              id="snippet-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="snippet-code">Code</Label>
            <Textarea
              id="snippet-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="snippet-tags">Tags (comma-separated)</Label>
              <Input
                id="snippet-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, hooks, state"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="snippet-vis">Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as 'personal' | 'team')}>
                <SelectTrigger id="snippet-vis">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !code.trim() || createSnippet.isPending}>
              {createSnippet.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

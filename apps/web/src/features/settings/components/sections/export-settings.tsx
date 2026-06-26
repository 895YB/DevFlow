import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { FileJson, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useWorkspace } from '@/app/providers/workspace-provider';

const EXPORT_TYPES = [
  { id: 'tasks', label: 'Tasks', description: 'All tasks across all projects', supportsCSV: true },
  { id: 'projects', label: 'Projects', description: 'Project metadata and statuses', supportsCSV: false },
  { id: 'documents', label: 'Documents', description: 'Document titles and metadata (content excluded)', supportsCSV: false },
  { id: 'snippets', label: 'Snippets', description: 'Code snippets with language and content', supportsCSV: false },
  { id: 'api_collections', label: 'API Collections', description: 'Saved API collections and requests', supportsCSV: false },
] as const;

type ExportId = (typeof EXPORT_TYPES)[number]['id'];

function tasksToCSV(tasks: Record<string, unknown>[]): string {
  if (tasks.length === 0) return '';
  const cols = ['_id', 'title', 'status', 'priority', 'dueDate', 'completedAt', 'createdAt'];
  const header = cols.join(',');
  const rows = tasks.map((t) =>
    cols
      .map((c) => {
        const val = t[c];
        if (val == null) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
      .join(','),
  );
  return [header, ...rows].join('\n');
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportSettings() {
  const { activeWorkspaceId } = useWorkspace();
  const [selected, setSelected] = useState<Set<ExportId>>(
    new Set(EXPORT_TYPES.map((t) => t.id)),
  );
  const [exporting, setExporting] = useState<'json' | 'csv' | null>(null);

  const toggle = (id: ExportId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = async (format: 'json' | 'csv') => {
    if (!activeWorkspaceId || selected.size === 0) return;
    setExporting(format);
    try {
      const types = [...selected].join(',');
      const res = await apiClient.get(
        `/workspaces/${activeWorkspaceId}/export?types=${types}`,
        { responseType: 'json' },
      );
      const payload = res.data as {
        exportedAt: string;
        workspaceId: string;
        data: Record<string, unknown[]>;
      };

      if (format === 'json') {
        downloadBlob(
          JSON.stringify(payload, null, 2),
          `devflow-export-${new Date().toISOString().slice(0, 10)}.json`,
          'application/json',
        );
      } else {
        const tasks = (payload.data['tasks'] ?? []) as Record<string, unknown>[];
        const csv = tasksToCSV(tasks);
        downloadBlob(
          csv,
          `devflow-tasks-${new Date().toISOString().slice(0, 10)}.csv`,
          'text/csv',
        );
      }
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Data Export</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Download your workspace data in JSON or CSV format.
        </p>
      </div>

      <section aria-labelledby="export-types-heading">
        <h3 id="export-types-heading" className="text-sm font-semibold">Select Data to Export</h3>
        <ul className="mt-4 space-y-3" role="list">
          {EXPORT_TYPES.map(({ id, label, description, supportsCSV }) => (
            <li
              key={id}
              className="flex items-start gap-3 rounded-lg border border-border p-4"
            >
              <Checkbox
                id={`export-${id}`}
                checked={selected.has(id)}
                onCheckedChange={() => toggle(id)}
                aria-label={`Include ${label}`}
                className="mt-0.5"
              />
              <label htmlFor={`export-${id}`} className="flex-1 cursor-pointer">
                <span className="text-sm font-medium">{label}</span>
                {supportsCSV && (
                  <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    CSV
                  </span>
                )}
                <p className="text-xs text-muted-foreground">{description}</p>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <section aria-labelledby="export-actions-heading">
        <h3 id="export-actions-heading" className="text-sm font-semibold">Download</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          JSON includes all selected types. CSV is available for Tasks only.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            onClick={() => handleExport('json')}
            disabled={exporting !== null || selected.size === 0}
            aria-label="Download as JSON"
          >
            <FileJson className="mr-2 h-4 w-4" />
            {exporting === 'json' ? 'Exporting…' : 'Download JSON'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={exporting !== null || !selected.has('tasks')}
            aria-label="Download Tasks as CSV"
          >
            <FileText className="mr-2 h-4 w-4" />
            {exporting === 'csv' ? 'Exporting…' : 'Download Tasks CSV'}
          </Button>
        </div>
      </section>

      <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Privacy note</p>
        <p>Exported data is downloaded directly to your device. Nothing is stored on our servers beyond your workspace data.</p>
      </div>
    </div>
  );
}

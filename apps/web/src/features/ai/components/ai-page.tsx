import { Zap, Brain, MessageSquare, FileSearch, Code2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PLANNED_FEATURES = [
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    description:
      'Context-aware chat that understands your projects, tasks, and documents. Ask questions, get summaries, and take action.',
    endpoint: 'POST /api/v1/ai/chat',
  },
  {
    icon: FileSearch,
    title: 'Document Summarization',
    description:
      'Automatically summarize long documents, meeting notes, and project wikis into actionable insights.',
    endpoint: 'POST /api/v1/ai/summarize',
  },
  {
    icon: Code2,
    title: 'Snippet Explanation',
    description:
      'Explain code snippets, suggest improvements, and generate documentation from selected code.',
    endpoint: 'POST /api/v1/ai/explain-code',
  },
  {
    icon: Brain,
    title: 'Task Suggestions',
    description:
      'AI-powered task breakdown: paste a requirement and get a structured list of subtasks automatically.',
    endpoint: 'POST /api/v1/ai/suggest-tasks',
  },
  {
    icon: Sparkles,
    title: 'Smart Search',
    description:
      'Semantic search across all your workspace content — finds relevant items even without exact keyword matches.',
    endpoint: 'POST /api/v1/ai/semantic-search',
  },
] as const;

export function AiPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">AI Features</h1>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            AI-powered capabilities are being built into DevFlow. The backend infrastructure is in
            place — all endpoints return HTTP 501 until the models are connected.
          </p>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Planned features */}
      <section aria-labelledby="planned-heading">
        <h2 id="planned-heading" className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Planned Features
        </h2>
        <ul className="mt-4 space-y-4" role="list">
          {PLANNED_FEATURES.map(({ icon: Icon, title, description, endpoint }) => (
            <li
              key={title}
              className="rounded-xl border border-border p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                  <code className="mt-2 block text-[11px] font-mono text-muted-foreground/70">
                    {endpoint}
                  </code>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-8" />

      {/* Extension points */}
      <section aria-labelledby="extension-heading">
        <h2 id="extension-heading" className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Extension Points
        </h2>
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-5 space-y-3 text-sm">
          <p className="font-medium">To add a new AI feature:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
            <li>
              Add a route handler in{' '}
              <code className="font-mono text-foreground">apps/api/src/modules/ai/ai.routes.ts</code>
            </li>
            <li>
              Create a service function in{' '}
              <code className="font-mono text-foreground">apps/api/src/modules/ai/ai.service.ts</code>
            </li>
            <li>
              Build the React UI in{' '}
              <code className="font-mono text-foreground">apps/web/src/features/ai/</code>
            </li>
            <li>
              Add an API hook in{' '}
              <code className="font-mono text-foreground">apps/web/src/features/ai/hooks/</code>
            </li>
          </ol>
          <p className="text-muted-foreground">
            The router is already registered at{' '}
            <code className="font-mono text-foreground">/api/v1/ai</code> with authentication
            middleware applied. All unmatched routes currently return 501.
          </p>
        </div>
      </section>
    </div>
  );
}

import { useState } from 'react';
import {
  CheckSquare,
  FolderKanban,
  Timer,
  FileText,
  Zap,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAnalytics } from '../hooks/use-analytics';
import { useWorkspace } from '@/app/providers/workspace-provider';
import type { AnalyticsBucket, AnalyticsPeriod } from '@devflow/shared';

// ── Chart primitives ──────────────────────────────────────────────────────────

function BarChart({
  data,
  color = 'hsl(var(--primary))',
  height = 80,
}: {
  data: AnalyticsBucket[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((bucket, i) => {
        const pct = (bucket.value / max) * 100;
        return (
          <div
            key={i}
            className="group relative flex-1"
            style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}
          >
            <div
              className="w-full rounded-t-[2px] transition-opacity"
              style={{
                height: `${Math.max(pct, bucket.value > 0 ? 4 : 1)}%`,
                backgroundColor: color,
                opacity: bucket.value === 0 ? 0.15 : 0.85,
              }}
            />
            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 rounded bg-popover px-1.5 py-0.5 text-[10px] text-popover-foreground shadow-md group-hover:block">
              {bucket.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({
  data,
  color = 'hsl(var(--primary))',
  height = 120,
}: {
  data: AnalyticsBucket[];
  color?: string;
  height?: number;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 200;
  const H = height;
  const pad = 4;
  const step = data.length > 1 ? (W - pad * 2) / (data.length - 1) : W;

  const pts = data.map((d, i) => ({
    x: pad + i * step,
    y: H - pad - (d.value / max) * (H - pad * 2),
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD =
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') +
    ` L ${pts[pts.length - 1]!.x} ${H} L ${pts[0]!.x} ${H} Z`;

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`lg-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaD}
        fill={`url(#lg-${color.replace(/[^a-z0-9]/gi, '')})`}
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} />
      ))}
    </svg>
  );
}

// ── Period selector ───────────────────────────────────────────────────────────

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMinutes(mins: number): string {
  if (mins === 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  data,
  chartColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  data: AnalyticsBucket[];
  chartColor: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', color)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mb-3 text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mb-2 text-xs text-muted-foreground">{sub}</p>}
      <div className="mt-auto">
        <BarChart data={data} color={chartColor} height={40} />
      </div>
    </div>
  );
}

// ── Chart section ─────────────────────────────────────────────────────────────

function ChartCard({
  title,
  icon: Icon,
  data,
  color,
  formatValue,
}: {
  title: string;
  icon: React.ElementType;
  data: AnalyticsBucket[];
  color: string;
  formatValue?: (v: number) => string;
}) {
  const total = data.reduce((s, b) => s + b.value, 0);
  const max = Math.max(...data.map((d) => d.value), 1);
  const firstDate = data[0]?.date ?? '';
  const lastDate = data[data.length - 1]?.date ?? '';

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">
            {formatValue ? formatValue(total) : total}
          </p>
          <p className="text-[10px] text-muted-foreground">total</p>
        </div>
      </div>

      <LineChart data={data} color={color} height={120} />

      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{firstDate}</span>
        <span className="text-xs text-muted-foreground">
          Peak: {formatValue ? formatValue(max) : max}
        </span>
        <span>{lastDate}</span>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-lg" />)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
      </div>
    </div>
  );
}

// ── Completion rate ring ──────────────────────────────────────────────────────

function CompletionRing({ rate }: { rate: number }) {
  const R = 36;
  const circ = 2 * Math.PI * R;
  const dash = (rate / 100) * circ;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" aria-label={`${rate}% completion rate`}>
        <circle cx="48" cy="48" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={R}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
        />
        <text
          x="48"
          y="53"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="currentColor"
        >
          {rate}%
        </text>
      </svg>
      <p className="mt-1 text-xs text-muted-foreground">All-time</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const { activeWorkspaceId } = useWorkspace();
  const { data, isLoading, isError, refetch } = useAnalytics(period);

  if (!activeWorkspaceId) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
        <TrendingUp className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium">No workspace selected</p>
        <p className="text-xs text-muted-foreground">Create or select a workspace to view analytics.</p>
      </div>
    );
  }

  if (isLoading) return <AnalyticsSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">Failed to load analytics</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your productivity and progress</p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Time period">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              size="sm"
              variant={period === p.value ? 'default' : 'outline'}
              onClick={() => setPeriod(p.value)}
              aria-pressed={period === p.value}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Tasks Completed"
          value={data.totals.tasksCompleted}
          icon={CheckSquare}
          color="bg-green-500/10 text-green-600"
          data={data.tasksCompleted}
          chartColor="#22c55e"
        />
        <MetricCard
          label="Focus Time"
          value={formatMinutes(data.totals.focusMinutes)}
          sub={`${data.totals.focusMinutes} minutes`}
          icon={Timer}
          color="bg-orange-500/10 text-orange-600"
          data={data.focusMinutes}
          chartColor="#f97316"
        />
        <MetricCard
          label="Documents Created"
          value={data.totals.documentsCreated}
          icon={FileText}
          color="bg-blue-500/10 text-blue-600"
          data={data.documentsCreated}
          chartColor="#3b82f6"
        />
        <MetricCard
          label="API Requests"
          value={data.totals.apiRequests}
          icon={Zap}
          color="bg-purple-500/10 text-purple-600"
          data={data.apiRequests}
          chartColor="#a855f7"
        />
      </div>

      {/* Overview row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task completion summary */}
        <div className="flex flex-col rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Task Overview</h3>
          </div>
          <div className="flex items-center justify-between">
            <CompletionRing rate={data.taskCompletionRate} />
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold">{data.totals.totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total tasks</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">
                  {data.totals.totalTasks - data.totals.openTasks}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-600">{data.totals.openTasks}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="flex flex-col rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Projects Created</h3>
          </div>
          <p className="mb-4 text-3xl font-bold">{data.totals.projectsCreated}</p>
          <div className="mt-auto">
            <BarChart data={data.projectsCreated} color="#8b5cf6" height={60} />
          </div>
        </div>

        {/* Period stats */}
        <div className="flex flex-col rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Period Summary</h3>
          </div>
          <dl className="flex-1 space-y-3">
            {[
              {
                label: 'Avg tasks/day',
                value:
                  data.tasksCompleted.length > 0
                    ? (data.totals.tasksCompleted / data.tasksCompleted.length).toFixed(1)
                    : '0',
              },
              {
                label: 'Avg focus/day',
                value:
                  data.focusMinutes.length > 0
                    ? formatMinutes(
                        Math.round(data.totals.focusMinutes / data.focusMinutes.length),
                      )
                    : '0m',
              },
              { label: 'API requests', value: data.totals.apiRequests },
              { label: 'Docs created', value: data.totals.documentsCreated },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">{item.label}</dt>
                <dd className="text-sm font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Detail charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Tasks Completed"
          icon={CheckSquare}
          data={data.tasksCompleted}
          color="#22c55e"
        />
        <ChartCard
          title="Focus Time"
          icon={Timer}
          data={data.focusMinutes}
          color="#f97316"
          formatValue={formatMinutes}
        />
        <ChartCard
          title="Documents Created"
          icon={FileText}
          data={data.documentsCreated}
          color="#3b82f6"
        />
        <ChartCard
          title="API Requests"
          icon={Zap}
          data={data.apiRequests}
          color="#a855f7"
        />
      </div>
    </div>
  );
}

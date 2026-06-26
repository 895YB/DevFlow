import { useNavigate } from 'react-router';
import { useUser } from '@clerk/clerk-react';
import {
  CheckSquare,
  FolderKanban,
  Timer,
  Flame,
  ArrowRight,
  GitBranch,
  BarChart3,
  AlertCircle,
  Clock,
  Plus,
  Zap,
  MessageSquare,
  FileText,
  Activity,
  Bell,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';
import { format, isToday, isPast, isTomorrow, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useDashboard } from '../hooks/use-dashboard';
import type {
  DashboardData,
  DashboardTask,
  DashboardActivityItem,
  DashboardApiRequest,
  DashboardUpcomingTask,
} from '@devflow/shared';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PRIORITY_CLASSES: Record<string, string> = {
  urgent: 'bg-red-500/15 text-red-600 border-red-200',
  high: 'bg-orange-500/15 text-orange-600 border-orange-200',
  medium: 'bg-yellow-500/15 text-yellow-600 border-yellow-200',
  low: 'bg-blue-500/15 text-blue-600 border-blue-200',
  none: 'bg-muted text-muted-foreground border-border',
};

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-green-600 bg-green-500/10',
  POST: 'text-blue-600 bg-blue-500/10',
  PUT: 'text-yellow-600 bg-yellow-500/10',
  PATCH: 'text-orange-600 bg-orange-500/10',
  DELETE: 'text-red-600 bg-red-500/10',
};

function formatFocusTime(minutes: number): string {
  if (minutes === 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
}

function formatDueDate(dateStr: string): { label: string; isUrgent: boolean } {
  const d = new Date(dateStr);
  if (isToday(d)) return { label: 'Today', isUrgent: true };
  if (isTomorrow(d)) return { label: 'Tomorrow', isUrgent: false };
  const diff = differenceInDays(d, new Date());
  if (diff <= 3) return { label: `${diff}d`, isUrgent: true };
  return { label: format(d, 'MMM d'), isUrgent: false };
}

function truncateUrl(url: string, maxLen = 40): string {
  try {
    const u = new URL(url);
    const path = u.pathname + u.search;
    return path.length > maxLen ? path.slice(0, maxLen) + '…' : path;
  } catch {
    return url.length > maxLen ? url.slice(0, maxLen) + '…' : url;
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        <Skeleton className="h-32 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', color)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: DashboardTask }) {
  const navigate = useNavigate();
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = due ? isPast(due) && !isToday(due) : false;

  return (
    <button
      className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
      onClick={() => navigate(`/projects/${task.projectId}`)}
    >
      <div
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: task.projectColor }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{task.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{task.projectName}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {task.priority !== 'none' && (
          <Badge
            variant="outline"
            className={cn('text-[10px] capitalize', PRIORITY_CLASSES[task.priority])}
          >
            {task.priority}
          </Badge>
        )}
        {due && (
          <span
            className={cn(
              'text-[10px]',
              isOverdue ? 'font-medium text-destructive' : 'text-muted-foreground',
            )}
          >
            {isOverdue ? 'Overdue' : isToday(due) ? 'Today' : format(due, 'MMM d')}
          </span>
        )}
      </div>
    </button>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  action,
  onAction,
  children,
  isEmpty,
  badge,
}: {
  title: string;
  icon: React.ElementType;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
  isEmpty?: boolean;
  badge?: number;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">{title}</h2>
          {badge != null && badge > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>
        {action && onAction && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={onAction}>
            {action}
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className={cn('flex-1 p-2', isEmpty && 'flex items-center justify-center py-10')}>
        {children}
      </div>
    </div>
  );
}

// ── LeetCode widget ───────────────────────────────────────────────────────────

function LeetCodeWidget({ data }: { data: DashboardData['leetcode'] }) {
  const navigate = useNavigate();

  if (!data) {
    return (
      <SectionCard
        title="LeetCode"
        icon={BarChart3}
        action="Connect"
        onAction={() => navigate('/leetcode')}
        isEmpty
      >
        <div className="text-center">
          <BarChart3 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">Connect your LeetCode account</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="LeetCode" icon={BarChart3} action="View" onAction={() => navigate('/leetcode')}>
      <div className="space-y-3 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{data.totalSolved}</p>
            <p className="text-xs text-muted-foreground">Problems solved</p>
          </div>
          {data.streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-orange-500/10 px-3 py-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">{data.streak}d streak</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Easy', count: data.easySolved, color: 'text-green-500' },
            { label: 'Medium', count: data.mediumSolved, color: 'text-yellow-500' },
            { label: 'Hard', count: data.hardSolved, color: 'text-red-500' },
          ].map((d) => (
            <div key={d.label} className="rounded-lg bg-muted/40 p-2 text-center">
              <p className={cn('text-base font-bold', d.color)}>{d.count}</p>
              <p className="text-[10px] text-muted-foreground">{d.label}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ── GitHub widget ─────────────────────────────────────────────────────────────

function GitHubWidget({ data }: { data: DashboardData['github'] }) {
  const navigate = useNavigate();

  if (!data) {
    return (
      <SectionCard
        title="GitHub"
        icon={GitBranch}
        action="Connect"
        onAction={() => navigate('/github')}
        isEmpty
      >
        <div className="text-center">
          <GitBranch className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">Connect your GitHub account</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="GitHub" icon={GitBranch} action="View" onAction={() => navigate('/github')}>
      <div className="flex flex-col items-center justify-center gap-1 py-4">
        <p className="text-2xl font-bold">{data.repoCount}</p>
        <p className="text-xs text-muted-foreground">Repositories</p>
        <p className="mt-2 text-sm text-muted-foreground">@{data.username}</p>
      </div>
    </SectionCard>
  );
}

// ── Pomodoro widget ───────────────────────────────────────────────────────────

function PomodoroWidget({ data }: { data: DashboardData['pomodoroSummary'] }) {
  const navigate = useNavigate();

  return (
    <SectionCard title="Focus" icon={Timer} action="Open" onAction={() => navigate('/productivity')}>
      <div className="flex items-center justify-between p-3">
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold">{formatFocusTime(data.todayFocusMinutes)}</p>
            <p className="text-xs text-muted-foreground">Focus time today</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{data.todaySessions}</p>
            <p className="text-xs text-muted-foreground">Sessions completed</p>
          </div>
        </div>
        {data.streak > 0 && (
          <div className="flex flex-col items-center rounded-xl bg-orange-500/10 p-4">
            <Flame className="h-6 w-6 text-orange-500" />
            <p className="mt-1 text-xl font-bold text-orange-600">{data.streak}</p>
            <p className="text-[10px] text-orange-600">day streak</p>
          </div>
        )}
        {data.streak === 0 && (
          <div className="flex flex-col items-center rounded-xl bg-muted/40 p-4">
            <Timer className="h-6 w-6 text-muted-foreground/50" />
            <p className="mt-1 text-sm text-muted-foreground">No streak</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ── Activity widget ───────────────────────────────────────────────────────────

const ACTIVITY_LABELS: Record<string, string> = {
  task_created: 'created task',
  task_updated: 'updated task',
  task_completed: 'completed task',
  document_created: 'created doc',
  document_updated: 'updated doc',
  chat_message_sent: 'sent message',
  project_created: 'created project',
  member_joined: 'joined workspace',
  channel_created: 'created channel',
};

function ActivityWidget({ items }: { items: DashboardActivityItem[] }) {
  const navigate = useNavigate();

  return (
    <SectionCard
      title="Team Activity"
      icon={Activity}
      action="View all"
      onAction={() => navigate('/chat')}
      isEmpty={items.length === 0}
    >
      {items.length === 0 ? (
        <div className="text-center">
          <Activity className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-1 p-1">
          {items.map((item) => (
            <div key={item._id} className="flex items-start gap-2.5 rounded-lg px-2 py-1.5">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={item.actorAvatar} alt={item.actorName} />
                <AvatarFallback className="text-[9px]">
                  {item.actorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs">
                  <span className="font-medium">{item.actorName.split(' ')[0]}</span>{' '}
                  <span className="text-muted-foreground">
                    {ACTIVITY_LABELS[item.type] ?? item.type}
                  </span>{' '}
                  <span className="font-medium truncate">{item.resourceTitle}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(item.createdAt), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ── API requests widget ───────────────────────────────────────────────────────

function ApiRequestsWidget({ items }: { items: DashboardApiRequest[] }) {
  const navigate = useNavigate();

  return (
    <SectionCard
      title="Recent API Requests"
      icon={Zap}
      action="Open"
      onAction={() => navigate('/api-tester')}
      isEmpty={items.length === 0}
    >
      {items.length === 0 ? (
        <div className="text-center">
          <Zap className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">No API requests yet</p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {items.map((req) => (
            <div key={req._id} className="flex items-center gap-2.5 px-3 py-2">
              <span
                className={cn(
                  'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold',
                  METHOD_COLORS[req.method] ?? 'bg-muted text-muted-foreground',
                )}
              >
                {req.method}
              </span>
              <p className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                {truncateUrl(req.url)}
              </p>
              {req.status != null && (
                <span
                  className={cn(
                    'shrink-0 text-[10px] font-medium',
                    req.status < 300
                      ? 'text-green-600'
                      : req.status < 400
                        ? 'text-yellow-600'
                        : 'text-red-600',
                  )}
                >
                  {req.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ── Calendar / upcoming tasks widget ─────────────────────────────────────────

function UpcomingWidget({ items }: { items: DashboardUpcomingTask[] }) {
  const navigate = useNavigate();

  return (
    <SectionCard
      title="Upcoming"
      icon={CalendarDays}
      action="View all"
      onAction={() => navigate('/projects')}
      isEmpty={items.length === 0}
    >
      {items.length === 0 ? (
        <div className="text-center">
          <CalendarDays className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">No upcoming tasks this week</p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {items.map((task) => {
            const { label, isUrgent } = formatDueDate(task.dueDate);
            return (
              <button
                key={task._id}
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
                onClick={() => navigate(`/projects/${task.projectId}`)}
              >
                <div
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: task.projectColor }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.projectName}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                    isUrgent
                      ? 'bg-orange-500/10 text-orange-600'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ── Quick actions ─────────────────────────────────────────────────────────────

function QuickActions() {
  const navigate = useNavigate();
  const actions = [
    { label: 'New Project', icon: FolderKanban, url: '/projects' },
    { label: 'New Document', icon: FileText, url: '/documents' },
    { label: 'New Snippet', icon: MessageSquare, url: '/snippets' },
    { label: 'API Tester', icon: Zap, url: '/api-tester' },
    { label: 'Productivity', icon: Timer, url: '/productivity' },
    { label: 'Analytics', icon: TrendingUp, url: '/analytics' },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Plus className="h-4 w-4 text-muted-foreground" />
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Button
              key={a.label}
              variant="outline"
              size="sm"
              className="justify-start gap-2 text-xs"
              onClick={() => navigate(a.url)}
            >
              <Icon className="h-3.5 w-3.5" />
              {a.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDashboard();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">Failed to load dashboard</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, {user?.firstName ?? 'there'} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d')} &mdash; here&apos;s what&apos;s happening today
          </p>
        </div>
        {(data?.unreadNotifications ?? 0) > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/notifications')}
            aria-label={`${data!.unreadNotifications} unread notifications`}
          >
            <Bell className="h-4 w-4" />
            <span>{data!.unreadNotifications} unread</span>
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Tasks"
          value={stats?.totalTasks ?? 0}
          icon={CheckSquare}
          color="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          label="Completed Today"
          value={stats?.completedToday ?? 0}
          icon={CheckSquare}
          color="bg-green-500/10 text-green-600"
          sub="tasks done"
        />
        <StatCard
          label="Active Projects"
          value={stats?.activeProjects ?? 0}
          icon={FolderKanban}
          color="bg-purple-500/10 text-purple-600"
        />
        <StatCard
          label="Focus Today"
          value={formatFocusTime(stats?.focusMinutesToday ?? 0)}
          icon={Timer}
          color="bg-orange-500/10 text-orange-600"
          sub="pomodoro sessions"
        />
      </div>

      {/* Main grid — row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's tasks */}
        <SectionCard
          title="Today's Tasks"
          icon={Clock}
          action="View all"
          onAction={() => navigate('/projects')}
          isEmpty={!data?.todaysTasks.length}
        >
          {data?.todaysTasks.length ? (
            <div className="divide-y divide-border/50">
              {data.todaysTasks.map((task) => (
                <TaskRow key={task._id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <CheckSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">No tasks due today</p>
            </div>
          )}
        </SectionCard>

        {/* Recent projects */}
        <SectionCard
          title="Recent Projects"
          icon={FolderKanban}
          action="View all"
          onAction={() => navigate('/projects')}
          isEmpty={!data?.recentProjects.length}
        >
          {data?.recentProjects.length ? (
            <div className="space-y-1 p-1">
              {data.recentProjects.map((proj) => (
                <button
                  key={proj._id}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
                  onClick={() => navigate(`/projects/${proj._id}`)}
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-medium"
                    style={{ backgroundColor: proj.color + '22', color: proj.color }}
                  >
                    {proj.icon || proj.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{proj.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {format(new Date(proj.updatedAt), 'MMM d')}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <FolderKanban className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">No projects yet</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => navigate('/projects')}
              >
                Create a project
              </Button>
            </div>
          )}
        </SectionCard>

        {/* Pomodoro / Focus */}
        <PomodoroWidget data={data?.pomodoroSummary ?? { todaySessions: 0, todayFocusMinutes: 0, streak: 0 }} />

        {/* Upcoming tasks */}
        <UpcomingWidget items={data?.upcomingTasks ?? []} />

        {/* LeetCode */}
        <LeetCodeWidget data={data?.leetcode ?? null} />

        {/* GitHub */}
        <GitHubWidget data={data?.github ?? null} />

        {/* Team Activity */}
        <ActivityWidget items={data?.recentActivity ?? []} />

        {/* API Requests */}
        <ApiRequestsWidget items={data?.recentApiRequests ?? []} />
      </div>

      {/* Quick actions */}
      <QuickActions />
    </div>
  );
}

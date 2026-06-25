import { useState, useEffect, useRef, useCallback, useId } from 'react';
import {
  usePomodoroStats,
  useCreateSession,
  useCompleteSession,
  useDailyPlan,
  useAddPlanItem,
  useUpdatePlanItem,
  useRemovePlanItem,
} from '../hooks/use-productivity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Timer,
  CalendarDays,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Bell,
  BellOff,
  Flame,
  Plus,
  Trash2,
  Check,
  Settings,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { DailyPlanItem, PomodoroType } from '@devflow/shared';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_DURATIONS: Record<PomodoroType, number> = {
  work: 25,
  'short-break': 5,
  'long-break': 15,
};

const MODE_LABELS: Record<PomodoroType, string> = {
  work: 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

const MODE_COLORS: Record<PomodoroType, string> = {
  work: 'text-primary',
  'short-break': 'text-emerald-500',
  'long-break': 'text-blue-500',
};

const SETTINGS_KEY = 'devflow:pomodoro-settings';

interface PomodoroSettings {
  work: number;
  'short-break': number;
  'long-break': number;
}

function loadSettings(): PomodoroSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored) as PomodoroSettings;
  } catch {
    // ignore
  }
  return { ...DEFAULT_DURATIONS };
}

function saveSettings(s: PomodoroSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── SVG Circular Timer ───────────────────────────────────────────────────────

function TimerCircle({
  remaining,
  total,
  mode,
}: {
  remaining: number;
  total: number;
  mode: PomodoroType;
}) {
  const radius = 90;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? remaining / total : 1;
  const dashOffset = circumference * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const colorMap: Record<PomodoroType, string> = {
    work: 'stroke-primary',
    'short-break': 'stroke-emerald-500',
    'long-break': 'stroke-blue-500',
  };

  return (
    <div className="relative flex items-center justify-center" role="timer" aria-live="polite" aria-label={`${minutes}:${String(seconds).padStart(2, '0')} remaining`}>
      <svg width="220" height="220" aria-hidden="true">
        {/* Track */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        {/* Progress */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn('transition-all duration-1000', colorMap[mode])}
          transform="rotate(-90 110 110)"
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-5xl font-bold tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className={cn('mt-1 text-sm font-medium', MODE_COLORS[mode])}>
          {MODE_LABELS[mode]}
        </div>
      </div>
    </div>
  );
}

// ─── Pomodoro Timer Component ─────────────────────────────────────────────────

function PomodoroTimer() {
  const [settings, setSettings] = useState<PomodoroSettings>(loadSettings);
  const [mode, setMode] = useState<PomodoroType>('work');
  const [remaining, setRemaining] = useState(settings.work * 60);
  const [running, setRunning] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createSession = useCreateSession();
  const completeSession = useCompleteSession();
  const { data: stats, isLoading: statsLoading } = usePomodoroStats();

  // Sync remaining when mode or settings change (only if not running)
  useEffect(() => {
    if (!running) {
      setRemaining(settings[mode] * 60);
    }
  }, [mode, settings, running]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleTimerEnd = useCallback(async () => {
    stopInterval();
    setRunning(false);
    setRemaining(0);

    // Complete the session
    if (sessionIdRef.current) {
      try {
        await completeSession.mutateAsync(sessionIdRef.current);
      } catch {
        // ignore — session may have already been completed
      }
      sessionIdRef.current = null;
    }

    // Browser notification
    if (notificationsEnabled && Notification.permission === 'granted') {
      new Notification('DevFlow — Timer complete!', {
        body: `${MODE_LABELS[mode]} session finished.`,
        icon: '/favicon.svg',
      });
    }
  }, [stopInterval, completeSession, mode, notificationsEnabled]);

  // Countdown tick
  useEffect(() => {
    if (!running) {
      stopInterval();
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return stopInterval;
  }, [running, stopInterval, handleTimerEnd]);

  const handleStart = async () => {
    if (running) {
      setRunning(false);
      return;
    }

    // If starting fresh, create a session record
    if (!sessionIdRef.current) {
      try {
        const session = await createSession.mutateAsync({
          type: mode,
          duration: settings[mode],
          label: '',
        });
        sessionIdRef.current = session._id;
      } catch {
        // Allow timer to run even if API fails
      }
    }

    setRunning(true);
  };

  const handleReset = () => {
    stopInterval();
    setRunning(false);
    setRemaining(settings[mode] * 60);
    sessionIdRef.current = null;
  };

  const handleModeChange = (newMode: PomodoroType) => {
    stopInterval();
    setRunning(false);
    sessionIdRef.current = null;
    setMode(newMode);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
    }
  };

  const handleSaveSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    setSettingsOpen(false);
    if (!running) {
      setRemaining(newSettings[mode] * 60);
    }
  };

  const total = settings[mode] * 60;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode selector */}
      <div
        className="flex gap-1 rounded-lg border border-border p-1"
        role="group"
        aria-label="Timer mode"
      >
        {(Object.keys(MODE_LABELS) as PomodoroType[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            disabled={running}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              mode === m
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground disabled:cursor-not-allowed',
            )}
            aria-pressed={mode === m}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <TimerCircle remaining={remaining} total={total} mode={mode} />

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={handleReset}
          aria-label="Reset timer"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          size="lg"
          className="h-12 w-32 gap-2 text-base"
          onClick={handleStart}
          aria-label={running ? 'Pause timer' : 'Start timer'}
        >
          {running ? (
            <>
              <Pause className="h-5 w-5" /> Pause
            </>
          ) : (
            <>
              <Play className="h-5 w-5" /> Start
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={notificationsEnabled ? () => setNotificationsEnabled(false) : requestNotificationPermission}
          aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          title={notificationsEnabled ? 'Notifications on' : 'Enable notifications'}
        >
          {notificationsEnabled ? (
            <Bell className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => setSettingsOpen(true)}
          aria-label="Timer settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="w-full max-w-xs" />

      {/* Today stats */}
      {statsLoading ? (
        <div className="h-16 w-full max-w-xs animate-pulse rounded-lg bg-muted" />
      ) : (
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-bold">{stats?.today.completedSessions ?? 0}</p>
            <p className="text-xs text-muted-foreground">Sessions today</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.today.focusMinutes ?? 0}m</p>
            <p className="text-xs text-muted-foreground">Focus time</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Flame className="h-5 w-5 text-orange-500" />
              <p className="text-2xl font-bold">{stats?.streak ?? 0}</p>
            </div>
            <p className="text-xs text-muted-foreground">Day streak</p>
          </div>
        </div>
      )}

      <TimerSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

function TimerSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  settings: PomodoroSettings;
  onSave: (s: PomodoroSettings) => void;
}) {
  const [local, setLocal] = useState(settings);
  const workId = useId();
  const shortId = useId();
  const longId = useId();

  useEffect(() => {
    if (open) setLocal(settings);
  }, [open, settings]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {(
            [
              { key: 'work', label: 'Focus duration', id: workId },
              { key: 'short-break', label: 'Short break', id: shortId },
              { key: 'long-break', label: 'Long break', id: longId },
            ] as Array<{ key: PomodoroType; label: string; id: string }>
          ).map(({ key, label, id }) => (
            <div key={key} className="flex items-center gap-3">
              <Label htmlFor={id} className="w-36 shrink-0 text-sm">{label}</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id={id}
                  type="number"
                  min={1}
                  max={120}
                  value={local[key]}
                  onChange={(e) =>
                    setLocal((p) => ({ ...p, [key]: Number(e.target.value) }))
                  }
                  className="h-8 w-20 text-sm"
                />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={() => onSave(local)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Daily Planner Component ──────────────────────────────────────────────────

function DailyPlanner() {
  const [date, setDate] = useState(todayIso());
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const titleId = useId();

  const { data: plan, isLoading } = useDailyPlan(date);
  const addItem = useAddPlanItem(date);
  const updateItem = useUpdatePlanItem(date);
  const removeItem = useRemovePlanItem(date);

  const items = plan?.items ?? [];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addItem.mutate(
      {
        title: newTitle.trim(),
        scheduledTime: newTime || null,
        duration: newDuration ? Number(newDuration) : null,
        notes: '',
      },
      {
        onSuccess: () => {
          setNewTitle('');
          setNewTime('');
          setNewDuration('');
        },
      },
    );
  };

  const handleToggle = (item: DailyPlanItem) => {
    updateItem.mutate({ itemId: item._id, input: { done: !item.done } });
  };

  const handleRemove = (itemId: string) => {
    removeItem.mutate(itemId);
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Date picker */}
      <div className="flex items-center gap-3">
        <Label htmlFor="planner-date" className="shrink-0 text-sm font-medium">Date</Label>
        <Input
          id="planner-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-8 w-40 text-sm"
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setDate(todayIso())}
          disabled={date === todayIso()}
        >
          Today
        </Button>
      </div>

      {/* Items list */}
      <div className="space-y-1.5" role="list" aria-label="Daily plan items">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No items planned for this day.</p>
          </div>
        ) : (
          items
            .slice()
            .sort((a, b) => {
              if (a.scheduledTime && b.scheduledTime) return a.scheduledTime.localeCompare(b.scheduledTime);
              if (a.scheduledTime) return -1;
              if (b.scheduledTime) return 1;
              return 0;
            })
            .map((item) => (
              <div
                key={item._id}
                role="listitem"
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors',
                  item.done && 'bg-muted/40',
                )}
              >
                <button
                  onClick={() => handleToggle(item)}
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                    item.done
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/40 hover:border-primary',
                  )}
                  aria-label={item.done ? 'Mark as incomplete' : 'Mark as complete'}
                  aria-pressed={item.done}
                >
                  {item.done && <Check className="h-3 w-3" />}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium leading-tight',
                      item.done && 'text-muted-foreground line-through',
                    )}
                  >
                    {item.title}
                  </p>
                  {(item.scheduledTime || item.duration) && (
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {item.scheduledTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.scheduledTime}
                        </span>
                      )}
                      {item.duration && (
                        <span>{item.duration}m</span>
                      )}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(item._id)}
                  aria-label={`Remove ${item.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
        )}
      </div>

      {/* Add item form */}
      <form onSubmit={handleAddItem} className="rounded-lg border border-border p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Add item</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor={titleId} className="sr-only">Item title</Label>
            <Input
              id={titleId}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What are you planning?"
              className="h-8 text-sm"
            />
          </div>
          <Input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="h-8 w-28 text-sm"
            aria-label="Scheduled time"
            title="Scheduled time (optional)"
          />
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={1}
              max={480}
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              placeholder="min"
              className="h-8 w-16 text-sm"
              aria-label="Duration in minutes"
              title="Duration in minutes (optional)"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="h-8 gap-1.5"
            disabled={!newTitle.trim() || addItem.isPending}
            aria-label="Add item"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>

      {/* Completion summary */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={items.filter((i) => i.done).length}
            aria-valuemax={items.length}
            aria-label="Daily progress"
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(items.filter((i) => i.done).length / items.length) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-xs">
            {items.filter((i) => i.done).length}/{items.length} done
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Statistics Component ─────────────────────────────────────────────────────

type StatsRange = 'today' | 'thisWeek' | 'thisMonth';

function FocusStatistics() {
  const [range, setRange] = useState<StatsRange>('thisWeek');
  const { data: stats, isLoading } = usePomodoroStats();

  const rangeLabels: Record<StatsRange, string> = {
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No data yet. Start a focus session.</p>
      </div>
    );
  }

  const currentBucket = stats[range as 'today' | 'thisWeek' | 'thisMonth'];

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div
        className="flex gap-1 rounded-lg border border-border p-1 w-fit"
        role="group"
        aria-label="Statistics range"
      >
        {(Object.keys(rangeLabels) as StatsRange[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              range === r
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-pressed={range === r}
          >
            {rangeLabels[r]}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Sessions"
          value={String(currentBucket.completedSessions)}
          sub="completed"
        />
        <StatCard
          label="Focus time"
          value={`${Math.floor(currentBucket.focusMinutes / 60)}h ${currentBucket.focusMinutes % 60}m`}
          sub="total"
        />
        <StatCard
          label="Streak"
          value={String(stats.streak)}
          sub="days"
          accent
        />
      </div>

      {/* Daily breakdown (week view only) */}
      {range === 'thisWeek' && stats.thisWeek.dailyBreakdown.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium">Daily focus (minutes)</p>
          <DailyBarChart data={stats.thisWeek.dailyBreakdown} />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-bold', accent && 'text-primary')}>{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function DailyBarChart({ data }: { data: Array<{ date: string; minutes: number }> }) {
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);
  const today = todayIso();

  return (
    <div
      className="flex h-32 items-end gap-1"
      role="img"
      aria-label="Daily focus time bar chart for the past 7 days"
    >
      {data.map(({ date, minutes }) => {
        const heightPct = (minutes / maxMinutes) * 100;
        const isToday = date === today;

        return (
          <div key={date} className="group relative flex flex-1 flex-col items-center gap-1">
            {/* Bar */}
            <div className="relative w-full flex-1 flex items-end">
              <div
                className={cn(
                  'w-full rounded-t transition-all',
                  isToday ? 'bg-primary' : 'bg-primary/30',
                )}
                style={{ height: minutes > 0 ? `${heightPct}%` : '2px' }}
                aria-hidden="true"
              />
            </div>

            {/* Tooltip on hover */}
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-popover px-2 py-1 text-[10px] text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10">
              {minutes}m
            </div>

            {/* Day label */}
            <span className={cn('text-[10px]', isToday ? 'font-bold text-primary' : 'text-muted-foreground')}>
              {format(new Date(date + 'T00:00:00'), 'EEE')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ProductivityPage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Productivity</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Pomodoro timer, daily planner, and focus statistics.
      </p>

      <Tabs defaultValue="timer" className="mt-6">
        <TabsList>
          <TabsTrigger value="timer" className="gap-1.5">
            <Timer className="h-4 w-4" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="planner" className="gap-1.5">
            <CalendarDays className="h-4 w-4" />
            Planner
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="mt-8 flex justify-center">
          <div className="w-full max-w-sm">
            <PomodoroTimer />
          </div>
        </TabsContent>

        <TabsContent value="planner" className="mt-6">
          <DailyPlanner />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6 max-w-2xl">
          <FocusStatistics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

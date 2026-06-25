export type PomodoroType = 'work' | 'short-break' | 'long-break';

export interface PomodoroSession {
  _id: string;
  userId: string;
  type: PomodoroType;
  duration: number;
  startedAt: Date;
  completedAt: Date | null;
  isCompleted: boolean;
  label: string;
}

export interface DailyPlanItem {
  _id: string;
  title: string;
  scheduledTime: string | null;
  duration: number | null;
  done: boolean;
  notes: string;
}

export interface DailyPlan {
  _id: string;
  userId: string;
  date: string;
  items: DailyPlanItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PomodoroStatsBucket {
  sessions: number;
  focusMinutes: number;
  completedSessions: number;
}

export interface PomodoroStats {
  today: PomodoroStatsBucket;
  thisWeek: PomodoroStatsBucket & {
    dailyBreakdown: Array<{ date: string; minutes: number }>;
  };
  thisMonth: PomodoroStatsBucket;
  streak: number;
}

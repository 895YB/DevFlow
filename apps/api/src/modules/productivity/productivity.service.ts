import { PomodoroSession, type IPomodoroSession } from './pomodoro-session.model.js';
import { DailyPlan, type IDailyPlan } from './daily-plan.model.js';
import { AppError } from '../../utils/app-error.js';
import type {
  CreateSessionInput,
  CreatePlanItemInput,
  UpdatePlanItemInput,
  PomodoroStats,
} from '@devflow/shared';

// ─── Pomodoro ────────────────────────────────────────────────────────────────

export async function createSession(
  userId: string,
  input: CreateSessionInput,
): Promise<IPomodoroSession> {
  return PomodoroSession.create({
    userId,
    type: input.type,
    duration: input.duration,
    label: input.label ?? '',
    startedAt: input.startedAt ? new Date(input.startedAt) : new Date(),
    isCompleted: false,
    completedAt: null,
  });
}

export async function completeSession(
  userId: string,
  sessionId: string,
): Promise<IPomodoroSession> {
  const session = await PomodoroSession.findOneAndUpdate(
    { _id: sessionId, userId, isCompleted: false },
    { $set: { isCompleted: true, completedAt: new Date() } },
    { new: true },
  );
  if (!session) throw AppError.notFound('Session not found or already completed');
  return session;
}

export async function listSessions(
  userId: string,
  params: { type?: string; from?: string; to?: string; limit?: number },
): Promise<IPomodoroSession[]> {
  const filter: Record<string, unknown> = { userId };
  if (params.type) filter['type'] = params.type;
  if (params.from || params.to) {
    filter['startedAt'] = {};
    if (params.from) (filter['startedAt'] as Record<string, Date>)['$gte'] = new Date(params.from);
    if (params.to) (filter['startedAt'] as Record<string, Date>)['$lte'] = new Date(params.to);
  }
  return PomodoroSession.find(filter)
    .sort({ startedAt: -1 })
    .limit(params.limit ?? 100);
}

export async function getStats(userId: string): Promise<PomodoroStats> {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todaySessions, weekSessions, monthSessions] = await Promise.all([
    PomodoroSession.find({ userId, startedAt: { $gte: todayStart } }),
    PomodoroSession.find({ userId, startedAt: { $gte: weekStart } }),
    PomodoroSession.find({ userId, startedAt: { $gte: monthStart } }),
  ]);

  const bucket = (sessions: typeof todaySessions) => ({
    sessions: sessions.length,
    focusMinutes: sessions
      .filter((s) => s.type === 'work' && s.isCompleted)
      .reduce((acc, s) => acc + s.duration, 0),
    completedSessions: sessions.filter((s) => s.isCompleted).length,
  });

  // Daily breakdown for the current week (last 7 days)
  const dailyBreakdown: Array<{ date: string; minutes: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const dayMinutes = weekSessions
      .filter(
        (s) =>
          s.type === 'work' &&
          s.isCompleted &&
          new Date(s.startedAt) >= d &&
          new Date(s.startedAt) <= dayEnd,
      )
      .reduce((acc, s) => acc + s.duration, 0);

    dailyBreakdown.push({
      date: d.toISOString().slice(0, 10),
      minutes: dayMinutes,
    });
  }

  // Streak: consecutive calendar days (including today) with ≥1 completed work session
  const streak = await computeStreak(userId, now);

  return {
    today: bucket(todaySessions),
    thisWeek: { ...bucket(weekSessions), dailyBreakdown },
    thisMonth: bucket(monthSessions),
    streak,
  };
}

async function computeStreak(userId: string, now: Date): Promise<number> {
  // Fetch last 90 days of completed work sessions
  const since = new Date(now);
  since.setDate(now.getDate() - 90);
  since.setHours(0, 0, 0, 0);

  const sessions = await PomodoroSession.find({
    userId,
    type: 'work',
    isCompleted: true,
    startedAt: { $gte: since },
  })
    .select('startedAt')
    .lean();

  const activeDays = new Set(
    sessions.map((s) => new Date(s.startedAt).toISOString().slice(0, 10)),
  );

  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  // If the user hasn't completed a session today yet, start from yesterday
  // so a streak earned through yesterday isn't shown as 0 until they start.
  if (!activeDays.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (activeDays.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

// ─── Daily Planner ───────────────────────────────────────────────────────────

export async function getPlan(userId: string, date: string): Promise<IDailyPlan> {
  const existing = await DailyPlan.findOne({ userId, date });
  if (existing) return existing;

  // Create an empty plan on first access
  return DailyPlan.create({ userId, date, items: [] });
}

export async function addItem(
  userId: string,
  date: string,
  input: CreatePlanItemInput,
): Promise<IDailyPlan> {
  const plan = await DailyPlan.findOneAndUpdate(
    { userId, date },
    { $push: { items: { ...input } } },
    { new: true, upsert: true, runValidators: true },
  );
  if (!plan) throw AppError.notFound('Plan not found');
  return plan;
}

export async function updateItem(
  userId: string,
  date: string,
  itemId: string,
  input: UpdatePlanItemInput,
): Promise<IDailyPlan> {
  const setFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    setFields[`items.$.${key}`] = value;
  }

  const plan = await DailyPlan.findOneAndUpdate(
    { userId, date, 'items._id': itemId },
    { $set: setFields },
    { new: true, runValidators: true },
  );
  if (!plan) throw AppError.notFound('Plan item not found');
  return plan;
}

export async function removeItem(
  userId: string,
  date: string,
  itemId: string,
): Promise<IDailyPlan> {
  const plan = await DailyPlan.findOneAndUpdate(
    { userId, date },
    { $pull: { items: { _id: itemId } } },
    { new: true },
  );
  if (!plan) throw AppError.notFound('Plan not found');
  return plan;
}

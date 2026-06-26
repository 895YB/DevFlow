import mongoose from 'mongoose';
import { Project } from '../projects/project.model.js';
import { Task } from '../tasks/task.model.js';
import { PomodoroSession } from '../productivity/pomodoro-session.model.js';
import { LeetCodeProfile } from '../leetcode/leetcode-profile.model.js';
import { GitHubConnection } from '../github/github-connection.model.js';
import { Activity } from '../activity/activity.model.js';
import { ApiHistory } from '../api-tester/api-history.model.js';
import { Notification } from '../notifications/notification.model.js';
import type { DashboardData } from '@devflow/shared';

export async function getDashboardData(
  workspaceId: string,
  dbUserId: string,
  clerkUserId: string,
): Promise<DashboardData> {
  const wid = new mongoose.Types.ObjectId(workspaceId);
  const uid = new mongoose.Types.ObjectId(dbUserId);

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);
  sevenDaysFromNow.setHours(23, 59, 59, 999);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(now.getDate() - 90);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalTasks,
    completedToday,
    activeProjects,
    focusResult,
    recentProjectDocs,
    todaysTaskDocs,
    leetcodeDoc,
    githubResult,
    recentActivityDocs,
    recentApiRequestDocs,
    todayPomodoros,
    unreadNotifications,
    upcomingTaskDocs,
    streakSessions,
  ] = await Promise.all([
    Task.countDocuments({ workspace: wid, deletedAt: null }),

    Task.countDocuments({
      workspace: wid,
      deletedAt: null,
      completedAt: { $gte: todayStart, $lte: todayEnd },
    }),

    Project.countDocuments({ workspace: wid, deletedAt: null }),

    // PomodoroSession stores clerkUserId — use it here
    PomodoroSession.aggregate<{ totalMinutes: number }>([
      {
        $match: {
          userId: clerkUserId,
          type: 'work',
          isCompleted: true,
          startedAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      { $group: { _id: null, totalMinutes: { $sum: '$duration' } } },
    ]),

    Project.find({ workspace: wid, deletedAt: null })
      .select('_id name icon color updatedAt')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean() as unknown as Promise<
      Array<{
        _id: mongoose.Types.ObjectId;
        name: string;
        icon: string;
        color: string;
        updatedAt: Date;
      }>
    >,

    Task.find({
      workspace: wid,
      deletedAt: null,
      completedAt: null,
      dueDate: { $lte: todayEnd },
    })
      .select('_id title priority dueDate project')
      .populate<{ project: { _id: mongoose.Types.ObjectId; name: string; color: string } }>(
        'project',
        'name color',
      )
      .sort({ dueDate: 1 })
      .limit(10)
      .lean(),

    LeetCodeProfile.findOne({ user: uid }).select('username stats streaks').lean(),

    // Fetch only repoCount via $size — avoids loading the full cachedRepos array
    GitHubConnection.aggregate<{ username: string; repoCount: number }>([
      { $match: { user: uid } },
      { $project: { _id: 0, username: 1, repoCount: { $size: '$cachedRepos' } } },
    ]),

    Activity.find({ workspaceId: wid })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),

    // ApiHistory stores clerkUserId
    ApiHistory.find({ userId: clerkUserId })
      .select('_id method url response executedAt')
      .sort({ executedAt: -1 })
      .limit(5)
      .lean(),

    // PomodoroSession stores clerkUserId
    PomodoroSession.countDocuments({
      userId: clerkUserId,
      type: 'work',
      isCompleted: true,
      startedAt: { $gte: todayStart, $lte: todayEnd },
    }),

    // Notification stores clerkUserId
    Notification.countDocuments({ userId: clerkUserId, read: false }),

    Task.find({
      workspace: wid,
      deletedAt: null,
      completedAt: null,
      dueDate: { $gt: todayEnd, $lte: sevenDaysFromNow },
    })
      .select('_id title priority dueDate project')
      .populate<{ project: { _id: mongoose.Types.ObjectId; name: string; color: string } }>(
        'project',
        'name color',
      )
      .sort({ dueDate: 1 })
      .limit(7)
      .lean(),

    // PomodoroSession stores clerkUserId
    PomodoroSession.find({
      userId: clerkUserId,
      type: 'work',
      isCompleted: true,
      startedAt: { $gte: ninetyDaysAgo },
    })
      .select('startedAt')
      .lean(),
  ]);

  // Compute pomodoro streak.
  // If the user hasn't completed a session today yet, start the walk from
  // yesterday so the streak earned through yesterday is preserved.
  const activeDays = new Set(
    streakSessions.map((s) => new Date(s.startedAt).toISOString().slice(0, 10)),
  );
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  if (!activeDays.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (activeDays.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const githubDoc = githubResult[0] ?? null;

  return {
    stats: {
      totalTasks,
      completedToday,
      activeProjects,
      focusMinutesToday: focusResult[0]?.totalMinutes ?? 0,
    },

    recentProjects: recentProjectDocs.map((p) => ({
      _id: String(p._id),
      name: p.name,
      icon: p.icon,
      color: p.color,
      updatedAt: p.updatedAt.toISOString(),
    })),

    todaysTasks: todaysTaskDocs.map((t) => {
      const proj = t.project as unknown as {
        _id: mongoose.Types.ObjectId;
        name: string;
        color: string;
      } | null;
      return {
        _id: String(t._id),
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        projectId: String(proj?._id ?? ''),
        projectName: proj?.name ?? '',
        projectColor: proj?.color ?? '#3B82F6',
      };
    }),

    leetcode: leetcodeDoc
      ? {
          username: leetcodeDoc.username,
          totalSolved: leetcodeDoc.stats.totalSolved,
          streak: leetcodeDoc.streaks.current,
          easySolved: leetcodeDoc.stats.easySolved,
          mediumSolved: leetcodeDoc.stats.mediumSolved,
          hardSolved: leetcodeDoc.stats.hardSolved,
        }
      : null,

    github: githubDoc
      ? {
          username: githubDoc.username,
          repoCount: githubDoc.repoCount,
        }
      : null,

    recentActivity: recentActivityDocs.map((a) => ({
      _id: String(a._id),
      type: a.type,
      resourceType: a.resourceType,
      resourceTitle: a.resourceTitle,
      actorName: a.actorName,
      actorAvatar: a.actorAvatar,
      createdAt: new Date(a.createdAt).toISOString(),
    })),

    recentApiRequests: recentApiRequestDocs.map((r) => ({
      _id: String(r._id),
      method: r.method,
      url: r.url,
      status: r.response?.status ?? null,
      duration: r.response?.duration ?? null,
      executedAt: r.executedAt.toISOString(),
    })),

    pomodoroSummary: {
      todaySessions: todayPomodoros,
      todayFocusMinutes: focusResult[0]?.totalMinutes ?? 0,
      streak,
    },

    unreadNotifications,

    upcomingTasks: upcomingTaskDocs.map((t) => {
      const proj = t.project as unknown as {
        _id: mongoose.Types.ObjectId;
        name: string;
        color: string;
      } | null;
      return {
        _id: String(t._id),
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate ? t.dueDate.toISOString() : new Date().toISOString(),
        projectId: String(proj?._id ?? ''),
        projectName: proj?.name ?? '',
        projectColor: proj?.color ?? '#3B82F6',
      };
    }),
  };
}

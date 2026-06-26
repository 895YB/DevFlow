import mongoose from 'mongoose';
import { Task } from '../tasks/task.model.js';
import { Project } from '../projects/project.model.js';
import { DocumentModel } from '../documents/document.model.js';
import { PomodoroSession } from '../productivity/pomodoro-session.model.js';
import { ApiHistory } from '../api-tester/api-history.model.js';
import type { AnalyticsData, AnalyticsBucket, AnalyticsPeriod } from '@devflow/shared';

function buildDateRange(period: AnalyticsPeriod): { from: Date; days: number } {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);
  return { from, days };
}

function buildBuckets(days: number): Map<string, number> {
  const map = new Map<string, number>();
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  return map;
}

function aggregateToBuckets(
  docs: Array<{ date: string }>,
  buckets: Map<string, number>,
): AnalyticsBucket[] {
  for (const doc of docs) {
    const key = doc.date.slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }
  return Array.from(buckets.entries()).map(([date, value]) => ({ date, value }));
}

function sumBuckets(
  docs: Array<{ date: string; value: number }>,
  buckets: Map<string, number>,
): AnalyticsBucket[] {
  for (const doc of docs) {
    const key = doc.date.slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + doc.value);
    }
  }
  return Array.from(buckets.entries()).map(([date, value]) => ({ date, value }));
}

export async function getAnalytics(
  workspaceId: string,
  clerkUserId: string,
  period: AnalyticsPeriod,
): Promise<AnalyticsData> {
  const wid = new mongoose.Types.ObjectId(workspaceId);
  const { from, days } = buildDateRange(period);

  const [
    tasksCompletedRaw,
    projectsCreatedRaw,
    focusMinutesRaw,
    documentsCreatedRaw,
    apiRequestsRaw,
    totalTasks,
    openTasks,
  ] = await Promise.all([
    // Tasks completed per day
    Task.aggregate<{ date: string }>([
      {
        $match: {
          workspace: wid,
          deletedAt: null,
          completedAt: { $gte: from },
        },
      },
      {
        $project: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
          },
        },
      },
    ]),

    // Projects created per day
    Project.aggregate<{ date: string }>([
      {
        $match: {
          workspace: wid,
          deletedAt: null,
          createdAt: { $gte: from },
        },
      },
      {
        $project: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
        },
      },
    ]),

    // Focus minutes per day — PomodoroSession stores the Clerk userId
    PomodoroSession.aggregate<{ date: string; value: number }>([
      {
        $match: {
          userId: clerkUserId,
          type: 'work',
          isCompleted: true,
          startedAt: { $gte: from },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startedAt' },
          },
          value: { $sum: '$duration' },
        },
      },
      { $project: { _id: 0, date: '$_id', value: 1 } },
    ]),

    // Documents created per day
    DocumentModel.aggregate<{ date: string }>([
      {
        $match: {
          workspace: wid,
          deletedAt: null,
          createdAt: { $gte: from },
        },
      },
      {
        $project: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
        },
      },
    ]),

    // API requests per day — ApiHistory stores the Clerk userId
    ApiHistory.aggregate<{ date: string }>([
      {
        $match: {
          userId: clerkUserId,
          executedAt: { $gte: from },
        },
      },
      {
        $project: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$executedAt' },
          },
        },
      },
    ]),

    Task.countDocuments({ workspace: wid, deletedAt: null }),
    Task.countDocuments({ workspace: wid, deletedAt: null, completedAt: null }),
  ]);

  const taskBuckets = buildBuckets(days);
  const projBuckets = buildBuckets(days);
  const focusBuckets = buildBuckets(days);
  const docBuckets = buildBuckets(days);
  const apiBuckets = buildBuckets(days);

  const tasksCompleted = aggregateToBuckets(tasksCompletedRaw, taskBuckets);
  const projectsCreated = aggregateToBuckets(projectsCreatedRaw, projBuckets);
  const documentsCreated = aggregateToBuckets(documentsCreatedRaw, docBuckets);
  const apiRequests = aggregateToBuckets(apiRequestsRaw, apiBuckets);
  const focusMinutes = sumBuckets(focusMinutesRaw, focusBuckets);

  const totalCompleted = tasksCompleted.reduce((s, b) => s + b.value, 0);
  const totalFocus = focusMinutes.reduce((s, b) => s + b.value, 0);
  const totalDocs = documentsCreated.reduce((s, b) => s + b.value, 0);
  const totalApi = apiRequests.reduce((s, b) => s + b.value, 0);
  const totalProjects = projectsCreated.reduce((s, b) => s + b.value, 0);

  const taskCompletionRate =
    totalTasks > 0
      ? Math.round(((totalTasks - openTasks) / totalTasks) * 100)
      : 0;

  return {
    period,
    tasksCompleted,
    projectsCreated,
    focusMinutes,
    documentsCreated,
    apiRequests,
    totals: {
      tasksCompleted: totalCompleted,
      projectsCreated: totalProjects,
      focusMinutes: totalFocus,
      documentsCreated: totalDocs,
      apiRequests: totalApi,
      totalTasks,
      openTasks,
    },
    taskCompletionRate,
  };
}

import mongoose from 'mongoose';
import { Project } from '../projects/project.model.js';
import { Task } from '../tasks/task.model.js';
import { PomodoroSession } from '../productivity/pomodoro-session.model.js';
import { LeetCodeProfile } from '../leetcode/leetcode-profile.model.js';
import { GitHubConnection } from '../github/github-connection.model.js';
import type { DashboardData } from '@devflow/shared';

export async function getDashboardData(
  workspaceId: string,
  dbUserId: string,
): Promise<DashboardData> {
  const wid = new mongoose.Types.ObjectId(workspaceId);
  const uid = new mongoose.Types.ObjectId(dbUserId);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    totalTasks,
    completedToday,
    activeProjects,
    focusResult,
    recentProjectDocs,
    todaysTaskDocs,
    leetcodeDoc,
    githubDoc,
  ] = await Promise.all([
    Task.countDocuments({ workspace: wid, deletedAt: null }),

    Task.countDocuments({
      workspace: wid,
      deletedAt: null,
      completedAt: { $gte: todayStart, $lte: todayEnd },
    }),

    Project.countDocuments({ workspace: wid, deletedAt: null }),

    PomodoroSession.aggregate<{ totalMinutes: number }>([
      {
        $match: {
          userId: dbUserId,
          type: 'work',
          isCompleted: true,
          startedAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      { $group: { _id: null, totalMinutes: { $sum: '$duration' } } },
    ]),

    Project.find({ workspace: wid, deletedAt: null })
      .select('_id name icon color createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean() as unknown as Promise<Array<{ _id: import('mongoose').Types.ObjectId; name: string; icon: string; color: string; updatedAt: Date; }>>,

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

    GitHubConnection.findOne({ user: uid }).select('username cachedRepos').lean(),
  ]);

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
          repoCount: githubDoc.cachedRepos.length,
        }
      : null,
  };
}

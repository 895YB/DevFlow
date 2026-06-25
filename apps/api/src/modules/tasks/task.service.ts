import mongoose from 'mongoose';
import { Task, type ITask } from './task.model.js';
import { TaskComment, type ITaskComment } from './task-comment.model.js';
import { TaskActivity } from './task-activity.model.js';
import { Project } from '../projects/project.model.js';
import { AppError } from '../../utils/app-error.js';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.js';
import type { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '@devflow/shared';

async function logActivity(
  taskId: string,
  workspaceId: string,
  userId: string,
  action: string,
  details?: { field?: string; from?: unknown; to?: unknown },
) {
  await TaskActivity.create({
    task: taskId,
    workspace: workspaceId,
    user: userId,
    action,
    details: details ?? {},
  });
}

export async function createTask(
  workspaceId: string,
  projectId: string,
  userId: string,
  data: CreateTaskInput,
): Promise<ITask> {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId, deletedAt: null });
  if (!project) throw AppError.notFound('Project not found');

  let statusId = data.status;
  if (!statusId) {
    const defaultStatus = project.statuses.find((s) => s.isDefault) ?? project.statuses[0];
    if (!defaultStatus) throw AppError.badRequest('Project has no statuses');
    statusId = String(defaultStatus._id);
  }

  const maxOrder = await Task.findOne(
    { project: projectId, status: statusId, deletedAt: null },
    { order: 1 },
    { sort: { order: -1 } },
  );

  const task = await Task.create({
    project: projectId,
    workspace: workspaceId,
    title: data.title,
    description: data.description ?? '',
    status: statusId,
    priority: data.priority ?? 'none',
    assignees: data.assignees ?? [],
    labels: data.labels ?? [],
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    order: (maxOrder?.order ?? -1) + 1,
    createdBy: userId,
  });

  await logActivity(String(task._id), workspaceId, userId, 'created');
  return task;
}

export async function getTasks(
  workspaceId: string,
  projectId: string,
  query: TaskQueryInput,
) {
  const filter: Record<string, unknown> = {
    project: projectId,
    workspace: workspaceId,
    deletedAt: null,
  };

  if (query.status) filter['status'] = query.status;
  if (query.priority) {
    filter['priority'] = { $in: query.priority.split(',') };
  }
  if (query.assignee) filter['assignees'] = query.assignee;
  if (query.label) filter['labels'] = query.label;

  if (query.dueDate) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    if (query.dueDate === 'overdue') {
      filter['dueDate'] = { $lt: todayStart, $ne: null };
    } else if (query.dueDate === 'today') {
      filter['dueDate'] = { $gte: todayStart, $lt: todayEnd };
    } else if (query.dueDate === 'week') {
      const weekEnd = new Date(todayStart.getTime() + 7 * 86400000);
      filter['dueDate'] = { $gte: todayStart, $lt: weekEnd };
    }
  }

  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter['title'] = { $regex: escaped, $options: 'i' };
  }

  const sortField = query.sort ?? 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

  const { skip, limit, page } = parsePagination({ page: query.page, limit: query.limit });

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(limit).populate('assignees', 'displayName avatar'),
    Task.countDocuments(filter),
  ]);

  return { tasks, meta: buildPaginationMeta(page, limit, total) };
}

export async function getTaskById(
  projectId: string,
  taskId: string,
): Promise<ITask | null> {
  return Task.findOne({ _id: taskId, project: projectId, deletedAt: null })
    .populate('assignees', 'displayName avatar email')
    .populate('createdBy', 'displayName avatar');
}

export async function updateTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  userId: string,
  data: UpdateTaskInput,
): Promise<ITask> {
  const existing = await Task.findOne({ _id: taskId, project: projectId, deletedAt: null });
  if (!existing) throw AppError.notFound('Task not found');

  const update: Record<string, unknown> = {};
  const activities: Array<{ field: string; from: unknown; to: unknown }> = [];

  if (data.title !== undefined && data.title !== existing.title) {
    update['title'] = data.title;
    activities.push({ field: 'title', from: existing.title, to: data.title });
  }
  if (data.description !== undefined) update['description'] = data.description;
  if (data.status !== undefined && data.status !== String(existing.status)) {
    update['status'] = data.status;
    activities.push({ field: 'status', from: String(existing.status), to: data.status });

    const project = await Project.findById(projectId);
    const newStatus = project?.statuses.find((s) => String(s._id) === data.status);
    if (newStatus?.isDone) {
      update['completedAt'] = new Date();
    } else {
      update['completedAt'] = null;
    }
  }
  if (data.priority !== undefined && data.priority !== existing.priority) {
    update['priority'] = data.priority;
    activities.push({ field: 'priority', from: existing.priority, to: data.priority });
  }
  if (data.assignees !== undefined) {
    update['assignees'] = data.assignees;
    activities.push({ field: 'assignees', from: existing.assignees.map(String), to: data.assignees });
  }
  if (data.labels !== undefined) update['labels'] = data.labels;
  if (data.dueDate !== undefined) {
    update['dueDate'] = data.dueDate ? new Date(data.dueDate) : null;
    activities.push({ field: 'dueDate', from: existing.dueDate, to: data.dueDate });
  }

  const task = await Task.findOneAndUpdate(
    { _id: taskId },
    { $set: update },
    { new: true },
  ).populate('assignees', 'displayName avatar email');

  if (!task) throw AppError.notFound('Task not found');

  for (const activity of activities) {
    await logActivity(taskId, workspaceId, userId, `${activity.field}_changed`, activity);
  }

  return task;
}

export async function deleteTask(
  workspaceId: string,
  taskId: string,
  userId: string,
): Promise<void> {
  const result = await Task.findOneAndUpdate(
    { _id: taskId, workspace: workspaceId, deletedAt: null },
    { $set: { deletedAt: new Date() } },
  );
  if (!result) throw AppError.notFound('Task not found');
  await logActivity(taskId, workspaceId, userId, 'deleted');
}

export async function reorderTasks(
  tasks: Array<{ taskId: string; status: string; order: number }>,
): Promise<void> {
  const bulkOps = tasks.map((t) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(t.taskId) },
      update: { $set: { status: new mongoose.Types.ObjectId(t.status), order: t.order } },
    },
  }));
  await Task.bulkWrite(bulkOps as never);
}

export async function bulkUpdateTasks(
  workspaceId: string,
  taskIds: string[],
  update: Record<string, unknown>,
  userId: string,
): Promise<void> {
  const setFields: Record<string, unknown> = {};
  if (update['status']) setFields['status'] = update['status'];
  if (update['priority']) setFields['priority'] = update['priority'];
  if (update['assignees']) setFields['assignees'] = update['assignees'];
  if (update['labels']) setFields['labels'] = update['labels'];
  if (update['dueDate'] !== undefined) {
    setFields['dueDate'] = update['dueDate'] ? new Date(update['dueDate'] as string) : null;
  }

  await Task.updateMany(
    { _id: { $in: taskIds }, workspace: workspaceId, deletedAt: null },
    { $set: setFields },
  );

  for (const taskId of taskIds) {
    await logActivity(taskId, workspaceId, userId, 'bulk_updated');
  }
}

// Subtasks
export async function addSubtask(
  taskId: string,
  workspaceId: string,
  userId: string,
  title: string,
): Promise<ITask> {
  const task = await Task.findOne({ _id: taskId, deletedAt: null });
  if (!task) throw AppError.notFound('Task not found');

  const maxOrder = task.subtasks.reduce((max, s) => Math.max(max, s.order), -1);

  task.subtasks.push({
    title,
    completed: false,
    order: maxOrder + 1,
  } as never);
  await task.save();

  await logActivity(taskId, workspaceId, userId, 'subtask_added', { to: title });
  return task;
}

export async function updateSubtask(
  taskId: string,
  subtaskId: string,
  workspaceId: string,
  userId: string,
  data: { title?: string; completed?: boolean },
): Promise<ITask> {
  const task = await Task.findOne({ _id: taskId, deletedAt: null });
  if (!task) throw AppError.notFound('Task not found');

  const subtask = task.subtasks.find((s) => String(s._id) === subtaskId);
  if (!subtask) throw AppError.notFound('Subtask not found');

  if (data.title !== undefined) subtask.title = data.title;
  if (data.completed !== undefined) {
    subtask.completed = data.completed;
    if (data.completed) {
      await logActivity(taskId, workspaceId, userId, 'subtask_completed', { to: subtask.title });
    }
  }

  await task.save();
  return task;
}

export async function deleteSubtask(taskId: string, subtaskId: string): Promise<ITask> {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, deletedAt: null },
    { $pull: { subtasks: { _id: subtaskId } } },
    { new: true },
  );
  if (!task) throw AppError.notFound('Task not found');
  return task;
}

export async function reorderSubtasks(
  taskId: string,
  orderedIds: string[],
): Promise<ITask> {
  const task = await Task.findOne({ _id: taskId, deletedAt: null });
  if (!task) throw AppError.notFound('Task not found');

  orderedIds.forEach((id, index) => {
    const subtask = task.subtasks.find((s) => String(s._id) === id);
    if (subtask) subtask.order = index;
  });
  task.subtasks.sort((a, b) => a.order - b.order);
  await task.save();
  return task;
}

// Comments
export async function getComments(taskId: string): Promise<ITaskComment[]> {
  return TaskComment.find({ task: taskId, deletedAt: null })
    .populate('author', 'displayName avatar')
    .sort({ createdAt: -1 });
}

export async function addComment(
  taskId: string,
  workspaceId: string,
  userId: string,
  content: string,
  mentions: string[],
): Promise<ITaskComment> {
  const comment = await TaskComment.create({
    task: taskId,
    author: userId,
    content,
    mentions,
  });

  await logActivity(taskId, workspaceId, userId, 'comment_added');

  return TaskComment.findById(comment._id)
    .populate('author', 'displayName avatar') as unknown as Promise<ITaskComment>;
}

export async function updateComment(
  commentId: string,
  userId: string,
  content: string,
): Promise<ITaskComment> {
  const comment = await TaskComment.findOneAndUpdate(
    { _id: commentId, author: userId, deletedAt: null },
    { $set: { content, editedAt: new Date() } },
    { new: true },
  ).populate('author', 'displayName avatar');

  if (!comment) throw AppError.notFound('Comment not found');
  return comment;
}

export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const result = await TaskComment.findOneAndUpdate(
    { _id: commentId, author: userId, deletedAt: null },
    { $set: { deletedAt: new Date() } },
  );
  if (!result) throw AppError.notFound('Comment not found');
}

// Activity
export async function getActivities(taskId: string) {
  return TaskActivity.find({ task: taskId })
    .populate('user', 'displayName avatar')
    .sort({ createdAt: -1 })
    .limit(50);
}

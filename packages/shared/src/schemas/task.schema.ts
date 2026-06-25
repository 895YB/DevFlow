import { z } from 'zod';
import { TASK_PRIORITY_VALUES } from '../constants/priorities.js';

const priorityEnum = z.enum(TASK_PRIORITY_VALUES);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional().default(''),
  status: z.string().optional(),
  priority: priorityEnum.optional().default('none'),
  assignees: z.array(z.string()).optional().default([]),
  labels: z.array(z.string()).optional().default([]),
  dueDate: z.string().datetime().nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(10000).optional(),
  status: z.string().optional(),
  priority: priorityEnum.optional(),
  assignees: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const reorderTasksSchema = z.object({
  tasks: z.array(
    z.object({
      taskId: z.string().min(1),
      status: z.string().min(1),
      order: z.number().int().min(0),
    }),
  ),
});

export const bulkUpdateTasksSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1),
  update: z.object({
    status: z.string().optional(),
    priority: priorityEnum.optional(),
    assignees: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    dueDate: z.string().datetime().nullable().optional(),
  }),
});

export const createSubtaskSchema = z.object({
  title: z.string().min(1).max(200),
});

export const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  mentions: z.array(z.string()).optional().default([]),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const taskQuerySchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  assignee: z.string().optional(),
  label: z.string().optional(),
  dueDate: z.enum(['overdue', 'today', 'week']).optional(),
  search: z.string().optional(),
  sort: z.enum(['createdAt', 'dueDate', 'priority', 'title']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>;
export type BulkUpdateTasksInput = z.infer<typeof bulkUpdateTasksSchema>;
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;

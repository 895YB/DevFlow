import type { TaskPriority } from '../constants/priorities.js';

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface TaskAttachment {
  _id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TaskGitHubLink {
  number: number;
  url: string;
  state: string;
}

export interface Task {
  _id: string;
  project: string;
  workspace: string;
  title: string;
  description: string;
  status: string;
  priority: TaskPriority;
  assignees: string[];
  labels: string[];
  dueDate: Date | null;
  subtasks: Subtask[];
  attachments: TaskAttachment[];
  order: number;
  githubIssue: TaskGitHubLink | null;
  githubPR: TaskGitHubLink | null;
  createdBy: string;
  completedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskComment {
  _id: string;
  task: string;
  author: string | { _id: string; displayName: string; avatar: string };
  content: string;
  mentions: string[];
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskActivity {
  _id: string;
  task: string;
  workspace: string;
  user: string | { _id: string; displayName: string; avatar: string };
  action: string;
  details: {
    field?: string;
    from?: unknown;
    to?: unknown;
  };
  createdAt: Date;
}

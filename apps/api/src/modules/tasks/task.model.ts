import mongoose, { Schema, type Document } from 'mongoose';
import type { TaskPriority } from '@devflow/shared';

export interface ISubtask {
  _id: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
  order: number;
}

export interface ITaskAttachment {
  _id: mongoose.Types.ObjectId;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

export interface ITask extends Document {
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: mongoose.Types.ObjectId;
  priority: TaskPriority;
  assignees: mongoose.Types.ObjectId[];
  labels: mongoose.Types.ObjectId[];
  dueDate: Date | null;
  subtasks: ISubtask[];
  attachments: ITaskAttachment[];
  order: number;
  githubIssue: { number: number; url: string; state: string } | null;
  githubPR: { number: number; url: string; state: string } | null;
  createdBy: mongoose.Types.ObjectId;
  completedAt: Date | null;
  deletedAt: Date | null;
}

const subtaskSchema = new Schema<ISubtask>(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

const attachmentSchema = new Schema<ITaskAttachment>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const taskSchema = new Schema<ITask>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true, minlength: 1, maxlength: 200 },
    description: { type: String, default: '' },
    status: { type: Schema.Types.ObjectId, required: true },
    priority: { type: String, enum: ['urgent', 'high', 'medium', 'low', 'none'], default: 'none' },
    assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    labels: [{ type: Schema.Types.ObjectId }],
    dueDate: { type: Date, default: null },
    subtasks: [subtaskSchema],
    attachments: [attachmentSchema],
    order: { type: Number, default: 0 },
    githubIssue: {
      type: { number: Number, url: String, state: String },
      default: null,
    },
    githubPR: {
      type: { number: Number, url: String, state: String },
      default: null,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    completedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

taskSchema.index({ project: 1, status: 1, order: 1 });
taskSchema.index({ project: 1, deletedAt: 1 });
taskSchema.index({ workspace: 1, assignees: 1 });
taskSchema.index({ workspace: 1, dueDate: 1 });
taskSchema.index({ workspace: 1, createdBy: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);

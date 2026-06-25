import mongoose, { Schema, type Document } from 'mongoose';

export interface ITaskActivity extends Document {
  task: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  action: string;
  details: {
    field?: string;
    from?: unknown;
    to?: unknown;
  };
}

const taskActivitySchema = new Schema<ITaskActivity>(
  {
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    details: {
      field: { type: String },
      from: { type: Schema.Types.Mixed },
      to: { type: Schema.Types.Mixed },
    },
  },
  { timestamps: true },
);

taskActivitySchema.index({ task: 1, createdAt: -1 });
taskActivitySchema.index({ workspace: 1, createdAt: -1 });

export const TaskActivity = mongoose.model<ITaskActivity>('TaskActivity', taskActivitySchema);

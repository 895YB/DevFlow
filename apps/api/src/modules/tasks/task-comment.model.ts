import mongoose, { Schema, type Document } from 'mongoose';

export interface ITaskComment extends Document {
  task: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  mentions: mongoose.Types.ObjectId[];
  editedAt: Date | null;
  deletedAt: Date | null;
}

const taskCommentSchema = new Schema<ITaskComment>(
  {
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 5000 },
    mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

taskCommentSchema.index({ task: 1, createdAt: -1 });

export const TaskComment = mongoose.model<ITaskComment>('TaskComment', taskCommentSchema);

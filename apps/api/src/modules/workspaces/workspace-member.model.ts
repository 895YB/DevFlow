import mongoose, { Schema, type Document } from 'mongoose';
import type { WorkspaceRole } from '@devflow/shared';

export interface IWorkspaceMember extends Document {
  workspace: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: WorkspaceRole;
  invitedBy: mongoose.Types.ObjectId;
  invitedAt: Date;
  joinedAt: Date;
}

const workspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      required: true,
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    invitedAt: { type: Date, default: Date.now },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

workspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });
workspaceMemberSchema.index({ user: 1 });
workspaceMemberSchema.index({ workspace: 1, role: 1 });

export const WorkspaceMember = mongoose.model<IWorkspaceMember>(
  'WorkspaceMember',
  workspaceMemberSchema,
);

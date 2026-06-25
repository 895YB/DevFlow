import mongoose, { Schema, type Document } from 'mongoose';
import type { ActivityType, ActivityResourceType } from '@devflow/shared';

const TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface IActivity extends Document {
  workspaceId: mongoose.Types.ObjectId;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  type: ActivityType;
  resourceType: ActivityResourceType;
  resourceId: string;
  resourceTitle: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    actorId: { type: String, required: true },
    actorName: { type: String, required: true },
    actorAvatar: { type: String, default: '' },
    type: {
      type: String,
      enum: [
        'task_created', 'task_updated', 'task_completed',
        'document_created', 'document_updated',
        'chat_message_sent', 'project_created', 'member_joined', 'channel_created',
      ],
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['task', 'document', 'project', 'chat', 'workspace'],
      required: true,
    },
    resourceId: { type: String, required: true },
    resourceTitle: { type: String, required: true, maxlength: 200 },
    createdAt: { type: Date, default: Date.now },
  },
);

activitySchema.index({ workspaceId: 1, createdAt: -1 });
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: TTL_SECONDS });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);

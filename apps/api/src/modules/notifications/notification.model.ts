import mongoose, { Schema, type Document } from 'mongoose';
import type { NotificationType } from '@devflow/shared';

const TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days

export interface INotification extends Document {
  userId: string;
  workspaceId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true },
    workspaceId: { type: String, default: null },
    type: {
      type: String,
      enum: ['task_assigned', 'task_comment', 'mention', 'chat_message', 'project_update', 'system'],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, default: '', maxlength: 500 },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: TTL_SECONDS });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);

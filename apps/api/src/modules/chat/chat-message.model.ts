import mongoose, { Schema, type Document } from 'mongoose';

export interface IChatMessage extends Document {
  channelId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IChatMessage>(
  {
    channelId: { type: Schema.Types.ObjectId, ref: 'ChatChannel', required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String, default: '' },
    content: { type: String, required: true, maxlength: 2000 },
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index({ workspaceId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', messageSchema);

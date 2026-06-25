import mongoose, { Schema, type Document } from 'mongoose';

export interface IChatChannel extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  isGeneral: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChatChannel>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, minlength: 1, maxlength: 50 },
    description: { type: String, default: '', maxlength: 200 },
    isGeneral: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

channelSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

export const ChatChannel = mongoose.model<IChatChannel>('ChatChannel', channelSchema);

import mongoose, { Schema, type Document } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  owner: mongoose.Types.ObjectId;
  settings: {
    defaultProjectView: 'kanban' | 'list' | 'calendar';
    allowMemberInvites: boolean;
  };
  deletedAt: Date | null;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, minlength: 1, maxlength: 50 },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '', maxlength: 500 },
    icon: { type: String, default: '' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    settings: {
      defaultProjectView: {
        type: String,
        enum: ['kanban', 'list', 'calendar'],
        default: 'kanban',
      },
      allowMemberInvites: { type: Boolean, default: false },
    },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

export const Workspace = mongoose.model<IWorkspace>('Workspace', workspaceSchema);

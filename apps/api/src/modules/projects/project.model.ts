import mongoose, { Schema, type Document } from 'mongoose';

export interface IProjectStatus {
  _id: mongoose.Types.ObjectId;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  isDone: boolean;
}

export interface IProjectLabel {
  _id: mongoose.Types.ObjectId;
  name: string;
  color: string;
}

export interface IProject extends Document {
  workspace: mongoose.Types.ObjectId;
  name: string;
  description: string;
  icon: string;
  color: string;
  statuses: IProjectStatus[];
  labels: IProjectLabel[];
  github: {
    repoOwner: string;
    repoName: string;
    connected: boolean;
  };
  createdBy: mongoose.Types.ObjectId;
  deletedAt: Date | null;
}

const projectStatusSchema = new Schema<IProjectStatus>(
  {
    name: { type: String, required: true },
    color: { type: String, default: '#6B7280' },
    order: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    isDone: { type: Boolean, default: false },
  },
  { _id: true },
);

const projectLabelSchema = new Schema<IProjectLabel>(
  {
    name: { type: String, required: true },
    color: { type: String, default: '#3B82F6' },
  },
  { _id: true },
);

const projectSchema = new Schema<IProject>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, minlength: 1, maxlength: 100 },
    description: { type: String, default: '', maxlength: 1000 },
    icon: { type: String, default: '' },
    color: { type: String, default: '#3B82F6' },
    statuses: [projectStatusSchema],
    labels: [projectLabelSchema],
    github: {
      repoOwner: { type: String, default: '' },
      repoName: { type: String, default: '' },
      connected: { type: Boolean, default: false },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

projectSchema.pre('save', function (next) {
  if (this.isNew && this.statuses.length === 0) {
    this.statuses = [
      { name: 'Todo', color: '#6B7280', order: 0, isDefault: true, isDone: false },
      { name: 'In Progress', color: '#F59E0B', order: 1, isDefault: false, isDone: false },
      { name: 'Done', color: '#10B981', order: 2, isDefault: false, isDone: true },
    ] as never;
  }
  next();
});

projectSchema.index({ workspace: 1, deletedAt: 1 });
projectSchema.index({ workspace: 1, name: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);

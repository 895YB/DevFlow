import mongoose, { Schema, type Document as MongoDocument } from 'mongoose';

export interface IDocument extends MongoDocument {
  workspace: mongoose.Types.ObjectId;
  title: string;
  content: string;
  icon: string;
  coverImage: string;
  parent: mongoose.Types.ObjectId | null;
  order: number;
  createdBy: mongoose.Types.ObjectId;
  lastEditedBy: mongoose.Types.ObjectId;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true, minlength: 1, maxlength: 200 },
    content: { type: String, default: '' },
    icon: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    parent: { type: Schema.Types.ObjectId, ref: 'Document', default: null },
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

documentSchema.index({ workspace: 1, parent: 1, order: 1 });
documentSchema.index({ workspace: 1, deletedAt: 1 });
documentSchema.index(
  { workspace: 1, title: 'text', content: 'text' },
  { weights: { title: 10, content: 1 } },
);

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);

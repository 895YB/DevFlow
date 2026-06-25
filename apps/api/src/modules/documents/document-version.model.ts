import mongoose, { Schema, type Document } from 'mongoose';

export interface IDocumentVersion extends Document {
  document: mongoose.Types.ObjectId;
  title: string;
  content: string;
  editedBy: mongoose.Types.ObjectId;
}

const documentVersionSchema = new Schema<IDocumentVersion>(
  {
    document: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    editedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

documentVersionSchema.index({ document: 1, createdAt: -1 });

export const DocumentVersion = mongoose.model<IDocumentVersion>(
  'DocumentVersion',
  documentVersionSchema,
);

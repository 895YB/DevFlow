import mongoose, { Schema, type Document } from 'mongoose';

export interface ISnippetFolder extends Document {
  workspace: mongoose.Types.ObjectId;
  name: string;
  parent: mongoose.Types.ObjectId | null;
  order: number;
  createdBy: mongoose.Types.ObjectId;
}

const snippetFolderSchema = new Schema<ISnippetFolder>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: true, minlength: 1, maxlength: 50 },
    parent: { type: Schema.Types.ObjectId, ref: 'SnippetFolder', default: null },
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

snippetFolderSchema.index({ workspace: 1, parent: 1 });

export const SnippetFolder = mongoose.model<ISnippetFolder>(
  'SnippetFolder',
  snippetFolderSchema,
);

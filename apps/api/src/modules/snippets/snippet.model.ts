import mongoose, { Schema, type Document } from 'mongoose';

export interface ISnippet extends Document {
  workspace: mongoose.Types.ObjectId;
  title: string;
  description: string;
  language: string;
  code: string;
  tags: string[];
  folder: mongoose.Types.ObjectId | null;
  visibility: 'personal' | 'team';
  favoritedBy: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const snippetSchema = new Schema<ISnippet>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true, minlength: 1, maxlength: 100 },
    description: { type: String, default: '', maxlength: 500 },
    language: { type: String, required: true },
    code: { type: String, required: true },
    tags: { type: [String], default: [] },
    folder: { type: Schema.Types.ObjectId, ref: 'SnippetFolder', default: null },
    visibility: { type: String, enum: ['personal', 'team'], default: 'personal' },
    favoritedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

snippetSchema.index({ workspace: 1, visibility: 1, deletedAt: 1 });
snippetSchema.index({ workspace: 1, language: 1 });
snippetSchema.index({ workspace: 1, tags: 1 });
snippetSchema.index({ workspace: 1, folder: 1 });
snippetSchema.index({ createdBy: 1, visibility: 1 });
snippetSchema.index(
  { workspace: 1, title: 'text', description: 'text' },
  { weights: { title: 10, description: 1 } },
);

export const Snippet = mongoose.model<ISnippet>('Snippet', snippetSchema);

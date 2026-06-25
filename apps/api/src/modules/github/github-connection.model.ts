import mongoose, { Schema, type Document } from 'mongoose';

export interface ICachedRepo {
  repoId: number;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  isPrivate: boolean;
  url: string;
  updatedAt: Date;
}

export interface IGitHubConnection extends Document {
  user: mongoose.Types.ObjectId;
  githubUserId: number;
  username: string;
  accessToken: string;
  cachedRepos: ICachedRepo[];
  reposCachedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const cachedRepoSchema = new Schema<ICachedRepo>(
  {
    repoId: { type: Number, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    description: { type: String, default: '' },
    language: { type: String, default: '' },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: false },
    url: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const githubConnectionSchema = new Schema<IGitHubConnection>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    githubUserId: { type: Number, required: true },
    username: { type: String, required: true },
    accessToken: { type: String, required: true },
    cachedRepos: [cachedRepoSchema],
    reposCachedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret['accessToken'];
        delete ret['__v'];
        return ret;
      },
    },
  },
);

export const GitHubConnection = mongoose.model<IGitHubConnection>(
  'GitHubConnection',
  githubConnectionSchema,
);

import mongoose, { Schema, type Document } from 'mongoose';

export interface IApiRequest {
  _id: mongoose.Types.ObjectId;
  name: string;
  method: string;
  url: string;
  params: Array<{ key: string; value: string; enabled: boolean }>;
  headers: Array<{ key: string; value: string; enabled: boolean }>;
  body: { type: string; content: string };
  auth: {
    type: string;
    bearer?: string;
    username?: string;
    password?: string;
    apiKeyName?: string;
    apiKeyValue?: string;
    apiKeyIn?: string;
  };
  order: number;
}

export interface IApiCollection extends Document {
  userId: string;
  name: string;
  description: string;
  requests: IApiRequest[];
  createdAt: Date;
  updatedAt: Date;
}

const keyValueSchema = new Schema(
  { key: String, value: String, enabled: { type: Boolean, default: true } },
  { _id: false },
);

const requestSchema = new Schema<IApiRequest>({
  name: { type: String, required: true, maxlength: 100 },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    default: 'GET',
  },
  url: { type: String, default: '', maxlength: 2000 },
  params: { type: [keyValueSchema], default: [] },
  headers: { type: [keyValueSchema], default: [] },
  body: {
    type: {
      type: String,
      enum: ['none', 'json', 'form', 'raw'],
      default: 'none',
    },
    content: { type: String, default: '', maxlength: 100_000 },
  },
  auth: {
    type: {
      type: String,
      enum: ['none', 'bearer', 'basic', 'apikey'],
      default: 'none',
    },
    bearer: String,
    username: String,
    password: String,
    apiKeyName: String,
    apiKeyValue: String,
    apiKeyIn: { type: String, enum: ['header', 'query'] },
  },
  order: { type: Number, default: 0 },
});

const apiCollectionSchema = new Schema<IApiCollection>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, minlength: 1, maxlength: 100 },
    description: { type: String, default: '', maxlength: 500 },
    requests: { type: [requestSchema], default: [] },
  },
  { timestamps: true },
);

export const ApiCollection = mongoose.model<IApiCollection>(
  'ApiCollection',
  apiCollectionSchema,
);

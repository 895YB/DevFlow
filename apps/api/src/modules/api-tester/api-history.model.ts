import mongoose, { Schema, type Document } from 'mongoose';

const HISTORY_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface IApiHistory extends Document {
  userId: string;
  method: string;
  url: string;
  request: {
    params: Array<{ key: string; value: string; enabled: boolean }>;
    headers: Array<{ key: string; value: string; enabled: boolean }>;
    body: { type: string; content: string };
    auth: { type: string; [key: string]: unknown };
  };
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    duration: number;
    size: number;
  } | null;
  executedAt: Date;
}

const keyValueSchema = new Schema(
  { key: String, value: String, enabled: { type: Boolean, default: true } },
  { _id: false },
);

const apiHistorySchema = new Schema<IApiHistory>({
  userId: { type: String, required: true, index: true },
  method: { type: String, required: true },
  url: { type: String, required: true, maxlength: 2000 },
  request: {
    params: { type: [keyValueSchema], default: [] },
    headers: { type: [keyValueSchema], default: [] },
    body: {
      type: { type: String, default: 'none' },
      content: { type: String, default: '' },
    },
    auth: { type: Schema.Types.Mixed, default: { type: 'none' } },
  },
  response: {
    type: new Schema(
      {
        status: Number,
        statusText: String,
        headers: { type: Schema.Types.Mixed, default: {} },
        body: String,
        duration: Number,
        size: Number,
      },
      { _id: false },
    ),
    default: null,
  },
  executedAt: { type: Date, default: Date.now, expires: HISTORY_TTL_SECONDS },
});

apiHistorySchema.index({ userId: 1, executedAt: -1 });

export const ApiHistory = mongoose.model<IApiHistory>(
  'ApiHistory',
  apiHistorySchema,
);

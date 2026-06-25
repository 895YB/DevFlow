import mongoose, { Schema, type Document } from 'mongoose';

export interface IApiEnvironment extends Document {
  userId: string;
  name: string;
  variables: Array<{ key: string; value: string; enabled: boolean }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const apiEnvironmentSchema = new Schema<IApiEnvironment>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, minlength: 1, maxlength: 100 },
    variables: {
      type: [
        {
          key: { type: String, maxlength: 100 },
          value: { type: String, maxlength: 2000 },
          enabled: { type: Boolean, default: true },
          _id: false,
        },
      ],
      default: [],
    },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

apiEnvironmentSchema.index({ userId: 1, isActive: 1 });

export const ApiEnvironment = mongoose.model<IApiEnvironment>(
  'ApiEnvironment',
  apiEnvironmentSchema,
);

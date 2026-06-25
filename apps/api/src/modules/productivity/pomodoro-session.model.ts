import mongoose, { Schema, type Document } from 'mongoose';

export interface IPomodoroSession extends Document {
  userId: string;
  type: 'work' | 'short-break' | 'long-break';
  duration: number;
  startedAt: Date;
  completedAt: Date | null;
  isCompleted: boolean;
  label: string;
}

const pomodoroSessionSchema = new Schema<IPomodoroSession>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['work', 'short-break', 'long-break'],
      required: true,
    },
    duration: { type: Number, required: true, min: 1, max: 120 },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date, default: null },
    isCompleted: { type: Boolean, default: false },
    label: { type: String, default: '', maxlength: 200 },
  },
  { timestamps: false },
);

pomodoroSessionSchema.index({ userId: 1, startedAt: -1 });
pomodoroSessionSchema.index({ userId: 1, type: 1, isCompleted: 1 });

export const PomodoroSession = mongoose.model<IPomodoroSession>(
  'PomodoroSession',
  pomodoroSessionSchema,
);

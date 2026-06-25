import mongoose, { Schema, type Document } from 'mongoose';

export interface IDailyPlanItem {
  _id: mongoose.Types.ObjectId;
  title: string;
  scheduledTime: string | null;
  duration: number | null;
  done: boolean;
  notes: string;
}

export interface IDailyPlan extends Document {
  userId: string;
  date: string;
  items: IDailyPlanItem[];
  createdAt: Date;
  updatedAt: Date;
}

const planItemSchema = new Schema<IDailyPlanItem>({
  title: { type: String, required: true, maxlength: 200 },
  scheduledTime: { type: String, default: null },
  duration: { type: Number, default: null, min: 1, max: 480 },
  done: { type: Boolean, default: false },
  notes: { type: String, default: '', maxlength: 500 },
});

const dailyPlanSchema = new Schema<IDailyPlan>(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true },
    items: { type: [planItemSchema], default: [] },
  },
  { timestamps: true },
);

dailyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyPlan = mongoose.model<IDailyPlan>(
  'DailyPlan',
  dailyPlanSchema,
);

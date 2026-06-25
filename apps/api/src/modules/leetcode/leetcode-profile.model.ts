import mongoose, { Schema, type Document } from 'mongoose';

export interface ILeetCodeProfile extends Document {
  user: mongoose.Types.ObjectId;
  username: string;
  profile: {
    ranking: number;
    reputation: number;
    avatar: string;
  };
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalQuestions: number;
    easyTotal: number;
    mediumTotal: number;
    hardTotal: number;
    acceptanceRate: number;
  };
  recentSubmissions: Array<{
    title: string;
    titleSlug: string;
    difficulty: string;
    status: string;
    language: string;
    timestamp: Date;
  }>;
  contests: Array<{
    title: string;
    ranking: number;
    score: number;
    date: Date;
  }>;
  streaks: {
    current: number;
    longest: number;
    lastSolveDate: Date | null;
  };
  manualEntries: Array<{
    _id: mongoose.Types.ObjectId;
    problemName: string;
    difficulty: string;
    notes: string;
    solutionCode: string;
    solvedAt: Date;
  }>;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const leetcodeProfileSchema = new Schema<ILeetCodeProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    username: { type: String, required: true },
    profile: {
      ranking: { type: Number, default: 0 },
      reputation: { type: Number, default: 0 },
      avatar: { type: String, default: '' },
    },
    stats: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 },
      easyTotal: { type: Number, default: 0 },
      mediumTotal: { type: Number, default: 0 },
      hardTotal: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
    },
    recentSubmissions: [
      {
        title: String,
        titleSlug: String,
        difficulty: String,
        status: String,
        language: String,
        timestamp: Date,
      },
    ],
    contests: [
      {
        title: String,
        ranking: Number,
        score: Number,
        date: Date,
      },
    ],
    streaks: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastSolveDate: { type: Date, default: null },
    },
    manualEntries: [
      {
        problemName: { type: String, required: true },
        difficulty: { type: String, default: 'Medium' },
        notes: { type: String, default: '' },
        solutionCode: { type: String, default: '' },
        solvedAt: { type: Date, default: Date.now },
      },
    ],
    lastSyncedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const LeetCodeProfile = mongoose.model<ILeetCodeProfile>(
  'LeetCodeProfile',
  leetcodeProfileSchema,
);

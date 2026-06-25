import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar: string;
  bio: string;

  profile: {
    skills: string[];
    githubUsername: string;
    leetcodeUsername: string;
    portfolioUrl: string;
    location: string;
  };

  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      inApp: boolean;
      browser: boolean;
      taskAssigned: boolean;
      taskComment: boolean;
      mentions: boolean;
      projectUpdates: boolean;
      chatMessages: boolean;
    };
  };

  connectedAccounts: {
    github: {
      connected: boolean;
      username: string;
      accessToken: string;
      refreshToken: string;
      connectedAt: Date | null;
    };
    leetcode: {
      connected: boolean;
      username: string;
      connectedAt: Date | null;
    };
  };

  plan: 'free' | 'pro';
  lastActiveAt: Date | null;
  onboardingCompleted: boolean;
  deletedAt: Date | null;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    displayName: { type: String, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },

    profile: {
      skills: { type: [String], default: [] },
      githubUsername: { type: String, default: '' },
      leetcodeUsername: { type: String, default: '' },
      portfolioUrl: { type: String, default: '' },
      location: { type: String, default: '' },
    },

    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notifications: {
        email: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
        browser: { type: Boolean, default: false },
        taskAssigned: { type: Boolean, default: true },
        taskComment: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        projectUpdates: { type: Boolean, default: true },
        chatMessages: { type: Boolean, default: true },
      },
    },

    connectedAccounts: {
      github: {
        connected: { type: Boolean, default: false },
        username: { type: String, default: '' },
        accessToken: { type: String, default: '' },
        refreshToken: { type: String, default: '' },
        connectedAt: { type: Date, default: null },
      },
      leetcode: {
        connected: { type: Boolean, default: false },
        username: { type: String, default: '' },
        connectedAt: { type: Date, default: null },
      },
    },

    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    lastActiveAt: { type: Date, default: null },
    onboardingCompleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        const accounts = ret['connectedAccounts'] as Record<string, Record<string, unknown>> | undefined;
        if (accounts?.github) {
          delete accounts.github['accessToken'];
          delete accounts.github['refreshToken'];
        }
        delete ret['__v'];
        return ret;
      },
    },
  },
);

userSchema.index({ clerkId: 1, deletedAt: 1 });

export const User = mongoose.model<IUser>('User', userSchema);

export interface UserProfile {
  skills: string[];
  githubUsername: string;
  leetcodeUsername: string;
  portfolioUrl: string;
  location: string;
  website: string;
  linkedinUrl: string;
  timezone: string;
  preferredLanguage: string;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  browser: boolean;
  taskAssigned: boolean;
  taskComment: boolean;
  mentions: boolean;
  projectUpdates: boolean;
  chatMessages: boolean;
  githubNotifications: boolean;
  leetcodeNotifications: boolean;
  teamActivity: boolean;
  documentUpdates: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
}

export interface ConnectedGitHub {
  connected: boolean;
  username: string;
  connectedAt: Date | null;
}

export interface ConnectedLeetCode {
  connected: boolean;
  username: string;
  connectedAt: Date | null;
}

export interface ConnectedAccounts {
  github: ConnectedGitHub;
  leetcode: ConnectedLeetCode;
}

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar: string;
  bio: string;
  profile: UserProfile;
  preferences: UserPreferences;
  connectedAccounts: ConnectedAccounts;
  plan: 'free' | 'pro';
  lastActiveAt: Date | null;
  onboardingCompleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

import { z } from 'zod';

const urlOrEmpty = z.string().url().or(z.literal('')).optional();

export const updateUserProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  profile: z
    .object({
      skills: z.array(z.string().max(50)).max(20).optional(),
      githubUsername: z.string().max(39).optional(),
      leetcodeUsername: z.string().max(50).optional(),
      portfolioUrl: urlOrEmpty,
      location: z.string().max(100).optional(),
      website: urlOrEmpty,
      linkedinUrl: urlOrEmpty,
      timezone: z.string().max(60).optional(),
      preferredLanguage: z.string().max(50).optional(),
    })
    .optional(),
});

export const updateAvatarSchema = z.object({
  avatarUrl: z.string().url(),
});

export const updateUserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      inApp: z.boolean().optional(),
      browser: z.boolean().optional(),
      taskAssigned: z.boolean().optional(),
      taskComment: z.boolean().optional(),
      mentions: z.boolean().optional(),
      projectUpdates: z.boolean().optional(),
      chatMessages: z.boolean().optional(),
      githubNotifications: z.boolean().optional(),
      leetcodeNotifications: z.boolean().optional(),
      teamActivity: z.boolean().optional(),
      documentUpdates: z.boolean().optional(),
    })
    .optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>;
export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;
